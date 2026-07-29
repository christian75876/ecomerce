import { useCallback, useEffect, useRef, useState } from 'react';
import { IOrder } from '@/application/dtos/orders/response/OrderResponse';
import { OrdersRepository } from '@/infrastructure/repositories/api/orders/OrdersRepository';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

const POLL_INTERVAL = 30_000;

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Pendiente',
  PAID:      'Pagado',
  PREPARING: 'En preparación',
  SHIPPED:   'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const useMyOrders = (orderId?: string) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [changedOrderIds, setChangedOrderIds] = useState<Set<string>>(new Set());

  const ordersRef = useRef<IOrder[]>([]);
  const selectedIdRef = useRef<string | undefined>(orderId);

  useEffect(() => { selectedIdRef.current = orderId; }, [orderId]);

  const applyOrders = useCallback((fresh: IOrder[]) => {
    // Detect status changes against previous snapshot
    const changed: IOrder[] = [];
    if (ordersRef.current.length > 0) {
      for (const o of fresh) {
        const prev = ordersRef.current.find((p) => p.id === o.id);
        if (prev && prev.status !== o.status) changed.push(o);
      }
    }

    ordersRef.current = fresh;
    setOrders(fresh);
    setLastUpdated(new Date());

    // Keep selectedOrder in sync without triggering a detail fetch
    const currentId = selectedIdRef.current;
    if (currentId) {
      const updated = fresh.find((o) => o.id === currentId);
      if (updated) setSelectedOrder(updated);
    }

    if (changed.length > 0) {
      const ids = new Set(changed.map((o) => o.id));
      setChangedOrderIds(ids);
      setTimeout(() => setChangedOrderIds(new Set()), 5000);

      changed.forEach((o) => {
        SnackbarUtilities.success(
          `Pedido #${o.id.slice(0, 8).toUpperCase()} → ${STATUS_LABELS[o.status] ?? o.status}`,
          'top',
          'center',
        );
      });
    }
  }, []);

  const loadOrders = useCallback(async (silent = false) => {
    if (silent) {
      setSyncing(true);
    } else {
      setLoadingList(true);
      setListError(null);
    }
    try {
      const response = await OrdersRepository.getMyOrders();
      applyOrders(response.data ?? []);
    } catch (err) {
      if (!silent) setListError(err instanceof Error ? err.message : 'No fue posible cargar tus pedidos');
    } finally {
      if (silent) setSyncing(false);
      else setLoadingList(false);
    }
  }, [applyOrders]);

  const loadOrder = useCallback(async () => {
    if (!orderId) { setSelectedOrder(null); setDetailError(null); return; }

    // Use cached version from list if available to avoid an extra request
    const cached = ordersRef.current.find((o) => o.id === orderId);
    if (cached) { setSelectedOrder(cached); return; }

    setLoadingDetail(true);
    setDetailError(null);
    try {
      const response = await OrdersRepository.getMyOrderById(orderId);
      setSelectedOrder(response.data);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'No fue posible cargar el pedido');
      setSelectedOrder(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [orderId]);

  // Initial load
  useEffect(() => { void loadOrders(); }, [loadOrders]);

  // Load detail when orderId changes
  useEffect(() => { void loadOrder(); }, [loadOrder]);

  // Polling: every 30s, pauses while tab is hidden; refreshes immediately on tab focus
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) void loadOrders(true);
    }, POLL_INTERVAL);

    const onVisibility = () => {
      if (!document.hidden) void loadOrders(true);
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadOrders]);

  return {
    orders,
    selectedOrder,
    loadingList,
    loadingDetail,
    listError,
    detailError,
    lastUpdated,
    syncing,
    changedOrderIds,
  };
};
