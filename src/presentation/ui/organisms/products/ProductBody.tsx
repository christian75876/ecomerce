import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import ProductCard from '../../molecules/products/ProductCard';
import Box from '../../atoms/box/SimpleBox';
import Typography from '../../atoms/typography/SimpleTypography';

interface ProductBodyProps {
  products: IProduct[];
  loading?: boolean;
  emptyMessage?: string;
  onAddToCart?: (productId: string) => void;
}

const fallbackImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';

const ProductBody = ({
  products,
  loading = false,
  emptyMessage = 'No hay productos disponibles en este momento.',
  onAddToCart,
}: ProductBodyProps) => {
  if (loading) {
    return <Typography>Cargando productos...</Typography>;
  }

  if (products.length === 0) {
    return (
      <Box className='rounded-3xl border border-dashed border-neutral-gray/30 bg-white px-6 py-14 text-center'>
        <Typography>{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {products.map(product => (
        <ProductCard
          id={product.id}
          key={product.id}
          image={product.imageUrl || fallbackImage}
          name={product.name}
          description={product.description}
          price={Number(product.price).toFixed(2)}
          storeName={product.store?.name}
          storeSlug={product.store?.slug}
          onAddToCart={() => onAddToCart?.(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductBody;
