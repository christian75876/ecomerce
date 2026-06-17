import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { usePublicStores } from '@/application/useCases/stores/usePublicStores';
import { ROUTES } from '@/shared/constants/routes';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { setupLeafletIcons } from '@/shared/utils/leafletSetup';

setupLeafletIcons();

type StoreTab = 'all' | 'STORE' | 'RESTAURANT';
type ViewMode = 'grid' | 'map';

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

function FitBounds({ stores }: { stores: IStore[] }) {
  const map = useMap();
  useEffect(() => {
    if (stores.length === 0) return;
    if (stores.length === 1) {
      map.setView([stores[0].lat!, stores[0].lng!], 15);
      return;
    }
    const bounds = L.latLngBounds(stores.map((s) => [s.lat!, s.lng!] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [map, stores]);
  return null;
}

const TABS: { value: StoreTab; label: string; icon: string }[] = [
  { value: 'all',        label: 'Todas',        icon: 'bx-store'        },
  { value: 'STORE',      label: 'Tiendas',      icon: 'bx-shopping-bag' },
  { value: 'RESTAURANT', label: 'Restaurantes', icon: 'bx-restaurant'   },
];

const StoresPage = () => {
  const { stores, loading, error } = usePublicStores();
  const [activeTab, setActiveTab] = useState<StoreTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mapFilter, setMapFilter] = useState<StoreTab>('all');

  const hasRestaurants = stores.some((s) => s.storeType === 'RESTAURANT');
  const hasRegularStores = stores.some((s) => s.storeType === 'STORE');
  const showTabs = hasRestaurants && hasRegularStores;

  const visibleStores = activeTab === 'all'
    ? stores
    : stores.filter((s) => s.storeType === activeTab);

  // Map always works from ALL located stores, with its own independent filter
  const allLocatedStores = stores.filter((s) => s.lat != null && s.lng != null);
  const mapLocated = mapFilter === 'all'
    ? allLocatedStores
    : allLocatedStores.filter((s) => s.storeType === mapFilter);
  const mapHasRestaurants = allLocatedStores.some((s) => s.storeType === 'RESTAURANT');
  const mapHasStores = allLocatedStores.some((s) => s.storeType === 'STORE');

  const tabLabel = activeTab === 'RESTAURANT' ? 'restaurantes' : activeTab === 'STORE' ? 'tiendas' : 'comercios';

  return (
    <div className='space-y-6 animate-fade-up'>
      {/* Header */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-lg sm:px-10'>
        <div className='pointer-events-none absolute inset-0 opacity-10' aria-hidden='true' />
        <div className='relative flex items-end justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Marketplace</p>
            <h1 className='mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl'>
              {activeTab === 'RESTAURANT' ? 'Restaurantes' : 'Tiendas activas'}
            </h1>
            <p className='mt-2 text-sm text-white/70'>
              {loading ? 'Cargando...' : `${visibleStores.length} ${tabLabel} disponibles`}
            </p>
          </div>

          {/* View toggle */}
          {!loading && visibleStores.length > 0 ? (
            <div className='flex shrink-0 items-center gap-1 rounded-2xl bg-white/15 p-1 backdrop-blur'>
              <button
                type='button'
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'grid' ? 'bg-white text-primary shadow' : 'text-white/80 hover:text-white'
                }`}
              >
                <i className='bx bx-grid-alt text-sm' aria-hidden='true' />
                Lista
              </button>
              <button
                type='button'
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'map' ? 'bg-white text-primary shadow' : 'text-white/80 hover:text-white'
                }`}
              >
                <i className='bx bx-map text-sm' aria-hidden='true' />
                Mapa
                {allLocatedStores.length > 0 ? (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${viewMode === 'map' ? 'bg-primary/10 text-primary' : 'bg-white/20 text-white'}`}>
                    {allLocatedStores.length}
                  </span>
                ) : null}
              </button>
            </div>
          ) : null}
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

      {/* Loading */}
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

      {/* Empty */}
      {!loading && visibleStores.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center'>
          <i className='bx bx-store mb-3 text-5xl text-slate-300' aria-hidden='true' />
          <p className='font-semibold text-slate-500'>
            {activeTab === 'all' ? 'Aún no hay tiendas registradas' : `No hay ${tabLabel} registrados`}
          </p>
        </div>
      ) : null}

      {/* ── MAP VIEW ── */}
      {!loading && viewMode === 'map' ? (
        <div className='overflow-hidden rounded-3xl border border-slate-200 shadow-sm'>
          {allLocatedStores.length === 0 ? (
            <div className='flex flex-col items-center justify-center bg-slate-50 py-20 text-center'>
              <i className='bx bx-map-pin mb-3 text-5xl text-slate-300' aria-hidden='true' />
              <p className='font-semibold text-slate-500'>Ninguna tienda ha configurado su ubicación aún</p>
              <p className='mt-1 text-sm text-slate-400'>Los vendedores pueden agregarla desde su panel de administración.</p>
            </div>
          ) : (
            <>
              {/* Internal map filter */}
              {(mapHasStores && mapHasRestaurants) ? (
                <div className='flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3'>
                  <i className='bx bx-filter-alt text-slate-400 text-sm' aria-hidden='true' />
                  <span className='mr-1 text-xs font-semibold text-slate-500'>Filtrar:</span>
                  {(
                    [
                      { value: 'all' as StoreTab,        label: 'Todos',        icon: 'bx-store'        },
                      { value: 'STORE' as StoreTab,      label: 'Tiendas',      icon: 'bx-shopping-bag' },
                      { value: 'RESTAURANT' as StoreTab, label: 'Restaurantes', icon: 'bx-restaurant'   },
                    ] as { value: StoreTab; label: string; icon: string }[]
                  ).map((f) => {
                    const count = f.value === 'all'
                      ? allLocatedStores.length
                      : allLocatedStores.filter((s) => s.storeType === f.value).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={f.value}
                        type='button'
                        onClick={() => setMapFilter(f.value)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                          mapFilter === f.value
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        <i className={`bx ${f.icon} text-sm`} aria-hidden='true' />
                        {f.label}
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${mapFilter === f.value ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {/* Map */}
              {mapLocated.length === 0 ? (
                <div className='flex flex-col items-center justify-center bg-slate-50 py-16 text-center'>
                  <i className='bx bx-map-pin mb-2 text-4xl text-slate-300' aria-hidden='true' />
                  <p className='text-sm font-semibold text-slate-500'>
                    No hay {mapFilter === 'RESTAURANT' ? 'restaurantes' : 'tiendas'} con ubicación física
                  </p>
                </div>
              ) : (
                <MapContainer
                  center={[4.5709, -74.2973]}
                  zoom={6}
                  style={{ height: 520, width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <FitBounds stores={mapLocated} />
                  {mapLocated.map((store) => (
                    <Marker key={store.id} position={[store.lat!, store.lng!]}>
                      <Popup minWidth={210}>
                        <div className='py-1'>
                          <div className='flex items-center gap-2 pb-2'>
                            {store.logoUrl ? (
                              <img src={store.logoUrl} alt={store.name} className='h-9 w-9 flex-shrink-0 rounded-lg object-cover' />
                            ) : (
                              <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary'>
                                {store.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className='font-bold text-slate-800 leading-tight'>{store.name}</p>
                              <span className={`text-[10px] font-semibold ${store.storeType === 'RESTAURANT' ? 'text-amber-600' : 'text-primary'}`}>
                                {store.storeType === 'RESTAURANT' ? '🍽️ Restaurante' : '🏪 Tienda'}
                              </span>
                            </div>
                          </div>
                          {store.addressText ? (
                            <p className='pb-2 text-xs text-slate-500'>{store.addressText}</p>
                          ) : null}
                          <div className='flex flex-col gap-1.5'>
                            <a
                              href={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
                              className='block rounded-lg bg-primary px-3 py-1.5 text-center text-xs font-semibold text-white transition hover:opacity-90'
                            >
                              Ver tienda →
                            </a>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='block rounded-lg border border-slate-300 px-3 py-1.5 text-center text-xs font-semibold text-slate-600 transition hover:bg-slate-50'
                            >
                              📍 Cómo llegar
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}

              {/* Footer: stores without location */}
              {allLocatedStores.length < stores.length ? (
                <div className='flex items-center gap-2 bg-slate-50 px-4 py-2.5 text-xs text-slate-500'>
                  <i className='bx bx-info-circle text-sm' aria-hidden='true' />
                  Solo se muestran las {allLocatedStores.length} tienda{allLocatedStores.length !== 1 ? 's' : ''} con ubicación física registrada.
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {/* ── GRID VIEW ── */}
      {!loading && visibleStores.length > 0 && viewMode === 'grid' ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {visibleStores.map((store, idx) => {
            const fallback = FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length];
            const initial = store.name.charAt(0).toUpperCase();
            const bannerStyle = storeBannerStyle(store);
            const hasBrandColors = Boolean(store.primaryColor);
            const hasLocation = store.lat != null && store.lng != null;

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
                    <img src={store.bannerUrl} alt='' className='h-full w-full object-cover opacity-30 mix-blend-overlay' />
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
                  {/* Location badge */}
                  {hasLocation ? (
                    <div className='absolute bottom-2 left-3'>
                      <span className='flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm backdrop-blur'>
                        <i className='bx bx-map-pin text-xs text-emerald-600' aria-hidden='true' />
                        Tienda física
                      </span>
                    </div>
                  ) : null}
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
                    {hasLocation && store.addressText ? (
                      <p className='mt-0.5 flex items-center gap-1 truncate text-[10px] text-emerald-600'>
                        <i className='bx bx-map-pin flex-shrink-0 text-xs' aria-hidden='true' />
                        {store.addressText.split(',')[0]}
                      </p>
                    ) : null}
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
