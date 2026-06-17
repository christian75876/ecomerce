import { useEffect, useState } from 'react';
import { usePagination } from '@/application/useCases/common/usePagination';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { MenuCategoriesRepository } from '@/infrastructure/repositories/api/menu-categories/MenuCategoriesRepository';

export const usePublicStoreDetail = (slug?: string) => {
  const [store, setStore] = useState<IStore | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [menuCategories, setMenuCategories] = useState<IMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productPagination = usePagination(20);

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
        const storeData = storeResponse.data;
        setStore(storeData);

        const [productsResponse, categoriesResponse] = await Promise.all([
          ProductRepository.getProducts({ active: true, storeId: storeData.id, page: productPagination.page, limit: productPagination.limit }),
          storeData.storeType === 'RESTAURANT'
            ? MenuCategoriesRepository.getByStore(storeData.id)
            : Promise.resolve(null),
        ]);

        setProducts(productsResponse.data.items);
        productPagination.updateMeta(productsResponse.data.pagination);
        setMenuCategories(categoriesResponse?.data ?? []);
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

  return { store, products, menuCategories, loading, error, productPagination };
};
