import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { usePublicStores } from '@/application/useCases/stores/usePublicStores';
import { ROUTES } from '@/shared/constants/routes';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';

type StoreTab = 'all' | 'STORE' | 'RESTAURANT';

const FALLBACK_GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-700',
  'from-rose-500 to-pink-700',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-cyan-700',
];

function storeBannerStyle(store: IStore): React.CSSProperties {
  if (store.primaryColor) {
    const secondary = store.secondaryColor || store.primaryColor;
    if (store.coverStyle === 'SOLID') return { backgroundColor: store.primaryColor };
    return { background: `linear-gradient(135deg, ${store.primaryColor}, ${secondary})` };
  }
  return {};
}

const TABS: { value: StoreTab; label: string; icon: string }[] = [
  { value: 'all',        label: 'Todas',        icon: 'bx-store'        },
  { value: 'STORE',      label: 'Tiendas',      icon: 'bx-shopping-bag' },
  { value: 'RESTAURANT', label: 'Restaurantes', icon: 'bx-restaurant'   },
];

const StoresPage = () => {
  const { stores, loading, error } = usePublicStores();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const typeParam = searchParams.get('type');
  const activeTab: StoreTab = typeParam === 'STORE' || typeParam === 'RESTAURANT' ? typeParam : 'all';
  const setActiveTab = (tab: StoreTab) => {
    setSearchParams(tab === 'all' ? {} : { type: tab });
  };

  const hasRestaurants = stores.some((s) => s.storeType === 'RESTAURANT');
  const hasRegularStores = stores.some((s) => s.storeType === 'STORE');
  const showTabs = hasRestaurants && hasRegularStores;

  const visibleStores = stores
    .filter((s) => activeTab === 'all' || s.storeType === activeTab)
    .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className='section-full-bleed space-y-6 animate-fade-up'>
      <Helmet>
        <title>Tiendas disponibles — Merku</title>
        <meta
          name='description'
          content='Explora todas las tiendas y restaurantes disponibles en Merku. Encuentra productos locales y realiza tu pedido.'
        />
        <link
          rel='canonical'
          href={`${import.meta.env.VITE_APP_URL ?? ''}/stores`}
        />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Merku' />
        <meta
          property='og:url'
          content={`${import.meta.env.VITE_APP_URL ?? ''}/stores`}
        />
        <meta property='og:title' content='Tiendas disponibles — Merku' />
        <meta
          property='og:description'
          content='Explora todas las tiendas y restaurantes disponibles en Merku.'
        />
        <meta
          property='og:image'
          content={`${import.meta.env.VITE_APP_URL ?? ''}/og-image.png`}
        />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='Tiendas disponibles — Merku' />
        <meta
          name='twitter:description'
          content='Explora todas las tiendas y restaurantes disponibles en Merku.'
        />
      </Helmet>
      {/* Header — full-bleed background, content re-centers via .content-container */}
      <div className='gradient-hero relative overflow-hidden py-8 text-neutral-dark lg:rounded-b-[2.5rem]'>
        <div
          className='pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl'
          aria-hidden='true'
        />
        <div
          className='pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-highlight/20 blur-2xl'
          aria-hidden='true'
        />
        <div className='content-container relative z-10'>
          <div className='mx-auto max-w-2xl text-center'>
            <p className='mb-1 text-xs font-bold uppercase tracking-[0.2em] text-neutral-dark/60'>
              Merku
            </p>
            <h1 className='mb-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl'>
              {activeTab === 'RESTAURANT'
                ? 'Restaurantes'
                : 'Tiendas disponibles'}
            </h1>
            <div className='flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 shadow-panel ring-1 ring-white/60 backdrop-blur-sm transition-all focus-within:ring-2 focus-within:ring-neutral-dark/20'>
              <i
                className='bx bx-search text-xl text-neutral-dark/50'
                aria-hidden='true'
              />
              <input
                type='text'
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Buscar tiendas...'
                className='flex-1 bg-transparent text-sm font-medium text-neutral-dark placeholder:text-neutral-dark/40 focus:outline-none'
                aria-label='Buscar tiendas'
              />
              {search ? (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='text-neutral-dark/50 hover:text-neutral-dark'
                  aria-label='Limpiar'
                >
                  <i className='bx bx-x text-lg' aria-hidden='true' />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className='content-container space-y-6'>
        {/* Tabs */}
        {showTabs ? (
          <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
            {TABS.map(tab => (
              <button
                key={tab.value}
                type='button'
                onClick={() => setActiveTab(tab.value)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === tab.value
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
                }`}
              >
                <i className={`bx ${tab.icon} text-base`} aria-hidden='true' />
                {tab.label}
                {tab.value !== 'all' ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeTab === tab.value
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {stores.filter(s => s.storeType === tab.value).length}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        {/* Loading skeletons */}
        {loading ? (
          <div className='grid grid-cols-1 gap-6 sm:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-36 skeleton rounded-2xl' />
            ))}
          </div>
        ) : null}

        {/* Error */}
        {error ? (
          <div className='flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            <i className='bx bx-error-circle text-base' aria-hidden='true' />
            {error}
          </div>
        ) : null}

        {/* Grid */}
        {!loading && visibleStores.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center'>
            <i
              className='bx bx-store mb-3 text-5xl text-slate-300'
              aria-hidden='true'
            />
            <p className='font-semibold text-slate-500'>
              {activeTab === 'all'
                ? 'Aún no hay tiendas registradas'
                : activeTab === 'RESTAURANT'
                  ? 'No hay restaurantes registrados'
                  : 'No hay tiendas registradas'}
            </p>
          </div>
        ) : null}

        {!loading && visibleStores.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 sm:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]'>
            {visibleStores.map((store, idx) => {
              const fallback =
                FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length];
              const initial = store.name.charAt(0).toUpperCase();
              const bannerStyle = storeBannerStyle(store);
              const hasBrandColors = Boolean(store.primaryColor);

              return (
                <Link
                  key={store.id}
                  to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
                  className='group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-250 hover:-translate-y-1 hover:border-primary/25 hover:shadow-panel'
                >
                  {/* Banner */}
                  <div
                    className={`relative overflow-hidden ${
                      store.bannerUrl
                        ? ''
                        : hasBrandColors
                          ? ''
                          : `bg-gradient-to-br ${fallback}`
                    }`}
                    style={{
                      aspectRatio: '3 / 1',
                      ...(!store.bannerUrl && hasBrandColors ? bannerStyle : {})
                    }}
                  >
                    {store.bannerUrl ? (
                      <img
                        src={store.bannerUrl}
                        alt=''
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='absolute inset-0 flex items-center justify-center opacity-20'>
                        <span className='text-8xl font-black text-white'>
                          {initial}
                        </span>
                      </div>
                    )}
                    <div className='absolute right-3 top-3 flex gap-1'>
                      {store.storeType === 'RESTAURANT' ? (
                        <span className='rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white'>
                          🍽️ Restaurante
                        </span>
                      ) : null}
                      {store.isAdultContent ? (
                        <span className='rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white'>
                          +18
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Info */}
                  <div className='flex items-center gap-3 p-4'>
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className='-mt-8 h-12 w-12 flex-shrink-0 rounded-xl border-2 border-white object-cover shadow-md'
                      />
                    ) : (
                      <div
                        className={`-mt-8 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-white text-lg font-bold text-white shadow-md ${hasBrandColors ? '' : `bg-gradient-to-br ${fallback}`}`}
                        style={
                          hasBrandColors
                            ? { backgroundColor: store.primaryColor! }
                            : undefined
                        }
                      >
                        {initial}
                      </div>
                    )}
                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-bold text-slate-900 group-hover:text-primary'>
                        {store.name}
                      </p>
                      <p className='truncate text-xs text-slate-400'>
                        {store.description || 'Ver productos disponibles'}
                      </p>
                      {store.averageRating ? (
                        <div className='mt-0.5 flex items-center gap-1 text-xs'>
                          <i
                            className='bx bxs-star text-amber-400'
                            style={{ fontSize: 11 }}
                            aria-hidden='true'
                          />
                          <span className='font-semibold text-slate-700'>
                            {store.averageRating.toFixed(1)}
                          </span>
                          <span className='text-slate-400'>
                            ({store.reviewCount})
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <i
                      className='bx bx-chevron-right flex-shrink-0 text-xl text-slate-300'
                      aria-hidden='true'
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StoresPage;
