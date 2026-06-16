import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import Box from '@atoms/box/SimpleBox';
import EmptyState from '@molecules/common/EmptyState';
import ProductSkeleton from '@molecules/products/ProductSkeleton';
import ProductCard from '@molecules/products/ProductCard';
import { useEffect, useRef } from 'react';

interface ProductGridProps {
  products: IProduct[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onAddToCart?: (productId: string) => void;
}

const fallbackImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';

const ProductGrid = ({
  products,
  loading = false,
  error,
  hasMore = false,
  onLoadMore,
  onAddToCart,
}: ProductGridProps) => {
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerTargetRef.current || !onLoadMore || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: '320px 0px',
      },
    );

    observer.observe(observerTargetRef.current);

    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (error) {
    return (
      <EmptyState
        title='No pudimos cargar el catálogo'
        description={error}
      />
    );
  }

  if (!loading && products.length === 0) {
    return (
      <EmptyState
        title='No encontramos productos'
        description='Prueba otros filtros, cambia el rango de precios o explora otra tienda.'
      />
    );
  }

  return (
    <>
      <Box className='grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
        {loading && products.length === 0
          ? Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))
          : products.map((product, index) => (
              <ProductCard
                id={product.id}
                key={product.id}
                image={product.imageUrl || fallbackImage}
                name={product.name}
                description={product.description}
                price={String(product.price)}
                storeName={product.store?.name}
                storeSlug={product.store?.slug}
                badge={index < 4 ? 'Top' : undefined}
                onAddToCart={() => onAddToCart?.(product.id)}
              />
            ))}
      </Box>

      {hasMore ? <div ref={observerTargetRef} className='h-10 w-full' /> : null}

      {loading && products.length > 0 ? (
        <Box className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductSkeleton key={`more-skeleton-${index}`} />
          ))}
        </Box>
      ) : null}
    </>
  );
};

export default ProductGrid;
