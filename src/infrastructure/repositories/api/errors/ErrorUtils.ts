import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

/**
 * Handles unauthorized access errors (401).
 * - Clears authentication tokens.
 * - Redirects user to the login page using React Router.
 * - Optionally, triggers a global logout event.
 */
export const handleUnauthorized = () => {
  // Only act if the user actually had an active session.
  // Ignore 401s that come from unauthenticated calls on public pages.
  const hasToken =
    localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!hasToken) return;

  console.warn('[AUTH ERROR]: User session expired. Logging out...');

  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  const logoutEvent = new CustomEvent('logout');
  window.dispatchEvent(logoutEvent);
};

/**
 * Custom hook that listens for unauthorized events and redirects to login.
 */
export const useHandleUnauthorized = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      handleUnauthorized();
      navigate(ROUTES.PUBLIC.LOGIN);
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, [navigate]);
};
