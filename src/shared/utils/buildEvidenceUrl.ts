import { authSession } from './authSession';

export const appendEvidenceToken = (url: string): string => {
  const token = authSession.getToken();
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
};

/**
 * Resolves an order's stored evidence path/URL for display. New uploads are
 * stored as a full Cloudinary URL (public, no auth needed); older orders
 * still have a relative `uploads/payment-evidence/...` path served from the
 * backend's JWT-gated static route, which needs the base URL + token.
 */
export const resolveEvidenceUrl = (path: string, baseUrl: string): string =>
  /^https?:\/\//i.test(path) ? path : appendEvidenceToken(`${baseUrl}/${path}`);
