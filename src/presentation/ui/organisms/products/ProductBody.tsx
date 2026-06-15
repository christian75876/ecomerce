import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import ProductCard from '../../molecules/products/ProductCard';
import Box from '../../atoms/box/SimpleBox';
import Typography from '../../atoms/typography/SimpleTypography';

interface ProductBodyProps {
  products: IProduct[];
  loading?: boolean;
  emptyMessage?: string;
  favoriteIds?: string[];
  sponsoredIds?: string[];
  layoutStyle?: 'GRID' | 'LIST';
  buttonStyle?: 'ROUNDED' | 'SHARP' | 'PILL';
  primaryColor?: string;
  onToggleFavorite?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

const fallbackImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';

const ProductBody = ({
  products,
  loading = false,
  emptyMessage = 'No hay productos disponibles en este momento.',
  favoriteIds = [],
  sponsoredIds = [],
  layoutStyle = 'GRID',
  buttonStyle,
  primaryColor,
  onToggleFavorite,
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

  const gridClass =
    layoutStyle === 'LIST'
      ? 'flex flex-col gap-4'
      : 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3';

  return (
    <div className={gridClass}>
      {products.map(product => (
        <ProductCard
          id={product.id}
          key={product.id}
          image={product.imageUrl || fallbackImage}
          name={product.name}
          description={product.description}
          price={Number(product.price).toFixed(2)}
          compareAtPrice={product.compareAtPrice}
          availableQuantity={product.availableQuantity}
          showStock={product.showStock}
          averageRating={product.averageRating}
          reviewCount={product.reviewCount}
          storeName={product.store?.name}
          storeSlug={product.store?.slug}
          isFavorite={favoriteIds.includes(product.id)}
          isSponsored={sponsoredIds.includes(product.id)}
          layoutStyle={layoutStyle}
          buttonStyle={buttonStyle}
          primaryColor={primaryColor}
          onToggleFavorite={
            onToggleFavorite ? () => onToggleFavorite(product.id) : undefined
          }
          onAddToCart={() => onAddToCart?.(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductBody;
