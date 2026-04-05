import { useEffect, useState } from 'react';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';

export const usePublicCatalog = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ProductRepository.getProducts({
          active: true,
          search: search || undefined,
        });
        setProducts(response.data);
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
  }, [search]);

  return {
    products,
    search,
    setSearch,
    loading,
    error,
  };
};
