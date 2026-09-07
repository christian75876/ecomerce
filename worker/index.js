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

const BOT_UA =
  /facebookexternalhit|facebot|twitterbot|whatsapp|telegrambot|slackbot|linkedinbot|discordbot|googlebot|bingbot|yandexbot|applebot/i;

const CANONICAL_HOST = 'merku.co';
const API_URL = 'https://api.merku.co';

// Rutas estáticas cuyo <link rel="canonical"> en el index.html servido es
// SIEMPRE "https://merku.co/" (viene fijo del build, VITE_APP_URL + "/") —
// cada página lo corrige del lado del cliente con react-helmet-async, pero
// eso depende de que el renderizador de Google ejecute el JS y capture el
// DOM ya actualizado antes de tomar la señal de canonical. Cuando no coincide
// con el HTML crudo, Search Console reporta "Página alternativa con etiqueta
// canónica adecuada" (deja de indexar la página porque cree que su versión
// canónica es la raíz) — y como "/" a su vez redirige de vuelta a "/home",
// eso también se vio como Soft 404 para "/" y "www./". Se corrige el href
// directo en el HTML de respuesta, sin depender de que el JS llegue a correr.
const STATIC_CANONICAL_PATHS = new Set([
  '/bienvenida',
  '/home',
  '/stores',
  '/stores/map',
  '/ayuda',
  '/terminos',
  '/privacidad',
]);

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
      }
    }

    const response = await env.ASSETS.fetch(request);

    if (
      STATIC_CANONICAL_PATHS.has(url.pathname) &&
      (response.headers.get('content-type') ?? '').includes('text/html')
    ) {
      const canonicalUrl = `https://${CANONICAL_HOST}${url.pathname}`;
      return new HTMLRewriter()
        .on('link[rel="canonical"]', {
          element(el) {
            el.setAttribute('href', canonicalUrl);
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
