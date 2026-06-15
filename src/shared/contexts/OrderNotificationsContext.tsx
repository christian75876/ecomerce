import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
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

interface ContextValue {
  notifications: OrderNotification[];
  unreadCount: number;
  latestNotification: OrderNotification | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismissLatest: () => void;
}

const OrderNotificationsContext = createContext<ContextValue | null>(null);

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000/api/';
const SSE_URL = BASE.replace(/\/$/, '') + '/notifications/stream';
const MAX_RETRY_DELAY = 30_000;

export const OrderNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [latestNotification, setLatestNotification] = useState<OrderNotification | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const esRef = useRef<EventSource | null>(null);
  const retryDelayRef = useRef(1000);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const dismissLatest = () => setLatestNotification(null);

  const connect = useCallback(() => {
    if (!mountedRef.current || !canAccessAdminPanel()) return;
    const token = authSession.getToken();
    if (!token) return;

    esRef.current?.close();
    setConnectionStatus('connecting');

    const es = new EventSource(`${SSE_URL}?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) return;
      setConnectionStatus('connected');
      retryDelayRef.current = 1000;
    };

    es.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string) as Record<string, unknown>;
        if (data.type === 'new_order') {
          const n: OrderNotification = {
            id: crypto.randomUUID(),
            orderId: data.orderId as string,
            customerName: data.customerName as string,
            total: data.total as number,
            itemCount: data.itemCount as number,
            deliveryMethod: (data.deliveryMethod as string | null) ?? null,
            createdAt: data.createdAt as string,
            read: false,
          };
          setNotifications((prev) => [n, ...prev].slice(0, 50));
          setLatestNotification(n);

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Nuevo pedido recibido', {
              body: `${n.customerName} · ${n.itemCount} ${n.itemCount === 1 ? 'artículo' : 'artículos'}`,
              icon: '/icons/icon-192.png',
            });
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      if (!mountedRef.current) return;
      setConnectionStatus('disconnected');
      const delay = retryDelayRef.current;
      retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY);
      retryTimerRef.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!canAccessAdminPanel()) return;

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    connect();

    return () => {
      mountedRef.current = false;
      esRef.current?.close();
      esRef.current = null;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [connect]);

  return (
    <OrderNotificationsContext.Provider
      value={{ notifications, unreadCount, latestNotification, connectionStatus, markAllRead, markRead, dismissLatest }}
    >
      {children}
    </OrderNotificationsContext.Provider>
  );
};

export const useOrderNotifications = (): ContextValue => {
  const ctx = useContext(OrderNotificationsContext);
  if (!ctx) throw new Error('useOrderNotifications must be used inside OrderNotificationsProvider');
  return ctx;
};
