import { useEffect, useState } from 'react';
import { usePagination } from '@/application/useCases/common/usePagination';
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
  const pagination = usePagination(20);

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
            page: pagination.page,
            limit: pagination.limit,
          }),
          CategoriesRepository.getCategories(true),
        ]);
        setProducts(productsResponse.data.items);
        pagination.updateMeta(productsResponse.data.pagination);
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
  }, [search, selectedCategoryId, pagination.page]);

  return {
    products,
    categories,
    search,
    selectedCategoryId,
    setSearch: (v: string) => { pagination.reset(); setSearch(v); },
    setSelectedCategoryId: (v: string) => { pagination.reset(); setSelectedCategoryId(v); },
    loading,
    error,
    pagination,
  };
};
