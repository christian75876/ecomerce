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

// El index.html servido trae siempre el MISMO <title>/<meta description>
// genéricos y el mismo <link rel="canonical"> apuntando a "https://merku.co/"
// para CUALQUIER ruta (vienen fijos del build) — cada página los corrige del
// lado del cliente con react-helmet-async, pero eso depende de que el
// renderizador de Google ejecute el JS y capture el DOM ya actualizado antes
// de tomar esas señales. Si Google se queda con el HTML crudo (sin renderizar,
// que es lo que pasa en su primera pasada de rastreo), ve literalmente el
// mismo título/descripción/canonical en /home, /stores, /ayuda, etc. — y con
// el tiempo empezó a marcar cada vez más de esas páginas como "Soft 404"
// (parecen todas la misma página) y "Página alternativa con etiqueta
// canónica adecuada" (cree que la versión real de cada una es la raíz, que a
// su vez redirige de vuelta). Se corrige directo en el HTML de respuesta acá,
// con los mismos valores que ya usa cada página vía Helmet, para que el
// contenido sea correcto desde el primer byte sin depender de que el JS
// llegue a correr.
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
    const meta = STATIC_PAGE_META.get(url.pathname);

    if (meta && (response.headers.get('content-type') ?? '').includes('text/html')) {
      const canonicalUrl = `https://${CANONICAL_HOST}${url.pathname}`;
      return new HTMLRewriter()
        .on('title', {
          element(el) {
            el.setInnerContent(meta.title);
          },
        })
        .on('meta[name="description"]', {
          element(el) {
            el.setAttribute('content', meta.description);
          },
        })
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
