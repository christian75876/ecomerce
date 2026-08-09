import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicStoreDetail } from '@/application/useCases/stores/usePublicStoreDetail';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import { useCart } from '@/shared/hooks/useCart';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import Link from '@/presentation/ui/atoms/link/Simplelink';
import { ROUTES } from '@/shared/constants/routes';
import WhatsAppFloat from '@/presentation/ui/atoms/whatsapp/WhatsAppFloat';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import AgeGate, { isStoreVerified, markStoreVerified } from '@/presentation/ui/molecules/common/AgeGate';
import RestaurantMenuView from '@/presentation/ui/organisms/stores/RestaurantMenuView';
import StoreReviews from '@/presentation/ui/organisms/stores/StoreReviews';
import RouteFallback from '@/presentation/ui/organisms/navigation/RouteFallback';

// Fix Leaflet marker icons in Vite builds (same as MapAddressPicker)
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
  const navigate = useNavigate();
  const {
    store,
    products,
    menuCategories,
    loading,
    loadingMore,
    sortLoading,
    hasMore,
    loadMore,
    sortBy,
    changeSort,
    search: storeSearch,
    setSearch: setStoreSearch,
    totalItems: storeTotalItems,
    error,
  } = usePublicStoreDetail(slug);
  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const [ageVerified, setAgeVerified] = useState(false);
  const [storeSortOpen, setStoreSortOpen] = useState(false);
  const storeSortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!storeSortOpen) return;
    const h = (e: MouseEvent) => { if (!storeSortRef.current?.contains(e.target as Node)) setStoreSortOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [storeSortOpen]);

  const STORE_SORT_OPTIONS = [
    { value: 'newest'    as const, label: 'Más nuevos',            icon: 'bx-time'          },
    { value: 'price_asc' as const, label: 'Precio: menor a mayor', icon: 'bx-trending-up'   },
    { value: 'price_desc'as const, label: 'Precio: mayor a menor', icon: 'bx-trending-down' },
    { value: 'name_asc'  as const, label: 'Nombre A–Z',            icon: 'bx-sort-a-z'      },
  ];

  // Search now hits the backend (usePublicStoreDetail debounces + refetches),
  // so what's loaded is already the right set — no client-side filtering left.
  const filteredStoreProducts = products;

  useEffect(() => {
    if (!store) return;
    setAgeVerified(!store.isAdultContent || isStoreVerified(store.id));
  }, [store]);

  useEffect(() => {
    if (!scrollSentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: '320px 0px' },
    );

    observer.observe(scrollSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (loading) {
    return <RouteFallback message="Cargando tienda" />;
  }

  if (error || !store) {
    return (
      <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
        {error || 'No fue posible encontrar la tienda.'}
      </Box>
    );
  }

  if (store.isAdultContent && !ageVerified) {
    return (
      <AgeGate
        storeName={store.name}
        onVerified={() => {
          markStoreVerified(store.id);
          setAgeVerified(true);
        }}
        onDenied={() => navigate(ROUTES.PUBLIC.STORES)}
      />
    );
  }

  const themeVars = buildStoreTheme(store);
  const font = fontClass(store.fontStyle);

  return (
    <>
      <Helmet>
        <title>{`${store.name} — Merku`}</title>
        <meta name='description' content={store.description || `Explora los productos de ${store.name} en Merku.`} />
        <link rel='canonical' href={`${import.meta.env.VITE_APP_URL ?? ''}/stores/${store.slug}`} />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Merku' />
        <meta property='og:url' content={`${import.meta.env.VITE_APP_URL ?? ''}/stores/${store.slug}`} />
        <meta property='og:title' content={`${store.name} — Merku`} />
        <meta property='og:description' content={store.description || `Explora los productos de ${store.name} en Merku.`} />
        <meta property='og:image' content={store.bannerUrl || store.logoUrl || `${import.meta.env.VITE_APP_URL ?? ''}/og-image.svg`} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={`${store.name} — Merku`} />
        <meta name='twitter:description' content={store.description || `Explora los productos de ${store.name} en Merku.`} />
        <meta name='twitter:image' content={store.bannerUrl || store.logoUrl || `${import.meta.env.VITE_APP_URL ?? ''}/og-image.svg`} />
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
                {store.averageRating ? (
                  <div className='mt-1.5 flex items-center gap-1.5 text-sm' style={{ color: 'inherit' }}>
                    <i className='bx bxs-star text-amber-300' aria-hidden='true' />
                    <span className='font-semibold'>{store.averageRating.toFixed(1)}</span>
                    <span className='opacity-70'>({store.reviewCount} {store.reviewCount === 1 ? 'reseña' : 'reseñas'})</span>
                  </div>
                ) : null}
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

        {/* ── Store location map ── */}
        {store.lat && store.lng ? (
          <div className='rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm'>
            <div className='flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100'>
              <div className='flex items-center gap-2'>
                <i className='bx bx-map-pin text-lg text-primary' aria-hidden='true' />
                <span className='text-sm font-semibold text-slate-800'>Ubicación de la tienda</span>
              </div>
              {store.addressText ? (
                <span className='text-xs text-slate-500 max-w-[60%] truncate'>{store.addressText}</span>
              ) : null}
              <a
                href={`https://www.google.com/maps?q=${store.lat},${store.lng}`}
                target='_blank'
                rel='noopener noreferrer'
                className='ml-3 flex-shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:underline'
              >
                <i className='bx bx-link-external text-sm' aria-hidden='true' />
                <span className='hidden sm:inline'>Ver en Google Maps</span>
              </a>
            </div>
            <div className='isolate' style={{ height: 240 }}>
              <MapContainer
                center={[store.lat, store.lng]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                zoomControl={false}
              >
                <TileLayer
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[store.lat, store.lng]} />
              </MapContainer>
            </div>
          </div>
        ) : null}

        {/* ── Products / Menu ── */}
        <div style={{ backgroundColor: themeVars.backgroundColor }}>
          {store.storeType === 'RESTAURANT' ? (
            <RestaurantMenuView
              products={products}
              menuCategories={menuCategories}
              menuPdfUrl={store.menuPdfUrl}
              layoutStyle={store.layoutStyle}
              buttonStyle={store.buttonStyle}
              primaryColor={store.primaryColor || undefined}
              search={storeSearch}
              onSearchChange={setStoreSearch}
              storeName={store.name}
              onAddToCart={(productId) => {
                const product = products.find((item) => item.id === productId);
                if (!product) return;
                addItem({ productId: product.id, name: product.name, price: Number(product.price), imageUrl: product.imageUrl, storeId: store.id, storeAddressText: store.addressText, storeDeliveryOptions: store.deliveryOptions, maxStock: product.availableQuantity });
                const label = product.name.length > 28 ? `${product.name.slice(0, 28)}…` : product.name;
                SnackbarUtilities.success(`${label} agregado al carrito`, 'top', 'center');
              }}
            />
          ) : (
            <div className='space-y-4'>
              {/* Search + sort bar */}
              {products.length > 3 ? (
                <div className='flex items-center gap-2'>
                  <div className='flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10'>
                    <i className='bx bx-search shrink-0 text-lg text-slate-400' aria-hidden='true' />
                    <input
                      type='search'
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      placeholder={`Buscar en ${store.name}...`}
                      className='flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none'
                    />
                    {storeSearch ? (
                      <button type='button' onClick={() => setStoreSearch('')} className='shrink-0 text-slate-400 hover:text-slate-600'>
                        <i className='bx bx-x text-lg' aria-hidden='true' />
                      </button>
                    ) : null}
                  </div>

                  <div ref={storeSortRef} className='relative shrink-0'>
                    <button
                      type='button'
                      onClick={() => setStoreSortOpen((o) => !o)}
                      disabled={sortLoading}
                      className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary disabled:opacity-60'
                    >
                      <i className={`bx ${sortLoading ? 'bx-loader-alt bx-spin' : STORE_SORT_OPTIONS.find((o) => o.value === sortBy)?.icon} text-base`} aria-hidden='true' />
                      <span className='hidden sm:inline'>{STORE_SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                      <i className={`bx bx-chevron-down text-base transition-transform ${storeSortOpen ? 'rotate-180' : ''}`} aria-hidden='true' />
                    </button>
                    {storeSortOpen ? (
                      <div className='absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[200px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl'>
                        {STORE_SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type='button'
                            onClick={() => { void changeSort(opt.value); setStoreSortOpen(false); }}
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                              sortBy === opt.value ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <i className={`bx ${opt.icon} text-base`} aria-hidden='true' />
                            {opt.label}
                            {sortBy === opt.value ? <i className='bx bx-check ml-auto text-primary' aria-hidden='true' /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Product count feedback */}
              {storeSearch && (
                <p className='text-sm text-slate-500'>
                  {storeTotalItems === 0
                    ? `Sin resultados para "${storeSearch}"`
                    : `${storeTotalItems} resultado${storeTotalItems === 1 ? '' : 's'} para "${storeSearch}"`}
                </p>
              )}

              <ProductBody
                products={filteredStoreProducts}
                loading={sortLoading}
                layoutStyle={store.layoutStyle}
                buttonStyle={store.buttonStyle}
                primaryColor={store.primaryColor || undefined}
                emptyMessage='Esta tienda todavía no tiene productos activos.'
                onAddToCart={(productId) => {
                  const product = products.find((item) => item.id === productId);
                  if (!product) return;
                  addItem({ productId: product.id, name: product.name, price: Number(product.price), imageUrl: product.imageUrl, storeId: store.id, storeAddressText: store.addressText, storeDeliveryOptions: store.deliveryOptions, maxStock: product.availableQuantity });
                  const label = product.name.length > 28 ? `${product.name.slice(0, 28)}…` : product.name;
                  SnackbarUtilities.success(`${label} agregado al carrito`, 'top', 'center');
                }}
              />
            </div>
          )}

          {hasMore ? <div ref={scrollSentinelRef} className='h-1 w-full' /> : null}

          {loadingMore ? (
            <Typography className='py-4 text-center text-sm text-slate-400'>
              Cargando más productos...
            </Typography>
          ) : null}
        </div>
      </div>

      <StoreReviews storeId={store.id} />

      {(store.whatsappNumber || store.phone || import.meta.env.VITE_WHATSAPP_SUPPORT) ? (
        <WhatsAppFloat
          phoneNumber={(store.whatsappNumber || store.phone || import.meta.env.VITE_WHATSAPP_SUPPORT)!}
          message={`Hola, te escribo desde Merku sobre la tienda ${store.name}`}
        />
      ) : null}
    </>
  );
};

export default StoreDetailPage;
