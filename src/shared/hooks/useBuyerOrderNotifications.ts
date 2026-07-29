import { useCallback, useEffect, useRef } from 'react';
import { authSession } from '@/shared/utils/authSession';
import { isAuthenticated, canAccessAdminPanel } from '@/shared/utils/checkIsUserAuthenticated.util';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import { playNotificationSound } from '@/shared/utils/notificationSound';

const BASE = (import.meta.env.VITE_API_BASE_URL as string ?? 'http://127.0.0.1:3000/api/').replace(/\/$/, '');
const SSE_URL = `${BASE}/notifications/stream`;
const MAX_RETRY_DELAY = 30_000;

interface OrderStatusPayload {
  type: 'order_status_update';
  orderId: string;
  status: string;
  statusLabel: string;
  statusEmoji: string;
  storeName: string;
}

/**
 * Connects buyers to the SSE stream so they get real-time order status
 * updates on any page — not just on MyOrdersPage.
 * Admins/sellers are excluded (they use OrderNotificationsContext instead).
 */
export function useBuyerOrderNotifications() {
  const esRef = useRef<EventSource | null>(null);
  const retryDelayRef = useRef(1000);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (!isAuthenticated() || canAccessAdminPanel()) return; // only buyers

    const token = authSession.getToken();
    if (!token) return;

    esRef.current?.close();

    const es = new EventSource(`${SSE_URL}?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.onopen = () => {
      retryDelayRef.current = 1000;
    };

    es.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string) as Record<string, unknown>;
        if (data.type === 'order_status_update') {
          const p = data as unknown as OrderStatusPayload;
          playNotificationSound();
          SnackbarUtilities.success(
            `${p.statusEmoji} Tu pedido en ${p.storeName} está ${p.statusLabel.toLowerCase()}`,
            'top',
            'center',
          );
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      if (!mountedRef.current) return;
      const delay = retryDelayRef.current;
      retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY);
      retryTimerRef.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      esRef.current?.close();
      esRef.current = null;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [connect]);
}
