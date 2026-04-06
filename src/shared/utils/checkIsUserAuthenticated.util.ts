import { authSession } from '@/shared/utils/authSession';

export const isAuthenticated = () => Boolean(authSession.getToken());

export const getAuthenticatedUser = () => authSession.getUser();

export const getAuthenticatedRole = () =>
  authSession.getUser()?.role?.toLowerCase() ?? null;

export const canAccessAdminPanel = () => {
  const role = getAuthenticatedRole();
  return role === 'admin' || role === 'seller';
};

export const isBuyerSession = () => getAuthenticatedRole() === 'buyer';
