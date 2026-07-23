import { useEffect, useRef } from 'react';
import { authSession } from '@/shared/utils/authSession';
import { handleUnauthorized } from '@/infrastructure/repositories/api/errors/ErrorUtils';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';

const REFRESH_BEFORE_MS = 5 * 60 * 1000; // refresh 5 min before expiry

export const useTokenRefresh = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRef = useRef<() => void>(() => {});

  useEffect(() => {
    const doRefresh = async () => {
      try {
        await AuthRepository.refreshToken();
        scheduleRef.current();
      } catch {
        handleUnauthorized();
      }
    };

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!authSession.getToken()) return;

      const expiry = authSession.getTokenExpiry();
      if (!expiry) return;

      const msLeft = expiry - Date.now();
      if (msLeft <= 0) {
        handleUnauthorized();
        return;
      }

      const delay = Math.max(msLeft - REFRESH_BEFORE_MS, 0);
      timerRef.current = setTimeout(() => void doRefresh(), delay);
    };

    scheduleRef.current = schedule;
    schedule();

    const onVisibility = () => {
      if (document.visibilityState !== 'visible' || !authSession.getToken()) return;
      const expiry = authSession.getTokenExpiry();
      if (expiry && expiry <= Date.now()) {
        handleUnauthorized();
      } else {
        schedule();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
};
