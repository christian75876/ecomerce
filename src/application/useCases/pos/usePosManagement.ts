import { useCallback, useEffect, useMemo, useState } from 'react';
import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { ISale } from '@/application/dtos/sales/response/SaleResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { CustomersRepository } from '@/infrastructure/repositories/api/customers/CustomersRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { SalesRepository } from '@/infrastructure/repositories/api/sales/SalesRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { useAdminStore } from '@/shared/contexts/AdminStoreContext';

export type PosCartItem = {
  product: IProduct;
  quantity: number;
};

export const usePosManagement = () => {
  const { selectedStoreId: contextStoreId } = useAdminStore();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [sales, setSales] = useState<ISale[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT'>('CASH');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScreen = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsResponse, salesResponse] = await Promise.all([
        ProductRepository.getProducts({
          active: true,
          search,
          storeId: selectedStoreId || undefined,
        }),
        SalesRepository.getSales(),
      ]);
      setProducts((productsResponse.data as unknown as { items?: IProduct[] }).items ?? []);
      setSales((salesResponse.data as unknown as { items?: ISale[] }).items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar POS');
    } finally {
      setLoading(false);
    }
  }, [search, selectedStoreId]);

  const loadSupportingData = useCallback(async () => {
    try {
      const isSeller = getAuthenticatedRole() === 'seller';
      if (isSeller) {
        const [customersResponse, storesResponse] = await Promise.all([
          CustomersRepository.getCustomers(),
          StoresRepository.getMyStores(),
        ]);
        setCustomers((customersResponse.data as unknown as { items?: ICustomer[] }).items ?? []);
        const storeList = storesResponse.data as unknown as IStore[];
        if (storeList.length > 0) {
          setSelectedStoreId(storeList[0].id);
        }
      } else {
        // Admin: only load customers; storeId is controlled by the navbar context
        const customersResponse = await CustomersRepository.getCustomers();
        setCustomers((customersResponse.data as unknown as { items?: ICustomer[] }).items ?? []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar datos POS',
      );
    }
  }, []);

  useEffect(() => {
    void loadScreen();
  }, [loadScreen]);

  useEffect(() => {
    void loadSupportingData();
  }, [loadSupportingData]);

  useEffect(() => {
    if (getAuthenticatedRole() === 'admin') {
      setSelectedStoreId(contextStoreId ?? '');
    }
  }, [contextStoreId]);

  useEffect(() => {
    if (paymentMethod !== 'CREDIT') {
      setSelectedCustomerId('');
    }
  }, [paymentMethod]);

  const addToCart = (product: IProduct) => {
    setCart((current) => {
      const existingItem = current.find((item) => item.product.id === product.id);
      if (existingItem) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const total = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + Number(item.product.price) * item.quantity,
        0,
      ),
    [cart],
  );

  const confirmSale = async () => {
    if (cart.length === 0) {
      setError('Agrega al menos un producto al carrito');
      return false;
    }

    if (!selectedStoreId) {
      setError('Selecciona una tienda para registrar la venta');
      return false;
    }

    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      setError('La venta a crédito requiere un cliente');
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      await SalesRepository.createSale({
        paymentMethod,
        customerId: selectedCustomerId || undefined,
        storeId: selectedStoreId,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      setCart([]);
      if (paymentMethod === 'CREDIT') {
        setSelectedCustomerId('');
      }
      await loadScreen();
      await loadSupportingData();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible registrar la venta',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    products,
    customers,
    cart,
    sales,
    search,
    selectedCustomerId,
    paymentMethod,
    loading,
    submitting,
    error,
    total,
    setSearch,
    setSelectedCustomerId,
    setPaymentMethod,
    addToCart,
    updateQuantity,
    confirmSale,
  };
};
