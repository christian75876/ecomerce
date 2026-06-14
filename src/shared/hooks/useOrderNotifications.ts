import { useEffect, useRef, useState } from 'react';
import { authSession } from '@/shared/utils/authSession';
import { canAccessAdminPanel } from '@/shared/utils/checkIsUserAuthenticated.util';

export interface OrderNotification {
  id: string;
  orderId: string;
  customerName: string;
  total: number;
  itemCount: number;
  deliveryMethod: string | null;
  createdAt: string;
  read: boolean;
}

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000/api/';
const SSE_URL = BASE.replace(/\/$/, '') + '/notifications/stream';

export const useOrderNotifications = () => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const esRef = useRef<EventSource | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  useEffect(() => {
    if (!canAccessAdminPanel()) return;

    const token = authSession.getToken();
    if (!token) return;

    const url = `${SSE_URL}?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data.type === 'new_order') {
          const notification: OrderNotification = {
            id: crypto.randomUUID(),
            orderId: data.orderId as string,
            customerName: data.customerName as string,
            total: data.total as number,
            itemCount: data.itemCount as number,
            deliveryMethod: data.deliveryMethod as string | null,
            createdAt: data.createdAt as string,
            read: false,
          };
          setNotifications((prev) => [notification, ...prev].slice(0, 50));
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  return { notifications, unreadCount, markAllRead, markRead };
};
