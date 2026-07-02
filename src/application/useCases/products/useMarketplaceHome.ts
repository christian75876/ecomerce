import { useCallback, useEffect, useState } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';

export const useMarketplaceHome = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newestProducts, setNewestProducts] = useState<IProduct[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<IProduct[]>([]);
  const [featuredStores, setFeaturedStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesResponse, sectionsResponse, storesResponse] = await Promise.all([
        CategoriesRepository.getCategories(true),
        ProductRepository.getMarketplaceSections(),
        StoresRepository.getStores({ active: true }),
      ]);

      setCategories(categoriesResponse.data.slice(0, 6));
      setNewestProducts(sectionsResponse.data.newestProducts);
      setBestSellingProducts(sectionsResponse.data.bestSellingProducts);
      setFeaturedStores(storesResponse.data.slice(0, 6));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible cargar la portada del marketplace',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  return {
    categories,
    newestProducts,
    bestSellingProducts,
    featuredStores,
    loading,
    error,
  };
};
