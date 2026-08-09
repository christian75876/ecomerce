import { useState, useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { usePublicStores } from '@/application/useCases/stores/usePublicStores';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ROUTES } from '@/shared/constants/routes';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type StoreWithCoords = IStore & { lat: number; lng: number };
type RouteInfo = { distanceM: number; durationS: number };
type OsrmResponse = {
  routes?: Array<{
    geometry: { coordinates: [number, number][] };
    distance: number;
    duration: number;
  }>;
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatTime(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

function gmapsDirectionsUrl(store: StoreWithCoords, from: [number, number] | null): string {
  const dest = `${store.lat},${store.lng}`;
  if (from) {
    return `https://www.google.com/maps/dir/?api=1&origin=${from[0]},${from[1]}&destination=${dest}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

function routeZoom(distKm: number): number {
  if (distKm < 1) return 15;
  if (distKm < 5) return 13;
  if (distKm < 20) return 11;
  if (distKm < 60) return 9;
  return 7;
}

// ── Map sub-components ───────────────────────────────────────────────────────

function MapFlyer({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.9 });
  }, [map, center, zoom]);
  return null;
}

// ── Marker icons ─────────────────────────────────────────────────────────────

function makeStoreIcon(store: IStore, selected: boolean): L.DivIcon {
  const bg = store.primaryColor || '#6366f1';
  const size = selected ? 44 : 34;
  const letter = store.name.charAt(0).toUpperCase();
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${bg};
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px ${selected ? '12px' : '6px'} rgba(0,0,0,${selected ? '0.4' : '0.22'});
      display:flex;align-items:center;justify-content:center;
    "><span style="
      transform:rotate(45deg);color:white;font-weight:800;
      font-size:${selected ? '16px' : '12px'};font-family:system-ui,sans-serif;line-height:1;
      pointer-events:none;
    ">${letter}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)],
    className: '',
  });
}

const USER_ICON = L.divIcon({
  html: `<div style="
    width:18px;height:18px;background:#3b82f6;
    border:3px solid white;border-radius:50%;
    box-shadow:0 0 0 6px rgba(59,130,246,0.18);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
});

const COLOMBIA: [number, number] = [4.5709, -74.2973];

// ── Page ─────────────────────────────────────────────────────────────────────

const StoreMapPage = () => {
  const { stores, loading } = usePublicStores();

  const [search, setSearch] = useState('');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<{ center: [number, number]; zoom: number } | null>(null);

  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeStoreId, setRouteStoreId] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Derived store lists ──────────────────────────────────────────────────

  const storesWithCoords = stores.filter(
    (s): s is StoreWithCoords => s.lat !== null && s.lng !== null,
  );

  const filtered = storesWithCoords.filter(
    (s) => !search.trim() || s.name.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const sorted = userPos
    ? [...filtered].sort(
        (a, b) =>
          haversineKm(userPos[0], userPos[1], a.lat, a.lng) -
          haversineKm(userPos[0], userPos[1], b.lat, b.lng),
      )
    : filtered;

  // ── Actions ──────────────────────────────────────────────────────────────

  const clearRoute = useCallback(() => {
    setRouteCoords(null);
    setRouteInfo(null);
    setRouteStoreId(null);
  }, []);

  const selectStore = useCallback(
    (store: StoreWithCoords) => {
      if (selectedId !== store.id) clearRoute();
      setSelectedId(store.id);
      setFlyTo({ center: [store.lat, store.lng], zoom: 16 });
      setTimeout(() => {
        cardRefs.current[store.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    },
    [selectedId, clearRoute],
  );

  const fetchOSRMRoute = useCallback(async (from: [number, number], store: StoreWithCoords) => {
    setLoadingRoute(true);
    setRouteStoreId(store.id);
    setRouteCoords(null);
    setRouteInfo(null);
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${from[1]},${from[0]};${store.lng},${store.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = (await res.json()) as OsrmResponse;
      if (data.routes?.[0]) {
        const r = data.routes[0];
        const coords: [number, number][] = r.geometry.coordinates.map(
          ([lng, lat]) => [lat, lng],
        );
        setRouteCoords(coords);
        setRouteInfo({ distanceM: r.distance, durationS: r.duration });

        const distKm = haversineKm(from[0], from[1], store.lat, store.lng);
        const midLat = (from[0] + store.lat) / 2;
        const midLng = (from[1] + store.lng) / 2;
        setFlyTo({ center: [midLat, midLng], zoom: routeZoom(distKm) });
      }
    } catch {
      // OSRM unavailable — silently ignore
    } finally {
      setLoadingRoute(false);
    }
  }, []);

  const requestRoute = useCallback(
    (store: StoreWithCoords) => {
      selectStore(store);
      if (userPos) {
        void fetchOSRMRoute(userPos, store);
        return;
      }
      if (!navigator.geolocation) return;
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const pos: [number, number] = [coords.latitude, coords.longitude];
          setUserPos(pos);
          setLocating(false);
          void fetchOSRMRoute(pos, store);
        },
        () => setLocating(false),
      );
    },
    [userPos, fetchOSRMRoute, selectStore],
  );

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude];
        setUserPos(pos);
        setFlyTo({ center: pos, zoom: 13 });
        setLocating(false);
      },
      () => setLocating(false),
    );
  }, []);

  // ── Search controls (reused in both mobile strip and desktop sidebar) ────

  const SearchControls = () => (
    <div className='space-y-2'>
      <div className='relative'>
        <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' aria-hidden='true' />
        <input
          type='search'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscar tienda...'
          className='w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
        />
      </div>
      <button
        type='button'
        onClick={handleMyLocation}
        disabled={locating}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-2 text-xs font-semibold transition disabled:opacity-60 ${
          userPos
            ? 'border-primary/30 bg-primary/5 text-primary'
            : 'border-slate-200 text-slate-600 hover:border-primary/30 hover:text-primary'
        }`}
      >
        <i
          className={`bx text-base ${locating ? 'bx-loader-alt animate-spin' : 'bx-current-location'}`}
          aria-hidden='true'
        />
        {locating ? 'Detectando...' : userPos ? 'Mostrando tiendas cercanas' : 'Tiendas cerca de mí'}
      </button>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Helmet>
        <title>Mapa de tiendas — Merku</title>
        <meta name='description' content='Encuentra tiendas cercanas, obtén indicaciones y explora el catálogo de cada tienda.' />
        <link rel='canonical' href={`${import.meta.env.VITE_APP_URL ?? ''}/stores/map`} />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Merku' />
        <meta property='og:url' content={`${import.meta.env.VITE_APP_URL ?? ''}/stores/map`} />
        <meta property='og:title' content='Mapa de tiendas — Merku' />
        <meta property='og:description' content='Encuentra tiendas cercanas, obtén indicaciones y explora el catálogo de cada tienda.' />
        <meta property='og:image' content={`${import.meta.env.VITE_APP_URL ?? ''}/og-image.svg`} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='Mapa de tiendas — Merku' />
        <meta name='twitter:description' content='Encuentra tiendas cercanas, obtén indicaciones y explora el catálogo de cada tienda.' />
        <meta name='twitter:image' content={`${import.meta.env.VITE_APP_URL ?? ''}/og-image.svg`} />
      </Helmet>

      {/* Page header */}
      <div className='mb-3 flex items-end justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-slate-900'>Mapa de tiendas</h1>
          <p className='mt-0.5 text-sm text-slate-400'>
            {loading
              ? 'Cargando tiendas...'
              : `${storesWithCoords.length} tienda${storesWithCoords.length !== 1 ? 's' : ''} con ubicación`}
          </p>
        </div>
        <Link
          to={ROUTES.PUBLIC.STORES}
          className='flex items-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary'
        >
          <i className='bx bx-grid-alt text-base' aria-hidden='true' />
          <span className='hidden sm:inline'>Ver todas</span>
        </Link>
      </div>

      {/* ── Mobile search strip (above map, hidden on sm+) ── */}
      <div className='mb-2 sm:hidden'>
        <SearchControls />
      </div>

      {/* ── Main layout ── */}
      {/* Mobile: subtract search strip (~5.5rem) + bottom navbar (~5rem) + header (~4rem) + gaps */}
      {/* Desktop: no bottom navbar, no search strip above */}
      <div className='flex overflow-hidden rounded-3xl border border-slate-200 shadow-sm h-[max(400px,calc(100svh-18rem))] sm:h-[max(520px,calc(100svh-9rem))]'>
        {/* Desktop sidebar — search only, no store list */}
        <div className='hidden sm:flex sm:w-60 sm:flex-shrink-0 sm:flex-col sm:border-r sm:border-slate-100 sm:bg-white'>
          <div className='border-b border-slate-100 p-3'>
            <SearchControls />
          </div>
          {/* Store count summary */}
          <div className='px-4 py-3 text-xs text-slate-400'>
            {loading ? (
              <div className='h-4 w-24 animate-pulse rounded bg-slate-100' />
            ) : (
              <span>
                <span className='font-semibold text-slate-600'>{sorted.length}</span>
                {' tienda'}{sorted.length !== 1 ? 's' : ''}{' en el mapa'}
              </span>
            )}
          </div>
        </div>

        {/* ── Map ── */}
        {/* isolate: Leaflet's internal controls use z-index:1000 by default,
            which would otherwise bleed above the fixed mobile bottom navbar
            (z-50). Isolating creates a local stacking context they can't escape. */}
        <div className='relative isolate min-h-0 flex-1'>
          <MapContainer
            center={COLOMBIA}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {flyTo ? <MapFlyer center={flyTo.center} zoom={flyTo.zoom} /> : null}

            {userPos ? <Marker position={userPos} icon={USER_ICON} /> : null}

            {routeCoords ? (
              <Polyline positions={routeCoords} color='#6366f1' weight={5} opacity={0.85} />
            ) : null}

            {sorted.map((store) => {
              const dist = userPos
                ? haversineKm(userPos[0], userPos[1], store.lat, store.lng)
                : null;
              const isLoadingRoute = loadingRoute && routeStoreId === store.id;
              const hasRoute = routeStoreId === store.id && routeCoords !== null;

              return (
                <Marker
                  key={store.id}
                  position={[store.lat, store.lng]}
                  icon={makeStoreIcon(store, selectedId === store.id)}
                  eventHandlers={{ click: () => selectStore(store) }}
                  ref={(el) => { if (el) cardRefs.current[store.id] = null; }}
                >
                  {/* ── Compact popup ── */}
                  <Popup minWidth={168} maxWidth={200} className='compact-map-popup'>
                    <div style={{ margin: '-6px -10px', padding: '10px' }}>
                      {/* Store header */}
                      <div className='flex items-center gap-2'>
                        {store.logoUrl ? (
                          <img
                            src={store.logoUrl}
                            alt={store.name}
                            className='h-8 w-8 flex-shrink-0 rounded-xl object-cover'
                          />
                        ) : (
                          <div
                            className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white'
                            style={{ background: store.primaryColor || '#6366f1' }}
                          >
                            {store.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className='min-w-0'>
                          <p className='truncate text-xs font-bold leading-tight text-slate-800'>
                            {store.name}
                          </p>
                          <p className='text-[10px] text-slate-400'>
                            {store.storeType === 'RESTAURANT' ? '🍽️ Restaurante' : '🏪 Tienda'}
                          </p>
                        </div>
                        {dist !== null ? (
                          <span className='ml-auto flex-shrink-0 text-[10px] font-bold text-primary'>
                            {formatDist(dist)}
                          </span>
                        ) : null}
                      </div>

                      {/* Actions */}
                      <div className='mt-2 flex gap-1.5'>
                        <button
                          type='button'
                          onClick={() => requestRoute(store)}
                          disabled={loadingRoute}
                          className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold transition disabled:opacity-60 ${
                            hasRoute
                              ? 'bg-primary text-white'
                              : 'border border-primary/30 text-primary hover:bg-primary hover:text-white'
                          }`}
                        >
                          <i
                            className={`bx text-xs ${isLoadingRoute ? 'bx-loader-alt animate-spin' : 'bx-navigation'}`}
                            aria-hidden='true'
                          />
                          {isLoadingRoute ? 'Calculando...' : hasRoute ? 'Ruta activa' : 'Llegar'}
                        </button>
                        <a
                          href={gmapsDirectionsUrl(store, userPos)}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-white transition hover:opacity-90'
                          style={{ background: store.primaryColor || '#6366f1' }}
                        >
                          <i className='bx bx-map text-xs' aria-hidden='true' />
                          Maps
                        </a>
                        <Link
                          to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
                          className='flex flex-1 items-center justify-center rounded-lg border border-slate-200 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50'
                        >
                          Ver
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Route info banner */}
          {routeInfo ? (
            <div className='pointer-events-auto absolute left-1/2 top-3 z-[500] -translate-x-1/2'>
              <div className='flex items-center gap-3 rounded-2xl border border-white/60 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-sm'>
                <i className='bx bx-car text-xl text-primary' aria-hidden='true' />
                <div>
                  <p className='text-sm font-bold text-slate-800'>{formatDist(routeInfo.distanceM / 1000)}</p>
                  <p className='text-xs text-slate-500'>≈ {formatTime(routeInfo.durationS)} en carro</p>
                </div>
                <button
                  type='button'
                  onClick={clearRoute}
                  className='ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200'
                  title='Cerrar ruta'
                >
                  <i className='bx bx-x text-sm' aria-hidden='true' />
                </button>
              </div>
            </div>
          ) : null}

          {/* No-location hint */}
          {!userPos && !locating && storesWithCoords.length > 0 ? (
            <div className='pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 w-max max-w-[85vw]'>
              <div className='rounded-2xl border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm'>
                <p className='text-xs font-medium text-slate-600'>
                  <i className='bx bx-current-location mr-1 text-primary' aria-hidden='true' />
                  Comparte tu ubicación para ver tiendas cercanas
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default StoreMapPage;
