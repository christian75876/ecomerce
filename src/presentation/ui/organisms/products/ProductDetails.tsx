import Typography from '../../atoms/typography/SimpleTypography';
import { useParams } from 'react-router-dom';
import ProductInformation from '../../molecules/products/ProductInformation';
import ProductActions from '../../molecules/products/ProductActions';
import { usePublicProductDetail } from '@/application/useCases/products/usePublicProductDetail';
import Box from '../../atoms/box/SimpleBox';
import ProductReviews from './ProductReviews';
import { useCart } from '@/shared/hooks/useCart';
import { useFavorites } from '@/application/useCases/products/useFavorites';
import Button from '../../atoms/button/SimpleButton';
import Icon from '../../atoms/icon/SimpleIcon';
import ProductBody from './ProductBody';
import Link from '../../atoms/link/Simplelink';
import { ROUTES } from '@/shared/constants/routes';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const { product, relatedProducts, loading, error } = usePublicProductDetail(productId);
  const { addItem } = useCart();
  const { favoriteIds, toggleFavorite, isAuthenticated } = useFavorites();

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
      <Box className='space-y-8'>
        <Box className='surface-panel rounded-[2rem] p-6 sm:p-8'>
          <Box className='flex flex-wrap items-center gap-3 text-sm text-neutral-dark/55'>
            <Link to={ROUTES.PUBLIC.HOME} className='font-medium text-neutral-dark/60'>
              Marketplace
            </Link>
            <span>/</span>
            {product.store?.slug ? (
              <>
                <Link
                  to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', product.store.slug)}
                  className='font-medium text-neutral-dark/60'
                >
                  {product.store.name}
                </Link>
                <span>/</span>
              </>
            ) : null}
            <span className='text-neutral-dark'>{product.name}</span>
          </Box>

          <Box className='mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]'>
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
            <Box className='space-y-4'>
              <ProductActions
                price={Number(product.price)}
                onPrimaryAction={() =>
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price),
                    imageUrl: product.imageUrl,
                  })
                }
              />
              <Button
                type='button'
                variant={favoriteIds.includes(product.id) ? 'secondary' : 'outlinePrimary'}
                onClick={() => void toggleFavorite(product.id)}
                disabled={!isAuthenticated}
                leftIcon={<Icon name={favoriteIds.includes(product.id) ? 'bxs-heart' : 'bx-heart'} />}
                className='w-full'
              >
                {favoriteIds.includes(product.id) ? 'Guardado en favoritos' : 'Guardar en favoritos'}
              </Button>
              <Box className='rounded-[1.5rem] border border-neutral-gray/20 bg-white px-5 py-4 text-sm text-neutral-dark/65 shadow-sm'>
                {product.store?.name ? `Vendido por ${product.store.name}.` : 'Producto activo en el marketplace.'}
                {' '}Entrega y disponibilidad sujetas a inventario.
              </Box>
            </Box>
          </Box>
        </Box>

        <ProductReviews productId={product.id} />

        <Box className='space-y-4'>
          <Typography variant='h2' className='text-2xl font-semibold'>
            Productos relacionados
          </Typography>
          <ProductBody
            products={relatedProducts}
            emptyMessage='No encontramos relacionados directos. Vuelve al catálogo para seguir explorando.'
            favoriteIds={favoriteIds}
            onToggleFavorite={(relatedProductId) => {
              void toggleFavorite(relatedProductId);
            }}
            onAddToCart={(relatedProductId) => {
              const relatedProduct = relatedProducts.find(
                (item) => item.id === relatedProductId,
              );
              if (!relatedProduct) return;

              addItem({
                productId: relatedProduct.id,
                name: relatedProduct.name,
                price: Number(relatedProduct.price),
                imageUrl: relatedProduct.imageUrl,
              });
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default ProductDetails;
