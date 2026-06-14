import { Helmet } from 'react-helmet-async';
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
import WhatsAppFloat from '../../atoms/whatsapp/WhatsAppFloat';

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const { product, relatedProducts, gallery, videos, loading, error } = usePublicProductDetail(productId);
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
      <Helmet>
        <title>{product.name} — Marketplace</title>
        <meta name='description' content={product.description.slice(0, 155)} />
        <meta property='og:title' content={product.name} />
        <meta property='og:description' content={product.description.slice(0, 155)} />
        {product.imageUrl ? <meta property='og:image' content={product.imageUrl} /> : null}
        <meta property='og:type' content='product' />
        <meta name='twitter:card' content='summary_large_image' />
      </Helmet>
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
                compareAtPrice: product.compareAtPrice,
                availableQuantity: product.availableQuantity,
                showStock: product.showStock,
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

              {/* Share buttons */}
              <Box className='flex items-center gap-2'>
                <span className='text-xs font-medium text-neutral-dark/50'>Compartir:</span>
                <button
                  type='button'
                  aria-label='Compartir por WhatsApp'
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const msg = encodeURIComponent(`¡Mira este producto: ${product.name}! ${window.location.href}`);
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                  }}
                  className='flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:opacity-90'
                >
                  <i className='bx bxl-whatsapp text-base' aria-hidden='true' />
                </button>
                <button
                  type='button'
                  aria-label='Copiar enlace'
                  onClick={() => {
                    void navigator.clipboard.writeText(window.location.href);
                  }}
                  className='flex h-8 w-8 items-center justify-center rounded-full border border-neutral-gray/30 bg-white text-neutral-dark/60 shadow-sm transition hover:bg-primary/5 hover:text-primary'
                >
                  <i className='bx bx-link text-base' aria-hidden='true' />
                </button>
              </Box>
            </Box>
          </Box>
        </Box>

        {gallery.length > 0 ? (
          <Box className='surface-panel rounded-[2rem] p-6 sm:p-8'>
            <Typography variant='h2' className='mb-4 text-xl font-semibold'>
              Galería
            </Typography>
            <Box className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
              {gallery.map((img) => (
                <Box key={img.id} className='overflow-hidden rounded-2xl border border-neutral-gray/20'>
                  <img
                    src={img.imageUrl}
                    alt='Imagen del producto'
                    className='h-32 w-full object-cover transition-transform hover:scale-105'
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}

        <ProductReviews productId={product.id} />

        {videos.length > 0 ? (
          <Box className='surface-panel rounded-[2rem] p-6 sm:p-8'>
            <Typography variant='h2' className='mb-6 text-2xl font-semibold'>
              Videos del producto
            </Typography>
            <Box className='grid gap-6 md:grid-cols-2'>
              {videos.map((video) => {
                if (video.videoType === 'YOUTUBE') {
                  const embedUrl = getYouTubeEmbedUrl(video.videoUrl);
                  if (!embedUrl) return null;
                  return (
                    <Box key={video.id} className='overflow-hidden rounded-2xl border border-neutral-gray/20'>
                      {video.title ? (
                        <Typography className='px-4 pt-3 text-sm font-semibold'>
                          {video.title}
                        </Typography>
                      ) : null}
                      <Box className='relative pb-[56.25%]'>
                        <iframe
                          src={embedUrl}
                          title={video.title ?? 'Video de producto'}
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                          allowFullScreen
                          className='absolute inset-0 h-full w-full'
                        />
                      </Box>
                    </Box>
                  );
                }

                // Instagram
                return (
                  <Box key={video.id} className='overflow-hidden rounded-2xl border border-neutral-gray/20'>
                    {video.title ? (
                      <Typography className='px-4 pt-3 text-sm font-semibold'>
                        {video.title}
                      </Typography>
                    ) : null}
                    <Box className='flex items-center justify-center p-4'>
                      <a
                        href={video.videoUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white'
                      >
                        Ver en Instagram
                      </a>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}

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

      {product.store?.whatsappNumber ? (
        <WhatsAppFloat
          phoneNumber={product.store.whatsappNumber}
          message={`Hola, estoy interesado en el producto "${product.name}"`}
        />
      ) : null}
    </>
  );
};

export default ProductDetails;
