import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { useParams } from 'react-router-dom';
import { usePublicStoreDetail } from '@/application/useCases/stores/usePublicStoreDetail';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import { useCart } from '@/shared/hooks/useCart';

const StoreDetailPage = () => {
  const { slug } = useParams();
  const { store, products, loading, error } = usePublicStoreDetail(slug);
  const { addItem } = useCart();

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
        className='rounded-[2rem] px-6 py-10 shadow-sm'
        style={{
          background:
            `linear-gradient(135deg, ${store.primaryColor || '#fff4ec'} 0%, #ffffff 55%, ${store.secondaryColor || '#edf5ff'} 100%)`,
        }}
      >
        <Typography variant='h1' className='text-4xl font-bold text-neutral-dark'>
          {store.name}
        </Typography>
        <Typography className='mt-3 max-w-2xl text-neutral-dark/70'>
          {store.description || 'Esta tienda aún no agregó descripción.'}
        </Typography>
      </Box>

      <ProductBody
        products={products}
        emptyMessage='Esta tienda todavía no tiene productos activos.'
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
