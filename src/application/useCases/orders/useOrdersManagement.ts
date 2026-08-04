import { useCallback, useEffect, useRef, useState } from 'react';
import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';
import { IOrder } from '@/application/dtos/orders/response/OrderResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { CustomersRepository } from '@/infrastructure/repositories/api/customers/CustomersRepository';
import { OrdersRepository } from '@/infrastructure/repositories/api/orders/OrdersRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { useAdminStore } from '@/shared/contexts/AdminStoreContext';
import { useOrderNotifications } from '@/shared/contexts/OrderNotificationsContext';

export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type CartRow = {
  productId: string;
  quantity: number;
};

const ORDERS_PER_PAGE = 20;

type OrdersPageRaw = {
  items: IOrder[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

export const useOrdersManagement = () => {
  const { selectedStoreId: contextStoreId } = useAdminStore();
  const { notifications } = useOrderNotifications();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [cartRows, setCartRows] = useState<CartRow[]>([
    { productId: '', quantity: 1 },
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = ORDERS_PER_PAGE;

  const loadOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrdersRepository.getOrders({
        storeId: contextStoreId,
        page,
        limit: ORDERS_PER_PAGE,
      });
      const raw = response.data as unknown as OrdersPageRaw;
      setOrders(raw.items ?? []);
      setCurrentPage(raw.page ?? 1);
      setTotalPages(raw.totalPages ?? 1);
      setTotalItems(raw.total ?? 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar pedidos',
      );
    } finally {
      setLoading(false);
    }
  }, [contextStoreId]);

  const loadScreen = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [customersResponse, productsResponse, ordersResponse] =
        await Promise.all([
          CustomersRepository.getCustomers(),
          ProductRepository.getProducts({ active: true }),
          OrdersRepository.getOrders({ storeId: contextStoreId, page: 1, limit: ORDERS_PER_PAGE }),
        ]);
      setCustomers((customersResponse.data as unknown as { items?: ICustomer[] }).items ?? []);
      setProducts((productsResponse.data as unknown as { items?: IProduct[] }).items ?? []);
      const raw = ordersResponse.data as unknown as OrdersPageRaw;
      setOrders(raw.items ?? []);
      setCurrentPage(raw.page ?? 1);
      setTotalPages(raw.totalPages ?? 1);
      setTotalItems(raw.total ?? 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar pedidos',
      );
    } finally {
      setLoading(false);
    }
  }, [contextStoreId]);

  useEffect(() => {
    void loadScreen();
  }, [loadScreen]);

  // Reload orders in the background without showing the loading spinner
  const silentReloadOrders = useCallback(async (page: number) => {
    try {
      const response = await OrdersRepository.getOrders({ storeId: contextStoreId, page, limit: ORDERS_PER_PAGE });
      const raw = response.data as unknown as OrdersPageRaw;
      setOrders(raw.items ?? []);
      setCurrentPage(raw.page ?? 1);
      setTotalPages(raw.totalPages ?? 1);
      setTotalItems(raw.total ?? 0);
    } catch { /* silent — don't surface background refresh errors */ }
  }, [contextStoreId]);

  // Use a ref so polling closure always has the current page without resetting the interval
  const currentPageRef = useRef(currentPage);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  // Immediate reload when SSE pushes a new notification (new order, etc.)
  const prevNotifCountRef = useRef(-1);
  useEffect(() => {
    if (prevNotifCountRef.current === -1) {
      prevNotifCountRef.current = notifications.length;
      return;
    }
    if (notifications.length > prevNotifCountRef.current) {
      prevNotifCountRef.current = notifications.length;
      void silentReloadOrders(currentPageRef.current);
    }
  }, [notifications.length, silentReloadOrders]);

  // Poll every 30 s for payment submissions and other changes without an SSE event
  useEffect(() => {
    const id = setInterval(() => void silentReloadOrders(currentPageRef.current), 30_000);
    return () => clearInterval(id);
  }, [silentReloadOrders]);

  const createCustomer = async () => {
    if (
      !newCustomer.firstName.trim() ||
      !newCustomer.lastName.trim() ||
      !newCustomer.email.trim()
    ) {
      setError('Completa nombre, apellido y correo del cliente');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await CustomersRepository.createCustomer(newCustomer);
      setCustomerId(response.data.id);
      setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' });
      await loadScreen();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible crear el cliente',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateCartRow = (index: number, patch: Partial<CartRow>) => {
    setCartRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };

  const addCartRow = () => {
    setCartRows((current) => [...current, { productId: '', quantity: 1 }]);
  };

  const createOrder = async () => {
    const validItems = cartRows.filter((row) => row.productId && row.quantity > 0);

    if (!customerId || validItems.length === 0) {
      setError('Selecciona cliente y al menos un producto');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await OrdersRepository.createOrder({
        customerId,
        items: validItems,
      });
      setCartRows([{ productId: '', quantity: 1 }]);
      await loadScreen();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible crear el pedido',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const changeOrderStatus = async (
    orderId: string,
    status: (typeof ORDER_STATUSES)[number],
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      await OrdersRepository.updateOrderStatus(orderId, { status });
      await loadScreen();
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar el estado del pedido',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const changePage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    await loadOrders(page);
  };

  const confirmPayment = async (orderId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const resp = await OrdersRepository.confirmPayment(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? resp.data : o)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar el pago');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    customers,
    products,
    orders,
    customerId,
    newCustomer,
    cartRows,
    loading,
    submitting,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCustomerId,
    setNewCustomer,
    updateCartRow,
    addCartRow,
    createCustomer,
    createOrder,
    changeOrderStatus,
    confirmPayment,
    changePage,
  };
};
