import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Typography from '../../atoms/typography/SimpleTypography';
import { useParams } from 'react-router-dom';
import ProductInformation from '../../molecules/products/ProductInformation';
import { usePublicProductDetail } from '@/application/useCases/products/usePublicProductDetail';
import Box from '../../atoms/box/SimpleBox';
import ProductReviews from './ProductReviews';
import { useCart } from '@/shared/hooks/useCart';
import ProductBody from './ProductBody';
import Link from '../../atoms/link/Simplelink';
import { ROUTES } from '@/shared/constants/routes';
import WhatsAppFloat from '../../atoms/whatsapp/WhatsAppFloat';
import InstagramEmbed from '../../atoms/video/InstagramEmbed';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getTikTokEmbedUrl(url: string): string | null {
  const match = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
}

function getFacebookEmbedUrl(url: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
}

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const { product, relatedProducts, gallery, videos, loading, error } = usePublicProductDetail(productId);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAddToCart = () => {
    if (!product || product.availableQuantity === 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setExpanded(true);
    setTimeout(() => {
      setAdded(false);
      setExpanded(false);
    }, 2000);
  };

  if (loading) {
    return (
      <Box className='flex min-h-[40vh] items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600'>
        {error || 'Producto no encontrado'}
      </Box>
    );
  }

  const isOutOfStock = product.availableQuantity === 0;

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

      <Box className='space-y-8 pb-10'>

        {/* ── 1. Product info + carousel ── */}
        <Box className='surface-panel rounded-[2rem] p-6 sm:p-8'>
          {/* Breadcrumb */}
          <Box className='mb-8 flex flex-wrap items-center gap-3 text-sm text-neutral-dark/55'>
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

          {/* Product info — full width, no sidebar */}
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
            gallery={gallery}
            footer={
              <button
                type='button'
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-sm transition active:scale-95 ${
                  isOutOfStock
                    ? 'cursor-not-allowed bg-slate-300'
                    : added
                      ? 'bg-emerald-500'
                      : 'bg-primary hover:opacity-90'
                }`}
              >
                <i className={`bx text-base ${added ? 'bx-check' : isOutOfStock ? 'bx-x-circle' : 'bx-cart-add'}`} aria-hidden='true' />
                {isOutOfStock ? 'Sin stock' : added ? '¡Agregado!' : 'Agregar al carrito'}
              </button>
            }
          />

          {/* Store info + share */}
          <Box className='mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-gray/20 pt-5'>
            <p className='text-sm text-neutral-dark/55'>
              {product.store?.name
                ? `Vendido por ${product.store.name}. Entrega y disponibilidad sujetas a inventario.`
                : 'Producto activo en el marketplace.'}
            </p>
            <Box className='flex items-center gap-2'>
              <span className='text-xs font-medium text-neutral-dark/50'>Compartir:</span>
              <button
                type='button'
                aria-label='Compartir por WhatsApp'
                onClick={() => {
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
                onClick={() => { void navigator.clipboard.writeText(window.location.href); }}
                className='flex h-8 w-8 items-center justify-center rounded-full border border-neutral-gray/30 bg-white text-neutral-dark/60 shadow-sm transition hover:bg-primary/5 hover:text-primary'
              >
                <i className='bx bx-link text-base' aria-hidden='true' />
              </button>
            </Box>
          </Box>
        </Box>

        {/* ── 2. Videos ── */}
        {videos.length > 0 ? (
          <Box className='surface-panel rounded-[2rem] p-6 sm:p-8'>
            <Typography variant='h2' className='mb-6 text-2xl font-semibold'>
              Videos del producto
            </Typography>
            <Box className='flex flex-col gap-6'>
              {videos.map((video) => {
                if (video.videoType === 'INSTAGRAM') {
                  return (
                    <Box key={video.id}>
                      <InstagramEmbed url={video.videoUrl} title={video.title} />
                    </Box>
                  );
                }

                let embedUrl: string | null = null;
                const isPortrait = video.videoType === 'TIKTOK';
                const heightClass = isPortrait ? 'h-[680px]' : 'h-[420px]';
                const wrapClass = isPortrait ? 'mx-auto w-full max-w-sm' : 'w-full';

                if (video.videoType === 'YOUTUBE') embedUrl = getYouTubeEmbedUrl(video.videoUrl);
                else if (video.videoType === 'TIKTOK') embedUrl = getTikTokEmbedUrl(video.videoUrl);
                else if (video.videoType === 'FACEBOOK') embedUrl = getFacebookEmbedUrl(video.videoUrl);

                if (!embedUrl) return null;

                return (
                  <Box key={video.id} className={`overflow-hidden rounded-2xl border border-neutral-gray/20 ${wrapClass}`}>
                    {video.title ? (
                      <Typography className='px-4 pt-3 text-sm font-semibold'>
                        {video.title}
                      </Typography>
                    ) : null}
                    <Box className={heightClass}>
                      <iframe
                        src={embedUrl}
                        title={video.title ?? 'Video de producto'}
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                        scrolling='no'
                        className='h-full w-full'
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}

        {/* ── 3. Reviews ── */}
        <ProductReviews productId={product.id} />

        {/* ── 4. Related products ── */}
        <Box className='space-y-4'>
          <Typography variant='h2' className='text-2xl font-semibold'>
            Productos relacionados
          </Typography>
          <ProductBody
            products={relatedProducts}
            emptyMessage='No encontramos relacionados directos. Vuelve al catálogo para seguir explorando.'
            onAddToCart={(relatedProductId) => {
              const rel = relatedProducts.find((item) => item.id === relatedProductId);
              if (!rel) return;
              addItem({
                productId: rel.id,
                name: rel.name,
                price: Number(rel.price),
                imageUrl: rel.imageUrl,
              });
            }}
          />
        </Box>
      </Box>

      {/* ── 5. Left-side expanding cart tab ── */}
      <div
        role='button'
        aria-label={isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
        tabIndex={0}
        onClick={handleAddToCart}
        onMouseEnter={() => { if (!added) setExpanded(true); }}
        onMouseLeave={() => { if (!added) setExpanded(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAddToCart(); }}
        className={`fixed bottom-24 left-0 z-[80] cursor-pointer select-none rounded-r-2xl shadow-[4px_4px_24px_rgba(15,23,42,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 sm:bottom-6 ${
          isOutOfStock ? 'bg-slate-400' : added ? 'bg-emerald-500' : 'bg-primary'
        }`}
        style={{
          width: expanded ? '196px' : '40px',
          transition: 'width 350ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 200ms ease',
        }}
      >
        {/* pulse on the container itself — absolute so it can overflow the tab edges */}
        {!expanded && !added && !isOutOfStock ? (
          <span className='absolute inset-0 rounded-r-2xl bg-primary animate-ping opacity-50' />
        ) : null}

        {/* overflow-hidden here clips the text when collapsed, not on the outer div */}
        <div className='overflow-hidden'>
        <div className='flex items-center gap-3 px-[10px] py-2.5'>
          <i
            className={`bx flex-shrink-0 text-lg text-white ${added ? 'bx-check' : isOutOfStock ? 'bx-x-circle' : 'bx-cart-add'}`}
            aria-hidden='true'
          />
          <div className='min-w-0 whitespace-nowrap'>
            <p className={`text-xs font-bold leading-tight text-white transition-opacity duration-200 ${expanded ? 'opacity-100 delay-100' : 'opacity-0'}`}>
              {added ? '¡Agregado!' : isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </p>
            {!added && !isOutOfStock ? (
              <p className={`mt-0.5 text-[10px] font-medium text-white/75 transition-opacity duration-200 ${expanded ? 'opacity-100 delay-100' : 'opacity-0'}`}>
                {formatCurrencyCOP(Number(product.price))}
              </p>
            ) : null}
          </div>
        </div>
        </div>
      </div>

      {(product.store?.whatsappNumber || product.store?.phone || import.meta.env.VITE_WHATSAPP_SUPPORT) ? (
        <WhatsAppFloat
          phoneNumber={(product.store?.whatsappNumber || product.store?.phone || import.meta.env.VITE_WHATSAPP_SUPPORT)!}
          message={`Hola, estoy interesado en el producto "${product.name}"`}
        />
      ) : null}
    </>
  );
};

export default ProductDetails;
