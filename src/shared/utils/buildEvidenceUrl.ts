import { authSession } from './authSession';

export const appendEvidenceToken = (url: string): string => {
  const token = authSession.getToken();
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
};
