import { useState } from 'react';
import { Link } from 'react-router-dom';
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

function storeBannerStyle(store: IStore, idx: number): React.CSSProperties {
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
  const [activeTab, setActiveTab] = useState<StoreTab>('all');
  const [search, setSearch] = useState('');

  const hasRestaurants = stores.some((s) => s.storeType === 'RESTAURANT');
  const hasRegularStores = stores.some((s) => s.storeType === 'STORE');
  const showTabs = hasRestaurants && hasRegularStores;

  const visibleStores = stores
    .filter((s) => activeTab === 'all' || s.storeType === activeTab)
    .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className='space-y-6 animate-fade-up'>
      {/* Header */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-6 text-white shadow-lg sm:px-10'>
        <div className='pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5' aria-hidden='true' />
        <div className='pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/5' aria-hidden='true' />
        <div className='relative z-10 mx-auto max-w-2xl text-center'>
          <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Marketplace</p>
          <h1 className='mb-3 text-2xl font-extrabold tracking-tight'>
            {activeTab === 'RESTAURANT' ? 'Restaurantes' : 'Tiendas disponibles'}
          </h1>
          <div className='flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 ring-1 ring-white/20 backdrop-blur-sm transition-all focus-within:bg-white/20 focus-within:ring-white/40'>
            <i className='bx bx-search text-xl text-white/70' aria-hidden='true' />
            <input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar tiendas...'
              className='flex-1 bg-transparent text-sm font-medium text-white placeholder:text-white/50 focus:outline-none'
              aria-label='Buscar tiendas'
            />
            {search ? (
              <button type='button' onClick={() => setSearch('')} className='text-white/60 hover:text-white' aria-label='Limpiar'>
                <i className='bx bx-x text-lg' aria-hidden='true' />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs */}
      {showTabs ? (
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
          {TABS.map((tab) => (
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
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {stores.filter((s) => s.storeType === tab.value).length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {/* Loading skeletons */}
      {loading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
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
          <i className='bx bx-store mb-3 text-5xl text-slate-300' aria-hidden='true' />
          <p className='font-semibold text-slate-500'>
            {activeTab === 'all' ? 'Aún no hay tiendas registradas' : activeTab === 'RESTAURANT' ? 'No hay restaurantes registrados' : 'No hay tiendas registradas'}
          </p>
        </div>
      ) : null}

      {!loading && visibleStores.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {visibleStores.map((store, idx) => {
            const fallback = FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length];
            const initial = store.name.charAt(0).toUpperCase();
            const bannerStyle = storeBannerStyle(store, idx);
            const hasBrandColors = Boolean(store.primaryColor);

            return (
              <Link
                key={store.id}
                to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
                className='group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md'
              >
                {/* Banner */}
                <div
                  className={`relative h-24 ${hasBrandColors ? '' : `bg-gradient-to-br ${fallback}`}`}
                  style={hasBrandColors ? bannerStyle : undefined}
                >
                  {store.bannerUrl ? (
                    <img
                      src={store.bannerUrl}
                      alt=''
                      className='h-full w-full object-cover opacity-30 mix-blend-overlay'
                    />
                  ) : null}
                  <div className='absolute inset-0 flex items-center justify-center opacity-10'>
                    <span className='text-8xl font-black text-white'>{initial}</span>
                  </div>
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
                      style={hasBrandColors ? { backgroundColor: store.primaryColor! } : undefined}
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
                  </div>
                  <i className='bx bx-chevron-right flex-shrink-0 text-xl text-slate-300' aria-hidden='true' />
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default StoresPage;
