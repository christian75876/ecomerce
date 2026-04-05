import { useEffect, useState } from 'react';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';

export const usePublicProductDetail = (productId?: string) => {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setError('Producto no encontrado');
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ProductRepository.getProductById(productId);
        setProduct(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No fue posible cargar el detalle del producto',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [productId]);

  return {
    product,
    loading,
    error,
  };
};
