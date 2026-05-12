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
