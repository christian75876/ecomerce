// Vercel Edge Middleware — injects per-page OG tags for social/messaging bots.
// Runs at the edge before the SPA rewrite, so bots get real OG data without executing JS.

const BOT_UA =
  /facebookexternalhit|facebot|twitterbot|whatsapp|telegrambot|slackbot|linkedinbot|discordbot|googlebot|bingbot|yandexbot|applebot/i;

const API_URL =
  (process.env.VITE_API_URL ?? process.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const config = {
  matcher: ['/product/:path+', '/stores/:path+'],
};

export default async function middleware(request: Request): Promise<Response | undefined> {
  const ua = request.headers.get('user-agent') ?? '';
  if (!BOT_UA.test(ua)) return undefined; // pass through — browser gets SPA via rewrite

  const { origin, pathname } = new URL(request.url);

  // skip /stores/map and any non-slug paths
  if (pathname === '/stores/map' || pathname === '/stores') return undefined;

  if (!API_URL) return undefined;

  try {
    // ── Product detail: /product/:id ──────────────────────────────
    const productMatch = pathname.match(/^\/product\/([^/]+)$/);
    if (productMatch) {
      const id = productMatch[1];
      const res = await fetch(`${API_URL}/products/${id}`);
      if (!res.ok) return undefined;

      const json = await res.json() as {
        data: { name: string; description: string; imageUrl?: string; price?: string; store?: { name: string } };
      };
      const p = json.data;

      const description = [
        p.description.slice(0, 160),
        p.store?.name ? `— ${p.store.name}` : '',
      ].filter(Boolean).join(' ');

      return buildResponse({
        title: `${p.name} — Merku`,
        description,
        image: p.imageUrl,
        url: `${origin}${pathname}`,
        type: 'product',
      });
    }

    // ── Store detail: /stores/:slug ───────────────────────────────
    const storeMatch = pathname.match(/^\/stores\/([^/]+)$/);
    if (storeMatch) {
      const slug = storeMatch[1];
      const res = await fetch(`${API_URL}/stores/slug/${slug}`);
      if (!res.ok) return undefined;

      const json = await res.json() as {
        data: { name: string; description?: string; bannerUrl?: string; logoUrl?: string };
      };
      const s = json.data;

      return buildResponse({
        title: `${s.name} — Merku`,
        description:
          s.description?.slice(0, 180) ??
          `Explora los productos de ${s.name} en Merku.`,
        image: s.bannerUrl ?? s.logoUrl,
        url: `${origin}${pathname}`,
        type: 'website',
      });
    }
  } catch {
    // on any error, fall through to the normal SPA
  }

  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────

interface OgParams {
  title: string;
  description: string;
  image?: string;
  url: string;
  type: string;
}

function buildResponse(params: OgParams): Response {
  return new Response(renderOgHtml(params), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function renderOgHtml({ title, description, image, url, type }: OgParams): string {
  const e = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const imgMeta = image
    ? `\n  <meta property="og:image" content="${e(image)}" />\n  <meta name="twitter:image" content="${e(image)}" />`
    : '';

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${e(title)}</title>
  <meta name="description" content="${e(description)}" />
  <meta property="og:title" content="${e(title)}" />
  <meta property="og:description" content="${e(description)}" />
  <meta property="og:url" content="${e(url)}" />
  <meta property="og:type" content="${e(type)}" />
  <meta property="og:site_name" content="Merku" />
  <meta property="og:locale" content="es_CO" />${imgMeta}
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${e(title)}" />
  <meta name="twitter:description" content="${e(description)}" />
  <meta http-equiv="refresh" content="0; url=${e(url)}" />
</head>
<body></body>
</html>`;
}
