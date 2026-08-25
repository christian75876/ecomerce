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

const BASE = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000/api/';
const SSE_URL = BASE.replace(/\/$/, '') + '/notifications/stream';
const MAX_RETRY_DELAY = 30_000;
const STORAGE_KEY = 'bb_read_notification_ids';

// ── localStorage helpers for read state persistence ──────────────────────────
const getReadIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
};

const persistRead = (id: string) => {
  try {
    const ids = getReadIds();
    ids.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids].slice(-300)));
  } catch { /* ignore */ }
};

const persistReadMany = (ids: string[]) => {
  try {
    const existing = getReadIds();
    ids.forEach((id) => existing.add(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing].slice(-300)));
  } catch { /* ignore */ }
};

export const OrderNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [latestNotification, setLatestNotification] = useState<AdminNotification | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const esRef = useRef<EventSource | null>(null);
  const retryDelayRef = useRef(1000);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback((id: string) => {
    persistRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      persistReadMany(prev.map((n) => n.id));
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const dismissLatest = () => setLatestNotification(null);

  // Pre-load recent order history. Uses orderId as stable notification ID so
  // localStorage read state survives page reloads and SSE deduplication works.
  const loadInitialOrders = useCallback(async () => {
    if (!canAccessAdminPanel()) return;
    try {
      const resp = await OrdersRepository.getOrders({ limit: 20 });
      const orders = resp.data.items;
      if (orders.length === 0) return;
      const readIds = getReadIds();
      const mapped: NewOrderNotification[] = orders.map((o) => ({
        id: o.id,
        type: 'new_order',
        orderId: o.id,
        customerName: `${o.customer?.firstName ?? ''} ${o.customer?.lastName ?? ''}`.trim() || 'Cliente',
        total: Number(o.total),
        itemCount: o.items?.length ?? 0,
        deliveryMethod: o.deliveryMethod ?? null,
        createdAt: o.createdAt,
        read: readIds.has(o.id),
      }));
      // Merge: don't overwrite SSE notifications that arrived before this load
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newOnes = mapped.filter((m) => !existingIds.has(m.id));
        return [...prev, ...newOnes];
      });
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

        if (data.type === 'new_order') {
          const orderId = data.orderId as string;
          const n: NewOrderNotification = {
            id: orderId,
            type: 'new_order',
            orderId,
            customerName: data.customerName as string,
            total: data.total as number,
            itemCount: data.itemCount as number,
            deliveryMethod: (data.deliveryMethod as string | null) ?? null,
            createdAt: data.createdAt as string,
            read: false,
          };
          setNotifications((prev) => {
            const existing = prev.find((p) => p.id === orderId);
            if (existing) {
              return prev.map((p) => (p.id === orderId ? { ...p, read: false } : p));
            }
            return [n, ...prev].slice(0, 50);
          });
          setLatestNotification(n);
          playNotificationSound();
        } else if (isAdminRole()) {
          if (data.type === 'user_registered') {
            const id = `user_registered_${data.userId as number}`;
            const n: UserRegisteredNotification = {
              id,
              type: 'user_registered',
              userId: data.userId as number,
              firstName: data.firstName as string,
              lastName: data.lastName as string,
              email: data.email as string,
              createdAt: data.createdAt as string,
              read: getReadIds().has(id),
            };
            setNotifications((prev) => {
              if (prev.find((p) => p.id === id)) return prev;
              return [n, ...prev].slice(0, 50);
            });
            if (!n.read) {
              setLatestNotification(n);
              playNotificationSound();
            }
          } else if (data.type === 'invitation_accepted') {
            const id = `invitation_accepted_${data.userId as number}`;
            const n: InvitationAcceptedNotification = {
              id,
              type: 'invitation_accepted',
              userId: data.userId as number,
              firstName: data.firstName as string,
              lastName: data.lastName as string,
              email: data.email as string,
              storeName: data.storeName as string,
              createdAt: data.createdAt as string,
              read: getReadIds().has(id),
            };
            setNotifications((prev) => {
              if (prev.find((p) => p.id === id)) return prev;
              return [n, ...prev].slice(0, 50);
            });
            if (!n.read) {
              setLatestNotification(n);
              playNotificationSound();
            }
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
