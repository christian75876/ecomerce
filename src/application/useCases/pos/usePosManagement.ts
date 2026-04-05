import { useCallback, useEffect, useMemo, useState } from 'react';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { ISale } from '@/application/dtos/sales/response/SaleResponse';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { SalesRepository } from '@/infrastructure/repositories/api/sales/SalesRepository';

export type PosCartItem = {
  product: IProduct;
  quantity: number;
};

export const usePosManagement = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [sales, setSales] = useState<ISale[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScreen = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsResponse, salesResponse] = await Promise.all([
        ProductRepository.getProducts({ active: true, search }),
        SalesRepository.getSales(),
      ]);
      setProducts(productsResponse.data);
      setSales(salesResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar POS');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void loadScreen();
  }, [loadScreen]);

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

    setSubmitting(true);
    setError(null);

    try {
      await SalesRepository.createSale({
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      setCart([]);
      await loadScreen();
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
    cart,
    sales,
    search,
    loading,
    submitting,
    error,
    total,
    setSearch,
    addToCart,
    updateQuantity,
    confirmSale,
  };
};
