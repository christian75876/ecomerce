import { useEffect, useState } from 'react';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';

export const usePublicCatalog = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          ProductRepository.getProducts({
            active: true,
            search: search || undefined,
            categoryId: selectedCategoryId || undefined,
          }),
          CategoriesRepository.getCategories(true),
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No fue posible cargar el catálogo',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [search, selectedCategoryId]);

  return {
    products,
    categories,
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    loading,
    error,
  };
};
