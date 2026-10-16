// Cloudflare Worker — corre antes de servir los assets estáticos de la SPA.
//
// Reemplaza el middleware.ts / vercel.json (Vercel Edge Middleware) que quedó
// huérfano al migrar el hosting a Cloudflare Workers — nunca se ejecutaba aquí,
// así que bots como Facebook/Twitter/WhatsApp o el crawler inicial de Google
// siempre veían el título/descripción genérico del index.html para CUALQUIER
// producto o tienda, en vez del contenido específico de cada uno.
//
// Responsabilidades:
//   1. Canonicalizar la URL (https, sin "www", sin slash final, "/" -> "/home")
//      con un 301 antes de que nada más se ejecute.
//   2. Para bots que no ejecutan JS, servir el HTML con OG tags ya generado
//      por el backend (/og/product/:id, /og/store/:slug) en vez de la SPA vacía.
//   3. Para esos mismos bots, servir /bienvenida, /ayuda, /terminos y
//      /privacidad con el HTML prerenderizado en build (scripts/prerender.mjs)
//      dentro de #root, en vez de la SPA vacía.
//   4. Cualquier otra request sigue el flujo normal (assets estáticos / SPA).

import { PAGE_META } from '../src/shared/constants/pageMeta.ts';
// Lo genera `npm run build` (scripts/prerender.mjs): sin build previo, el
// deploy falla aquí, igual que fallaría por no existir dist/.
import PRERENDERED from './prerendered.generated.js';

// Incluye los rastreadores de buscadores con IA (ChatGPT, Claude, Perplexity,
// DuckDuckGo): ninguno ejecuta JS, así que sin esto veían solo
// `<div id="root"></div>` y no podían citar productos ni tiendas.
const BOT_UA =
  /facebookexternalhit|facebot|twitterbot|whatsapp|telegrambot|slackbot|linkedinbot|discordbot|googlebot|google-inspectiontool|bingbot|yandexbot|applebot|duckduckbot|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-searchbot|claude-user|perplexitybot|perplexity-user|ccbot|amazonbot/i;

// Rutas que existen en la SPA (espejo de src/shared/constants/routes.ts —
// mantener sincronizado). Cualquier otra URL se sirve con la SPA (que pinta
// NotFoundPage) pero con status 404 real: antes respondía 200 y Google las
// marcaba como "Soft 404".
const KNOWN_ROUTES = [
  /^\/(home|bienvenida|auth|register|verify-email|forgot-password|stores|cart|favorites|my-orders|ayuda|terminos|privacidad)$/,
  /^\/stores\/[^/]+$/,
  /^\/my-orders\/[^/]+$/,
  /^\/product\/[^/]+$/,
  /^\/(dashboard|categories|inventory|pos|orders|suppliers|purchases|customers|cash|audit|tracking|products|profile|coupons|sales-history)$/,
  /^\/admin\/(stores|store|invitations|users|subscriptions|advertising)$/,
];

const CANONICAL_HOST = 'merku.co';
const API_URL = 'https://api.merku.co';

// El <title> del index.html servido venía siempre fijo/genérico para
// CUALQUIER ruta — cada página lo corrige del lado del cliente con
// react-helmet-async, pero eso depende de que el renderizador de Google
// ejecute el JS y capture el DOM ya actualizado antes de tomar esa señal. Si
// Google se queda con el HTML crudo (sin renderizar, que es lo que pasa en su
// primera pasada de rastreo), veía literalmente el mismo título en /home,
// /stores, /ayuda, etc. — y empezó a marcar cada vez más de esas páginas como
// "Soft 404" (parecen todas la misma página). <link rel="canonical"> y
// <meta name="description"> tuvieron el mismo problema en su momento, pero
// un commit posterior (index.html) los QUITÓ del HTML estático por completo
// (para no duplicarlos con los que ya inyecta Helmet) — así que ahora no
// basta con reescribirlos si existen: hay que insertarlos cuando faltan.
// Los textos viven en src/shared/constants/pageMeta.ts (los mismos del
// <Helmet> de cada página).
const STATIC_PAGE_META = new Map(Object.entries(PAGE_META));

// Las respuestas del backend para bots (y el sitemap) se cachean en el edge
// de Cloudflare: sin esto, cada visita de un bot hacía un viaje completo
// hasta el servidor en Alemania (~0.8 s de TTFB). 5 minutos de desfase en un
// listado de productos no le importa a un buscador.
const OG_CACHE = { cacheTtlByStatus: { '200-299': 300, 301: 300, 404: 60, '500-599': 0 } };
const SITEMAP_CACHE = { cacheTtlByStatus: { '200-299': 600, '500-599': 0 } };

// Mismo nav/footer que el HTML para bots del backend (og-preview.controller.ts):
// las páginas que en la app viven dentro del layout no traen el suyo.
const BOT_NAV =
  '<header><nav aria-label="Principal"><a href="https://merku.co/home">Merku</a> · <a href="https://merku.co/home">Productos</a> · <a href="https://merku.co/stores">Tiendas</a> · <a href="https://merku.co/stores/map">Mapa de tiendas</a> · <a href="https://merku.co/bienvenida">Vende en Merku</a> · <a href="https://merku.co/ayuda">Ayuda</a></nav></header>';
const BOT_FOOTER =
  '<footer><p>Merku — marketplace de tiendas y restaurantes locales en Colombia.</p><p><a href="https://merku.co/bienvenida">Vende en Merku</a> · <a href="https://merku.co/ayuda">Centro de ayuda</a> · <a href="https://merku.co/terminos">Términos y condiciones</a> · <a href="https://merku.co/privacidad">Política de privacidad</a></p></footer>';

function escapeHtmlAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let redirected = false;

    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      redirected = true;
    }
    if (url.hostname !== CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      redirected = true;
    }
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.replace(/\/+$/, '');
      redirected = true;
    }
    if (url.pathname === '/') {
      url.pathname = '/home';
      redirected = true;
    }

    if (redirected) {
      return Response.redirect(url.toString(), 301);
    }

    // El sitemap real vive en el backend (sus <loc> ya apuntan a merku.co) y
    // robots.txt lo declara ahí — pero /sitemap.xml en el dominio principal
    // caía en el catch-all de la SPA, devolviendo el HTML del index en vez del
    // XML: cualquier herramienta o crawler que lo pida directo en este dominio
    // (en vez de seguir robots.txt) recibía contenido inválido.
    if (url.pathname === '/sitemap.xml') {
      const res = await fetch(`${API_URL}/sitemap.xml`, { cf: SITEMAP_CACHE });
      if (res.ok) {
        return new Response(res.body, {
          status: 200,
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });
      }
      // Nunca caer al HTML de la SPA: un 503 le dice a Google "reintenta luego"
      // en vez de hacerle leer un sitemap inválido.
      return new Response('Sitemap temporalmente no disponible', {
        status: 503,
        headers: { 'Retry-After': '300' },
      });
    }

    const userAgent = request.headers.get('user-agent') ?? '';
    if (BOT_UA.test(userAgent)) {
      const productMatch = url.pathname.match(/^\/product\/([^/]+)$/);
      const storeMatch = url.pathname.match(/^\/stores\/([^/]+)$/);

      if (productMatch) {
        const ogResponse = await fetchOg(`${API_URL}/og/product/${productMatch[1]}`, userAgent);
        if (ogResponse) return ogResponse;
      } else if (storeMatch && url.pathname !== '/stores/map') {
        const ogResponse = await fetchOg(`${API_URL}/og/store/${storeMatch[1]}`, userAgent);
        if (ogResponse) return ogResponse;
      } else if (url.pathname === '/home') {
        // El <body> de la SPA está vacío hasta que corre el JS — Search Console
        // marcó /home como Soft 404 porque evalúa el contenido visible, no solo
        // los metadatos (que ya se corrigen más abajo para el resto de visitas).
        // A Googlebot (y demás bots) se les sirve una versión con productos
        // reales en vez de la SPA vacía.
        const ogResponse = await fetchOg(`${API_URL}/og/home`, userAgent);
        if (ogResponse) return ogResponse;
      } else if (url.pathname === '/stores') {
        const ogResponse = await fetchOg(`${API_URL}/og/stores`, userAgent);
        if (ogResponse) return ogResponse;
      } else if (url.pathname === '/stores/map') {
        // El mapa (Leaflet) no tiene versión en texto: su contenido real es el
        // listado de tiendas, el mismo de /og/stores, con los metadatos del mapa.
        const ogResponse = await fetchOg(`${API_URL}/og/stores`, userAgent);
        if (ogResponse && ogResponse.status === 200) return withPageMeta(ogResponse, url.pathname);
      }
    }

    const response = await env.ASSETS.fetch(request);
    const isHtml = (response.headers.get('content-type') ?? '').includes('text/html');

    const prerendered = PRERENDERED[url.pathname];
    if (prerendered && isHtml && BOT_UA.test(userAgent)) {
      return servePrerendered(response, prerendered);
    }

    if (isHtml && !KNOWN_ROUTES.some((re) => re.test(url.pathname))) {
      return new Response(response.body, {
        status: 404,
        headers: response.headers,
      });
    }

    const meta = STATIC_PAGE_META.get(url.pathname);

    if (meta && isHtml) {
      const canonicalUrl = `https://${CANONICAL_HOST}${url.pathname}`;
      // index.html ya no trae <link rel="canonical"> ni <meta name="description">
      // estáticos (se quitaron para no duplicar los que agrega Helmet) — hay que
      // insertarlos en <head>, no reescribirlos, porque ya no existen de entrada.
      // data-rh="true" los marca como propios de react-helmet-async: al montar,
      // Helmet los reemplaza en vez de añadir un segundo canonical/description.
      const injected =
        `<meta name="description" content="${escapeHtmlAttr(meta.description)}" data-rh="true">` +
        `<link rel="canonical" href="${canonicalUrl}" data-rh="true">`;
      return new HTMLRewriter()
        .on('title', {
          element(el) {
            el.setInnerContent(meta.title);
          },
        })
        .on('head', {
          element(el) {
            el.append(injected, { html: true });
          },
        })
        .transform(response);
    }

    return response;
  },
};

// index.html real (estilos, scripts y JSON-LD de Organization incluidos) con
// el contenido de la página ya renderizado dentro de #root y los metadatos de
// su <Helmet>. Al ejecutar el JS, React reemplaza #root con lo mismo.
function servePrerendered(response, { head, body, standalone }) {
  const content = standalone ? body : `${BOT_NAV}<main>${body}</main>${BOT_FOOTER}`;
  return new HTMLRewriter()
    // Los valores por defecto del index.html (title y tags data-rh) se
    // reemplazan por los de la página: si no, quedarían duplicados.
    .on('title', { element: (el) => el.remove() })
    .on('[data-rh="true"]', { element: (el) => el.remove() })
    .on('head', { element: (el) => el.append(head, { html: true }) })
    .on('#root', { element: (el) => el.setInnerContent(content, { html: true }) })
    .transform(response);
}

// Reescribe título, descripción y URL canónica de un HTML del backend con los
// de otra ruta (PAGE_META).
function withPageMeta(response, pathname) {
  const meta = STATIC_PAGE_META.get(pathname);
  const canonicalUrl = `https://${CANONICAL_HOST}${pathname}`;
  const setContent = (value) => ({ element: (el) => el.setAttribute('content', value) });
  return new HTMLRewriter()
    .on('title', { element: (el) => el.setInnerContent(meta.title) })
    .on('h1', { element: (el) => el.setInnerContent(meta.title.replace(/ — Merku$/, '')) })
    .on('meta[name="description"]', setContent(meta.description))
    .on('meta[property="og:description"]', setContent(meta.description))
    .on('meta[name="twitter:description"]', setContent(meta.description))
    .on('meta[property="og:title"]', setContent(meta.title))
    .on('meta[name="twitter:title"]', setContent(meta.title))
    .on('meta[property="og:url"]', setContent(canonicalUrl))
    .on('link[rel="canonical"]', { element: (el) => el.setAttribute('href', canonicalUrl) })
    .transform(response);
}

async function fetchOg(ogUrl, userAgent) {
  try {
    const res = await fetch(ogUrl, {
      headers: { 'user-agent': userAgent },
      redirect: 'manual',
      cf: OG_CACHE,
    });
    // 301 = el backend pide la URL canónica (p. ej. /product/<uuid> ->
    // /product/<slug>-<uuid>): se propaga tal cual.
    if (res.status === 301) {
      const location = res.headers.get('location');
      if (location) return Response.redirect(location, 301);
    }
    // 404/410 = producto o tienda inexistente o inactivo: se propaga el status
    // real (antes caía a la SPA con 200 y Google lo marcaba como Soft 404).
    if (res.status === 404 || res.status === 410) {
      return new Response(res.body, {
        status: res.status,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    // El endpoint devuelve 302 hacia la página real para visitantes normales
    // (sin user-agent de bot) — si eso pasa aquí es que no reconoció el bot,
    // así que dejamos que la SPA normal se sirva en vez de seguir el redirect.
    if (!res.ok) return null;
    return new Response(res.body, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return null;
  }
}
