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

export type PosGuestInfo = {
  name: string;
  phone: string;
  docType: string;
  doc: string;
  deliveryType: 'LOCAL' | 'SHIPPING' | '';
  deliveryAddress: string;
  deliveryCity: string;
  deliveryNotes: string;
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
  const [lastSale, setLastSale] = useState<ISale | null>(null);
  const [lastSaleGuestInfo, setLastSaleGuestInfo] = useState<PosGuestInfo | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestDocType, setGuestDocType] = useState('CC');
  const [guestDoc, setGuestDoc] = useState('');
  const [deliveryType, setDeliveryType] = useState<'LOCAL' | 'SHIPPING' | ''>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

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

    // Snapshot before clearing state
    const cartSnapshot = [...cart];
    const customerIdSnapshot = selectedCustomerId;
    const guestSnapshot: PosGuestInfo = {
      name: guestName.trim(),
      phone: guestPhone.trim(),
      docType: guestDocType,
      doc: guestDoc.trim(),
      deliveryType,
      deliveryAddress: deliveryAddress.trim(),
      deliveryCity: deliveryCity.trim(),
      deliveryNotes: deliveryNotes.trim(),
    };

    try {
      const saleResponse = await SalesRepository.createSale({
        paymentMethod,
        customerId: selectedCustomerId || undefined,
        storeId: selectedStoreId,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        guestName: guestSnapshot.name || undefined,
        guestPhone: guestSnapshot.phone || undefined,
        guestDocType: guestSnapshot.docType || undefined,
        guestDoc: guestSnapshot.doc || undefined,
        deliveryType: guestSnapshot.deliveryType || undefined,
        deliveryAddress: guestSnapshot.deliveryAddress || undefined,
        deliveryCity: guestSnapshot.deliveryCity || undefined,
        deliveryNotes: guestSnapshot.deliveryNotes || undefined,
      });

      const saleFromApi = saleResponse.data as unknown as ISale;

      // Build receipt from API response, falling back to cart snapshot for product details
      const storeInfo = saleFromApi?.store ?? (cartSnapshot[0]?.product?.store
        ? { id: cartSnapshot[0].product.store.id, name: cartSnapshot[0].product.store.name }
        : null);
      const customerInfo = saleFromApi?.customer ?? (customerIdSnapshot
        ? (() => { const c = customers.find((x) => x.id === customerIdSnapshot); return c ? { id: c.id, firstName: c.firstName, lastName: c.lastName } : null; })()
        : null);
      const itemsFromApi = Array.isArray(saleFromApi?.items) && saleFromApi.items.length > 0;

      const receiptData: ISale = {
        id: saleFromApi?.id ?? '',
        paymentMethod,
        customerId: customerIdSnapshot || null,
        storeId: selectedStoreId,
        cashSessionId: saleFromApi?.cashSessionId ?? null,
        total,
        createdAt: saleFromApi?.createdAt ?? new Date().toISOString(),
        store: storeInfo,
        customer: customerInfo,
        items: itemsFromApi
          ? saleFromApi.items
          : cartSnapshot.map((cartItem, idx) => ({
              id: `cart-${idx}`,
              productId: cartItem.product.id,
              quantity: cartItem.quantity,
              unitPrice: Number(cartItem.product.price),
              lineTotal: Number(cartItem.product.price) * cartItem.quantity,
              product: { id: cartItem.product.id, name: cartItem.product.name, sku: cartItem.product.sku ?? '' },
            })),
      };

      setLastSale(receiptData);
      setLastSaleGuestInfo(
        guestSnapshot.name || guestSnapshot.phone || guestSnapshot.doc ? guestSnapshot : null,
      );
      setCart([]);
      setGuestName('');
      setGuestPhone('');
      setGuestDocType('CC');
      setGuestDoc('');
      setDeliveryType('');
      setDeliveryAddress('');
      setDeliveryCity('');
      setDeliveryNotes('');
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
    lastSale,
    lastSaleGuestInfo,
    guestName,
    guestPhone,
    guestDocType,
    guestDoc,
    deliveryType,
    deliveryAddress,
    deliveryCity,
    deliveryNotes,
    setSearch,
    setSelectedCustomerId,
    setPaymentMethod,
    setGuestName,
    setGuestPhone,
    setGuestDocType,
    setGuestDoc,
    setDeliveryType,
    setDeliveryAddress,
    setDeliveryCity,
    setDeliveryNotes,
    addToCart,
    updateQuantity,
    confirmSale,
    closeSaleReceipt: () => { setLastSale(null); setLastSaleGuestInfo(null); },
  };
};
