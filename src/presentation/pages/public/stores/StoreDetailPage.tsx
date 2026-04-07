import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { useParams } from 'react-router-dom';
import { usePublicStoreDetail } from '@/application/useCases/stores/usePublicStoreDetail';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import { useCart } from '@/shared/hooks/useCart';
import { useFavorites } from '@/application/useCases/products/useFavorites';
import Link from '@/presentation/ui/atoms/link/Simplelink';
import { ROUTES } from '@/shared/constants/routes';

const StoreDetailPage = () => {
  const { slug } = useParams();
  const { store, products, loading, error } = usePublicStoreDetail(slug);
  const { addItem } = useCart();
  const { favoriteIds, toggleFavorite } = useFavorites();

  if (loading) {
    return <Typography>Cargando tienda...</Typography>;
  }

  if (error || !store) {
    return (
      <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
        {error || 'No fue posible encontrar la tienda.'}
      </Box>
    );
  }

  return (
    <Box className='space-y-8'>
      <Box
        className='surface-panel rounded-[2rem] px-6 py-10 shadow-sm'
        style={{
          background:
            `linear-gradient(135deg, ${store.primaryColor || '#fff4ec'} 0%, #ffffff 55%, ${store.secondaryColor || '#edf5ff'} 100%)`,
        }}
      >
        <Box className='flex flex-wrap items-center gap-3 text-sm text-neutral-dark/55'>
          <Link to={ROUTES.PUBLIC.STORES} className='font-medium text-neutral-dark/60'>
            Tiendas
          </Link>
          <span>/</span>
          <span className='text-neutral-dark'>{store.name}</span>
        </Box>
        <Typography variant='h1' className='mt-4 text-4xl font-bold text-neutral-dark md:text-5xl'>
          {store.name}
        </Typography>
        <Typography className='mt-3 max-w-2xl text-neutral-dark/70'>
          {store.description || 'Esta tienda aún no agregó descripción.'}
        </Typography>
        <Box className='mt-6 flex flex-wrap gap-3 text-sm text-neutral-dark/65'>
          {store.phone ? (
            <span className='rounded-full bg-white/80 px-4 py-2 shadow-sm'>
              Tel: {store.phone}
            </span>
          ) : null}
          {store.email ? (
            <span className='rounded-full bg-white/80 px-4 py-2 shadow-sm'>
              {store.email}
            </span>
          ) : null}
          <span className='rounded-full bg-white/80 px-4 py-2 shadow-sm'>
            {products.length} producto(s) activos
          </span>
        </Box>
      </Box>

      <ProductBody
        products={products}
        favoriteIds={favoriteIds}
        emptyMessage='Esta tienda todavía no tiene productos activos.'
        onToggleFavorite={(productId) => {
          void toggleFavorite(productId);
        }}
        onAddToCart={(productId) => {
          const product = products.find((item) => item.id === productId);
          if (!product) return;

          addItem({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            imageUrl: product.imageUrl,
          });
        }}
      />
    </Box>
  );
};

export default StoreDetailPage;
