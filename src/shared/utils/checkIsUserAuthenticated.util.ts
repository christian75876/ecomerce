import { authSession } from '@/shared/utils/authSession';

export const isAuthenticated = () => {
  const token = authSession.getToken();
  if (!token) return false;
  const expiry = authSession.getTokenExpiry();
  if (expiry !== null && expiry <= Date.now()) {
    authSession.clearToken();
    return false;
  }
  return true;
};

export const getAuthenticatedUser = () => authSession.getUser();

export const getAuthenticatedRole = () =>
  authSession.getUser()?.role?.toLowerCase() ?? null;

export const canAccessAdminPanel = () => {
  const role = getAuthenticatedRole();
  return role === 'admin' || role === 'seller';
};

export const isBuyerSession = () => getAuthenticatedRole() === 'buyer';
