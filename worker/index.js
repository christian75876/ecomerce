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
//   3. Cualquier otra request sigue el flujo normal (assets estáticos / SPA).

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
const STATIC_PAGE_META = new Map([
  ['/bienvenida', {
    title: 'Merku — Abre tu tienda online y vende más',
    description: 'Merku es la plataforma para abrir tu tienda online, gestionar inventario, recibir pedidos y vender más. Gratis para empezar.',
  }],
  ['/home', {
    title: 'Merku — Encuentra lo que buscas',
    description: 'Merku: explora cientos de productos de tiendas locales. Encuentra lo que necesitas al mejor precio.',
  }],
  ['/stores', {
    title: 'Tiendas disponibles — Merku',
    description: 'Explora todas las tiendas y restaurantes disponibles en Merku. Encuentra productos locales y realiza tu pedido.',
  }],
  ['/stores/map', {
    title: 'Mapa de tiendas — Merku',
    description: 'Encuentra tiendas cercanas, obtén indicaciones y explora el catálogo de cada tienda.',
  }],
  ['/ayuda', {
    title: 'Centro de ayuda — Merku',
    description: 'Encuentra respuestas sobre cómo usar Merku: gestión de tienda, pedidos, inventario, POS y más.',
  }],
  ['/terminos', {
    title: 'Términos y condiciones — Merku',
    description: 'Consulta los términos y condiciones de uso de Merku, la plataforma de marketplace y gestión de tiendas locales en Colombia.',
  }],
  ['/privacidad', {
    title: 'Política de privacidad — Merku',
    description: 'Conoce cómo Merku recopila, usa y protege tus datos personales conforme a la Ley 1581 de 2012 de Colombia.',
  }],
]);

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
      const res = await fetch(`${API_URL}/sitemap.xml`);
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
      }
    }

    const response = await env.ASSETS.fetch(request);
    const isHtml = (response.headers.get('content-type') ?? '').includes('text/html');

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

async function fetchOg(ogUrl, userAgent) {
  try {
    const res = await fetch(ogUrl, {
      headers: { 'user-agent': userAgent },
      redirect: 'manual',
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
