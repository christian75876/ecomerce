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
import { canAccessAdminPanel, isAdminRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { OrdersRepository } from '@/infrastructure/repositories/api/orders/OrdersRepository';
import type { IOrder } from '@/application/dtos/orders/response/OrderResponse';
import { playNotificationSound } from '@/shared/utils/notificationSound';

interface BaseNotification {
  id: string;
  read: boolean;
  createdAt: string;
}

export interface NewOrderNotification extends BaseNotification {
  type: 'new_order';
  orderId: string;
  customerName: string;
  total: number;
  itemCount: number;
  deliveryMethod: string | null;
}

export interface UserRegisteredNotification extends BaseNotification {
  type: 'user_registered';
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface InvitationAcceptedNotification extends BaseNotification {
  type: 'invitation_accepted';
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  storeName: string;
}

export type AdminNotification =
  | NewOrderNotification
  | UserRegisteredNotification
  | InvitationAcceptedNotification;

// Backward-compat alias
export type OrderNotification = AdminNotification;

interface ContextValue {
  notifications: AdminNotification[];
  unreadCount: number;
  latestNotification: AdminNotification | null;
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
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [latestNotification, setLatestNotification] = useState<AdminNotification | null>(null);
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

  // Sellers get order history pre-loaded; admins start fresh (their events are real-time only)
  const loadInitialOrders = useCallback(async () => {
    if (!canAccessAdminPanel() || isAdminRole()) return;
    try {
      const resp = await OrdersRepository.getOrders({ limit: 20 });
      const raw = resp.data as unknown as { items?: IOrder[] } | IOrder[];
      const orders: IOrder[] = Array.isArray(raw) ? raw : (raw as { items?: IOrder[] }).items ?? [];
      if (orders.length === 0) return;
      const mapped: NewOrderNotification[] = orders.map((o) => ({
        id: crypto.randomUUID(),
        type: 'new_order',
        orderId: o.id,
        customerName: `${o.customer?.firstName ?? ''} ${o.customer?.lastName ?? ''}`.trim() || 'Cliente',
        total: Number(o.total),
        itemCount: o.items?.length ?? 0,
        deliveryMethod: o.deliveryMethod ?? null,
        createdAt: o.createdAt,
        read: true,
      }));
      setNotifications(mapped);
    } catch {
      // non-critical
    }
  }, []);

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

        if (isAdminRole()) {
          // Admin: handle site-level events
          if (data.type === 'user_registered') {
            const n: UserRegisteredNotification = {
              id: crypto.randomUUID(),
              type: 'user_registered',
              userId: data.userId as number,
              firstName: data.firstName as string,
              lastName: data.lastName as string,
              email: data.email as string,
              createdAt: data.createdAt as string,
              read: false,
            };
            setNotifications((prev) => [n, ...prev].slice(0, 50));
            setLatestNotification(n);
            playNotificationSound();
          } else if (data.type === 'invitation_accepted') {
            const n: InvitationAcceptedNotification = {
              id: crypto.randomUUID(),
              type: 'invitation_accepted',
              userId: data.userId as number,
              firstName: data.firstName as string,
              lastName: data.lastName as string,
              email: data.email as string,
              storeName: data.storeName as string,
              createdAt: data.createdAt as string,
              read: false,
            };
            setNotifications((prev) => [n, ...prev].slice(0, 50));
            setLatestNotification(n);
            playNotificationSound();
          }
        } else {
          // Seller: handle order events
          if (data.type === 'new_order') {
            const n: NewOrderNotification = {
              id: crypto.randomUUID(),
              type: 'new_order',
              orderId: data.orderId as string,
              customerName: data.customerName as string,
              total: data.total as number,
              itemCount: data.itemCount as number,
              deliveryMethod: (data.deliveryMethod as string | null) ?? null,
              createdAt: data.createdAt as string,
              read: false,
            };
            setNotifications((prev) => {
              const alreadyExists = prev.some(
                (p) => p.type === 'new_order' && (p as NewOrderNotification).orderId === n.orderId,
              );
              if (alreadyExists) {
                return prev.map((p) =>
                  p.type === 'new_order' && (p as NewOrderNotification).orderId === n.orderId
                    ? { ...p, read: false }
                    : p,
                );
              }
              return [n, ...prev].slice(0, 50);
            });
            setLatestNotification(n);
            playNotificationSound();
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

    void loadInitialOrders();
    connect();

    return () => {
      mountedRef.current = false;
      esRef.current?.close();
      esRef.current = null;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [connect, loadInitialOrders]);

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
