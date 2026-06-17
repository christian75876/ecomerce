import { useCallback, useEffect, useMemo, useState } from 'react';
import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { ISale } from '@/application/dtos/sales/response/SaleResponse';
import { CashRepository } from '@/infrastructure/repositories/api/cash/CashRepository';
import { CustomersRepository } from '@/infrastructure/repositories/api/customers/CustomersRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { SalesRepository } from '@/infrastructure/repositories/api/sales/SalesRepository';

export type PosCartItem = {
  product: IProduct;
  quantity: number;
};

export const usePosManagement = (storeId?: string | null) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [sales, setSales] = useState<ISale[]>([]);
  const [salesPage, setSalesPage] = useState(1);
  const [salesTotalPages, setSalesTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCashSessionId, setSelectedCashSessionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT'>('CASH');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptSale, setReceiptSale] = useState<ISale | null>(null);

  const SALES_PER_PAGE = 5;

  // Auto-select the open cash session for the current store
  const loadSession = useCallback(async () => {
    try {
      const res = await CashRepository.getSessions();
      const open = res.data.find(
        (s) => s.status === 'OPEN' && (!storeId || s.storeId === storeId),
      );
      setSelectedCashSessionId(open?.id ?? '');
    } catch { /* non-blocking */ }
  }, [storeId]);

  const loadSales = useCallback(async (page: number) => {
    const salesRes = await SalesRepository.getSales(storeId || undefined, page, SALES_PER_PAGE);
    setSales(salesRes.data.items);
    setSalesTotalPages(salesRes.data.totalPages);
    setSalesPage(salesRes.data.page);
  }, [storeId, SALES_PER_PAGE]);

  const loadScreen = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, salesRes, customersRes] = await Promise.all([
        ProductRepository.getProducts({ active: true, search: search || undefined, storeId: storeId || undefined, limit: 60 }),
        SalesRepository.getSales(storeId || undefined, 1, SALES_PER_PAGE),
        CustomersRepository.getCustomers({ storeId: storeId || undefined, limit: 100 }),
      ]);
      setProducts(productsRes.data.items);
      setSales(salesRes.data.items);
      setSalesTotalPages(salesRes.data.totalPages);
      setSalesPage(salesRes.data.page);
      setCustomers(customersRes.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar POS');
    } finally {
      setLoading(false);
    }
  }, [search, storeId, SALES_PER_PAGE]);

  useEffect(() => { void loadScreen(); }, [loadScreen]);
  useEffect(() => { void loadSession(); }, [loadSession]);

  useEffect(() => {
    if (paymentMethod === 'CREDIT') setSelectedCashSessionId('');
    else setSelectedCustomerId('');
  }, [paymentMethod]);

  const addToCart = (product: IProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === productId ? { ...i, quantity } : i).filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0),
    [cart],
  );

  const confirmSale = async () => {
    if (cart.length === 0) { setError('Agrega al menos un producto'); return false; }
    if (!storeId) { setError('Selecciona una tienda desde el filtro superior'); return false; }
    if (paymentMethod === 'CREDIT' && !selectedCustomerId) { setError('La venta a crédito requiere un cliente'); return false; }

    setSubmitting(true);
    setError(null);
    try {
      const result = await SalesRepository.createSale({
        paymentMethod,
        customerId: selectedCustomerId || undefined,
        storeId,
        cashSessionId: paymentMethod === 'CASH' ? selectedCashSessionId || undefined : undefined,
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });
      setReceiptSale(result.data);
      setCart([]);
      if (paymentMethod === 'CREDIT') setSelectedCustomerId('');
      await loadScreen();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible registrar la venta');
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
    salesPage,
    salesTotalPages,
    goToSalesPage: loadSales,
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
    removeFromCart,
    confirmSale,
    receiptSale,
    clearReceiptSale: () => setReceiptSale(null),
  };
};
