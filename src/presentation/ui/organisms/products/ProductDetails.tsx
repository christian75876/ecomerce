import Typography from '../../atoms/typography/SimpleTypography';
import ProductHeader from '../../molecules/products/ProductHeader';
import { useParams } from 'react-router-dom';
import ProductInformation from '../../molecules/products/ProductInformation';
import ProductActions from '../../molecules/products/ProductActions';
import { usePublicProductDetail } from '@/application/useCases/products/usePublicProductDetail';
import Box from '../../atoms/box/SimpleBox';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const { product, loading, error } = usePublicProductDetail(productId);

  if (loading) {
    return <Typography>Cargando detalle del producto...</Typography>;
  }

  if (error || !product) {
    return (
      <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600'>
        {error || 'Producto no encontrado'}
      </Box>
    );
  }

  return (
    <>
      <ProductHeader title={`Detalle del producto`} />
      <Box className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <ProductInformation
          product={{
            name: product.name,
            price: Number(product.price).toFixed(2),
            description: product.description,
            imageUrl:
              product.imageUrl ||
              'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
            category: product.category?.name,
          }}
        />
        <ProductActions price={Number(product.price)} />
      </Box>
    </>
  );
};

export default ProductDetails;
