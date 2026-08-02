import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

const PUBLIC_PATHS = [
  ROUTES.PUBLIC.LANDING,
  ROUTES.PUBLIC.LOGIN,
  ROUTES.PUBLIC.REGISTER,
  ROUTES.PUBLIC.FORGOT_PASSWORD,
  ROUTES.PUBLIC.STORES,
  ROUTES.PUBLIC.HOME,
];

export const handleUnauthorized = () => {
  console.warn('[AUTH ERROR]: User session expired. Logging out...');
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  const logoutEvent = new CustomEvent('logout');
  window.dispatchEvent(logoutEvent);
};

export const useHandleUnauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleLogout = () => {
      handleUnauthorized();
      const isPublic = PUBLIC_PATHS.some((p) => location.pathname === p || location.pathname.startsWith('/stores/') || location.pathname.startsWith('/product/'));
      if (!isPublic) {
        navigate(ROUTES.PUBLIC.LOGIN);
      }
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, [navigate, location]);
};
