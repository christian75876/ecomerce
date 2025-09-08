import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Handles unauthorized access errors (401).
 * - Clears authentication tokens.
 * - Redirects user to the login page using React Router.
 * - Optionally, triggers a global logout event.
 */
export const handleUnauthorized = () => {
  console.warn('[AUTH ERROR]: User session expired. Logging out...');

  // 1️⃣ Clear authentication tokens
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  // 2️⃣ Dispatch a logout event for global state managers
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
      navigate('/login');
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, [navigate]);
};