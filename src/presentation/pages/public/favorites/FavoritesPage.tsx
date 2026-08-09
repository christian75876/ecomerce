import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useFavorites } from '@/application/useCases/products/useFavorites';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import { ROUTES } from '@/shared/constants/routes';
import { useCart } from '@/shared/hooks/useCart';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

const FavoritesPage = () => {
  const {
    favoriteIds,
    favoriteProducts,
    loading,
    error,
    isAuthenticated,
    loadFavoriteProducts,
    toggleFavorite,
  } = useFavorites();
  const { addItem } = useCart();

  useEffect(() => {
    void loadFavoriteProducts();
  }, [loadFavoriteProducts]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return (
    <Box className='space-y-8'>
      <Box className='rounded-[2rem] bg-[linear-gradient(135deg,_#fff1f2_0%,_#ffffff_55%,_#fff7ed_100%)] px-6 py-10 shadow-sm'>
        <Typography variant='h1' className='text-3xl font-bold'>
          Mis favoritos
        </Typography>
        <Typography className='mt-3 max-w-2xl text-neutral-dark/70'>
          Revisa los productos que guardaste para volver a ellos rápidamente.
        </Typography>
      </Box>

      {error ? (
        <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
          {error}
        </Box>
      ) : null}

      <ProductBody
        products={favoriteProducts}
        loading={loading}
        emptyMessage='Todavía no tienes productos guardados en favoritos.'
        onAddToCart={(productId) => {
          const product = favoriteProducts.find((item) => item.id === productId);
          if (!product) return;
          addItem({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            imageUrl: product.imageUrl,
            storeId: product.storeId ?? undefined,
            storeAddressText: product.store?.addressText ?? null,
            storeDeliveryOptions: product.store?.deliveryOptions,
          });
          const label = product.name.length > 28 ? `${product.name.slice(0, 28)}…` : product.name;
          SnackbarUtilities.success(`${label} agregado al carrito`, 'bottom', 'right');
        }}
      />
    </Box>
  );
};

export default FavoritesPage;
