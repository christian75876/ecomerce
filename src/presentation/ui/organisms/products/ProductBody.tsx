import { useNavigate } from 'react-router-dom';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import ProductCard from '../../molecules/products/ProductCard';
import Box from '../../atoms/box/SimpleBox';
import Typography from '../../atoms/typography/SimpleTypography';
import { Reveal } from '../../molecules/common/Reveal';
import { ROUTES } from '@/shared/constants/routes';

/** Stagger delay per grid position, capped so a long grid doesn't leave the
 * last rows waiting seconds to reveal — only the first "page" staggers,
 * everything past it reveals together. */
const STAGGER_STEP = 0.05;
const STAGGER_CAP = 10;
const staggerDelay = (index: number) => Math.min(index, STAGGER_CAP) * STAGGER_STEP;

interface ProductBodyProps {
  products: IProduct[];
  loading?: boolean;
  emptyMessage?: string;
  sponsoredIds?: string[];
  layoutStyle?: 'GRID' | 'LIST';
  mobileCarousel?: boolean;
  buttonStyle?: 'ROUNDED' | 'SHARP' | 'PILL';
  primaryColor?: string;
  onAddToCart?: (productId: string) => void;
}

const fallbackImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';

const ProductBody = ({
  products,
  loading = false,
  emptyMessage = 'No hay productos disponibles en este momento.',
  sponsoredIds = [],
  layoutStyle = 'GRID',
  mobileCarousel = false,
  buttonStyle,
  primaryColor,
  onAddToCart,
}: ProductBodyProps) => {
  const navigate = useNavigate();

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

  const cards = products.map((product, index) => (
    <Reveal key={product.id} effect='fade-up' delay={staggerDelay(index)} className='h-full'>
      <ProductCard
        id={product.id}
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
        isAdultContent={product.store?.isAdultContent}
        isSponsored={sponsoredIds.includes(product.id)}
        layoutStyle={layoutStyle}
        buttonStyle={buttonStyle}
        primaryColor={primaryColor}
        addToCartLabel={product.hasVariants ? 'Ver opciones' : 'Agregar'}
        onAddToCart={() => {
          if (product.hasVariants) {
            navigate(ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', product.id));
          } else {
            onAddToCart?.(product.id);
          }
        }}
      />
    </Reveal>
  ));

  if (layoutStyle === 'LIST') {
    return <div className='flex flex-col gap-4'>{cards}</div>;
  }

  if (mobileCarousel) {
    return (
      <>
        {/* Mobile: horizontal scroll rail */}
        <div
          className='flex sm:hidden'
          style={{
            gap: '1rem',
            overflowX: 'auto',
            overflowY: 'visible',
            WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
            scrollSnapType: 'x mandatory',
            paddingBottom: '0.5rem',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                flexShrink: 0,
                width: 'min(72vw, 240px)',
                scrollSnapAlign: 'start',
              }}
            >
              <ProductCard
                id={product.id}
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
                isAdultContent={product.store?.isAdultContent}
                isSponsored={sponsoredIds.includes(product.id)}
                layoutStyle={layoutStyle}
                buttonStyle={buttonStyle}
                primaryColor={primaryColor}
                addToCartLabel={product.hasVariants ? 'Ver opciones' : 'Agregar'}
                onAddToCart={() => {
                  if (product.hasVariants) {
                    navigate(ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', product.id));
                  } else {
                    onAddToCart?.(product.id);
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* sm+: standard grid — auto-fill so columns scale to whatever
            width is actually available (content-container has no max-
            width cap anymore) instead of stopping at a fixed count and
            leaving the extra space on wide screens unused. */}
        <div className='hidden sm:grid sm:gap-6 sm:[grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]'>
          {cards}
        </div>
      </>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 sm:[grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]'>
      {cards}
    </div>
  );
};

export default ProductBody;
