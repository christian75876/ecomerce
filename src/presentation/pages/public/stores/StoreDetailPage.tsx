import { Helmet } from 'react-helmet-async';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { useParams } from 'react-router-dom';
import { usePublicStoreDetail } from '@/application/useCases/stores/usePublicStoreDetail';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import { useCart } from '@/shared/hooks/useCart';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import { useFavorites } from '@/application/useCases/products/useFavorites';
import Link from '@/presentation/ui/atoms/link/Simplelink';
import { ROUTES } from '@/shared/constants/routes';
import WhatsAppFloat from '@/presentation/ui/atoms/whatsapp/WhatsAppFloat';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';

function buildStoreTheme(store: IStore): React.CSSProperties {
  const primary = store.primaryColor || '#6366f1';
  const secondary = store.secondaryColor || '#a5b4fc';
  const accent = store.accentColor || '#f59e0b';
  const bg = store.bgColor || '#ffffff';
  const text = store.textColor || '#1e293b';

  return {
    '--store-primary': primary,
    '--store-secondary': secondary,
    '--store-accent': accent,
    '--store-bg': bg,
    '--store-text': text,
    backgroundColor: bg,
    color: text,
  } as React.CSSProperties;
}

function fontClass(fontStyle?: IStore['fontStyle']) {
  if (fontStyle === 'CLASSIC') return 'font-serif';
  if (fontStyle === 'PLAYFUL') return 'tracking-wide';
  return 'font-sans';
}

function coverBackground(store: IStore): string {
  const primary = store.primaryColor || '#6366f1';
  const secondary = store.secondaryColor || '#a5b4fc';

  if (store.coverStyle === 'SOLID') return primary;
  if (store.coverStyle === 'MINIMAL') return '#f8fafc';
  return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
}

function coverTextColor(store: IStore): string {
  return store.coverStyle === 'MINIMAL' ? (store.textColor || '#1e293b') : '#ffffff';
}

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

  const themeVars = buildStoreTheme(store);
  const font = fontClass(store.fontStyle);

  return (
    <>
      <Helmet>
        <title>{store.name} — Marketplace</title>
        <meta name='description' content={store.description || `Explora los productos de ${store.name} en el marketplace.`} />
        <meta property='og:title' content={store.name} />
        <meta property='og:description' content={store.description || `Explora los productos de ${store.name}.`} />
        {store.bannerUrl ? <meta property='og:image' content={store.bannerUrl} /> : null}
        {store.logoUrl ? <meta property='og:image' content={store.logoUrl} /> : null}
        <meta property='og:type' content='website' />
      </Helmet>

      <div className={`space-y-8 ${font}`} style={themeVars}>
        {/* ── Header / Cover ── */}
        <div
          className='relative overflow-hidden rounded-[2rem] px-6 py-10 shadow-sm'
          style={{ background: coverBackground(store), color: coverTextColor(store) }}
        >
          {/* Banner image overlay */}
          {store.bannerUrl ? (
            <div
              className='absolute inset-0 bg-cover bg-center opacity-20'
              style={{ backgroundImage: `url(${store.bannerUrl})` }}
              aria-hidden='true'
            />
          ) : null}

          <div className='relative z-10'>
            {/* Breadcrumb */}
            <div className='flex flex-wrap items-center gap-2 text-sm opacity-75'>
              <Link
                to={ROUTES.PUBLIC.STORES}
                className='font-medium hover:opacity-100'
                style={{ color: 'inherit' }}
              >
                Tiendas
              </Link>
              <span>/</span>
              <span className='font-semibold opacity-100'>{store.name}</span>
            </div>

            <div className='mt-4 flex items-start gap-4'>
              {/* Logo */}
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className='h-16 w-16 flex-shrink-0 rounded-2xl border-2 border-white/30 object-cover shadow-lg'
                />
              ) : (
                <div
                  className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg'
                  style={{ backgroundColor: store.accentColor || 'rgba(255,255,255,0.2)' }}
                >
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className='min-w-0 flex-1'>
                <Typography
                  variant='h1'
                  className='text-3xl font-bold md:text-4xl'
                  style={{ color: 'inherit' }}
                >
                  {store.name}
                </Typography>
                {store.description ? (
                  <Typography
                    className='mt-2 max-w-2xl text-sm opacity-80'
                    style={{ color: 'inherit' }}
                  >
                    {store.description}
                  </Typography>
                ) : null}
              </div>
            </div>

            {/* Contact pills */}
            <div className='mt-5 flex flex-wrap gap-2 text-xs'>
              <span
                className='rounded-full px-3 py-1.5 font-semibold'
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                {products.length} producto{products.length !== 1 ? 's' : ''} activo{products.length !== 1 ? 's' : ''}
              </span>
              {store.phone ? (
                <span className='rounded-full px-3 py-1.5' style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  Tel: {store.phone}
                </span>
              ) : null}
              {store.email ? (
                <span className='rounded-full px-3 py-1.5' style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  {store.email}
                </span>
              ) : null}
              {store.deliveryOptions === 'BOTH' || store.deliveryOptions === 'DELIVERY' ? (
                <span className='rounded-full px-3 py-1.5' style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  🚚 Envío disponible
                </span>
              ) : null}
              {store.deliveryOptions === 'BOTH' || store.deliveryOptions === 'PICKUP' ? (
                <span className='rounded-full px-3 py-1.5' style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  🏪 Recogida en tienda
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Products ── */}
        <div style={{ backgroundColor: themeVars.backgroundColor }}>
          <ProductBody
            products={products}
            favoriteIds={favoriteIds}
            layoutStyle={store.layoutStyle}
            buttonStyle={store.buttonStyle}
            primaryColor={store.primaryColor || undefined}
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
              const label = product.name.length > 28 ? `${product.name.slice(0, 28)}…` : product.name;
              SnackbarUtilities.success(`${label} agregado al carrito`, 'bottom', 'right');
            }}
          />
        </div>
      </div>

      {store.whatsappNumber ? (
        <WhatsAppFloat
          phoneNumber={store.whatsappNumber}
          message={`Hola, te escribo desde el marketplace sobre la tienda ${store.name}`}
        />
      ) : null}
    </>
  );
};

export default StoreDetailPage;
