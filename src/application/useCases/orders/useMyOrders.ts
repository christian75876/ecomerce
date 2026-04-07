import { useCallback, useEffect, useState } from 'react';
import { IOrder } from '@/application/dtos/orders/response/OrderResponse';
import { OrdersRepository } from '@/infrastructure/repositories/api/orders/OrdersRepository';

export const useMyOrders = (orderId?: string) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrdersRepository.getMyOrders();
      setOrders(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar tus pedidos',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setSelectedOrder(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await OrdersRepository.getMyOrderById(orderId);
      setSelectedOrder(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar el pedido',
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  return {
    orders,
    selectedOrder,
    loading,
    error,
  };
};
