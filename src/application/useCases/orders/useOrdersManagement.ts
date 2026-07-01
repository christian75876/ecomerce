import { useCallback, useEffect, useRef, useState } from 'react';
import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';
import { IOrder } from '@/application/dtos/orders/response/OrderResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { CustomersRepository } from '@/infrastructure/repositories/api/customers/CustomersRepository';
import { OrdersRepository } from '@/infrastructure/repositories/api/orders/OrdersRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';

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

const ORDERS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

export const useOrdersManagement = (filterStoreId?: string | null) => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [statusFilter, setStatusFilterState] = useState('');
  const [searchFilter, setSearchFilterState] = useState('');
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
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async (page: number, status: string, search: string) => {
    setOrdersLoading(true);
    try {
      const res = await OrdersRepository.getOrders(
        filterStoreId,
        page,
        ORDERS_PER_PAGE,
        status || undefined,
        search.trim() || undefined,
      );
      setOrders(res.data.items);
      setOrdersPage(res.data.page);
      setOrdersTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar pedidos');
    } finally {
      setOrdersLoading(false);
    }
  }, [filterStoreId]);

  const loadScreen = async () => {
    setLoading(true);
    setError(null);

    try {
      const [customersResponse, productsResponse, ordersResponse] =
        await Promise.all([
          CustomersRepository.getCustomers({
            storeId: filterStoreId ?? undefined,
            limit: 100,
          }),
          ProductRepository.getProducts({
            active: true,
            storeId: filterStoreId ?? undefined,
          }),
          OrdersRepository.getOrders(filterStoreId, 1, ORDERS_PER_PAGE),
        ]);
      setCustomers(customersResponse.data.items);
      setProducts(productsResponse.data.items);
      setOrders(ordersResponse.data.items);
      setOrdersPage(ordersResponse.data.page);
      setOrdersTotalPages(ordersResponse.data.totalPages);
      // Reset filters on store change
      setStatusFilterState('');
      setSearchFilterState('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar pedidos',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStoreId]);

  const setStatusFilter = (status: string) => {
    setStatusFilterState(status);
    void fetchOrders(1, status, searchFilter);
  };

  const setSearchFilter = (search: string) => {
    setSearchFilterState(search);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      void fetchOrders(1, statusFilter, search);
    }, SEARCH_DEBOUNCE_MS);
  };

  const goToOrdersPage = async (page: number) => {
    await fetchOrders(page, statusFilter, searchFilter);
  };

  const createCustomer = async () => {
    if (
      !newCustomer.firstName.trim() ||
      !newCustomer.lastName.trim() ||
      !newCustomer.email.trim()
    ) {
      setError('Completa nombre, apellido y correo del cliente');
      return false;
    }

    if (!filterStoreId) {
      setError('Selecciona una tienda para crear el cliente');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await CustomersRepository.createCustomer({
        ...newCustomer,
        storeId: filterStoreId,
      });
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

  const createOrder = async (delivery: {
    deliveryMethod: 'DELIVERY' | 'PICKUP';
    deliveryAddress?: string;
    deliveryCity?: string;
    deliveryDepartment?: string;
    deliveryNotes?: string;
  }) => {
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
        deliveryMethod: delivery.deliveryMethod,
        deliveryAddress: delivery.deliveryAddress || undefined,
        deliveryCity: delivery.deliveryCity || undefined,
        deliveryDepartment: delivery.deliveryDepartment || undefined,
        deliveryNotes: delivery.deliveryNotes || undefined,
      });
      setCartRows([{ productId: '', quantity: 1 }]);
      await fetchOrders(1, statusFilter, searchFilter);
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
      await fetchOrders(ordersPage, statusFilter, searchFilter);
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

  return {
    customers,
    products,
    orders,
    ordersPage,
    ordersTotalPages,
    statusFilter,
    searchFilter,
    goToOrdersPage,
    setStatusFilter,
    setSearchFilter,
    customerId,
    newCustomer,
    cartRows,
    loading: loading || ordersLoading,
    submitting,
    error,
    setCustomerId,
    setNewCustomer,
    updateCartRow,
    addCartRow,
    createCustomer,
    createOrder,
    changeOrderStatus,
  };
};
