import { useEffect, useState } from 'react';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';

export const usePublicStoreDetail = (slug?: string) => {
  const [store, setStore] = useState<IStore | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStore = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const storeResponse = await StoresRepository.getStoreBySlug(slug);
        setStore(storeResponse.data);

        const productsResponse = await ProductRepository.getProducts({
          active: true,
          storeId: storeResponse.data.id,
        });
        setProducts(productsResponse.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'No fue posible cargar la tienda',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadStore();
  }, [slug]);

  return { store, products, loading, error };
};
