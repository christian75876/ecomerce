const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:3000/api';

const normalizedApiOrigin = rawApiBaseUrl.replace(/\/api\/?$/, '');

export const buildAssetUrl = (path?: string | null) => {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${normalizedApiOrigin}${path.startsWith('/') ? path : `/${path}`}`;
};

const CLOUDINARY_UPLOAD_MARKER = '/upload/';

const isCloudinaryUrl = (url: string): boolean =>
  /(^|\.)res\.cloudinary\.com\//.test(url) && url.includes(CLOUDINARY_UPLOAD_MARKER);

/**
 * Injects a Cloudinary transformation (e.g. "f_auto,q_auto,w_480") right
 * after /upload/ in a Cloudinary delivery URL. Returns the URL unchanged for
 * anything else (local /uploads paths, other hosts) — those don't support
 * this and would otherwise 404 or just ignore the segment.
 */
export const cloudinaryTransform = (url: string, transformation: string): string =>
  isCloudinaryUrl(url)
    ? url.replace(CLOUDINARY_UPLOAD_MARKER, `${CLOUDINARY_UPLOAD_MARKER}${transformation}/`)
    : url;

/** Builds a `srcset` string of Cloudinary width variants; a no-op (same URL repeated) for non-Cloudinary images. */
export const buildResponsiveSrcSet = (url: string, widths: number[]): string =>
  widths.map((w) => `${cloudinaryTransform(url, `f_auto,q_auto,w_${w}`)} ${w}w`).join(', ');
