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

    return env.ASSETS.fetch(request);
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
