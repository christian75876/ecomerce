import { useEffect, useState } from 'react';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { IProduct, IProductImage, IProductVideo } from '@/application/dtos/products/response/ProductResponse';

export const usePublicProductDetail = (productId?: string) => {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [gallery, setGallery] = useState<IProductImage[]>([]);
  const [videos, setVideos] = useState<IProductVideo[]>([]);
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
        const [productResponse, relatedResponse, videosResponse, galleryResponse] = await Promise.all([
          ProductRepository.getProductById(productId),
          ProductRepository.getRelatedProducts(productId),
          ProductRepository.getProductVideos(productId),
          ProductRepository.getProductGallery(productId),
        ]);
        setProduct(productResponse.data);
        setRelatedProducts(relatedResponse.data);
        setVideos(videosResponse.data);
        setGallery(galleryResponse.data);
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
    relatedProducts,
    gallery,
    videos,
    loading,
    error,
  };
};
