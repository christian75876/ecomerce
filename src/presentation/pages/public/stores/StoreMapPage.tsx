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
      // OSRM unavailable — silently ignore, user still has Google Maps
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

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Helmet>
        <title>Mapa de tiendas — Marketplace</title>
        <meta name='description' content='Encuentra tiendas cercanas y obtén cómo llegar.' />
      </Helmet>

      {/* Page header */}
      <div className='mb-4 flex items-end justify-between'>
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

      {/* Main split layout */}
      <div
        className='flex flex-col overflow-hidden rounded-3xl border border-slate-200 shadow-sm sm:flex-row'
        style={{ height: 'max(520px, calc(100svh - 14rem))' }}
      >
        {/* ── Sidebar ── */}
        <div className='h-[44%] flex flex-col overflow-hidden border-b border-slate-100 bg-white sm:h-auto sm:w-80 sm:flex-shrink-0 sm:border-b-0 sm:border-r'>

          {/* Search + locate */}
          <div className='flex-shrink-0 space-y-2 border-b border-slate-100 p-3'>
            <div className='relative'>
              <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' aria-hidden='true' />
              <input
                type='search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Buscar tienda...'
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
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
              {locating
                ? 'Detectando...'
                : userPos
                  ? 'Mostrando tiendas cercanas'
                  : 'Tiendas cerca de mí'}
            </button>
          </div>

          {/* Store list */}
          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='space-y-2 p-3'>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='h-16 animate-pulse rounded-2xl bg-slate-100' />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 text-center'>
                <i className='bx bx-map mb-2 text-3xl text-slate-300' aria-hidden='true' />
                <p className='text-sm text-slate-400'>
                  {search ? 'Sin resultados' : 'Ninguna tienda tiene ubicación registrada aún'}
                </p>
              </div>
            ) : (
              <div className='space-y-1 p-3'>
                {sorted.map((store) => {
                  const dist = userPos
                    ? haversineKm(userPos[0], userPos[1], store.lat, store.lng)
                    : null;
                  const isSelected = selectedId === store.id;
                  const hasRoute = routeStoreId === store.id && routeCoords !== null;
                  const isLoadingRoute = loadingRoute && routeStoreId === store.id;

                  return (
                    <div
                      key={store.id}
                      ref={(el) => { cardRefs.current[store.id] = el; }}
                      role='button'
                      tabIndex={0}
                      onClick={() => selectStore(store)}
                      onKeyDown={(e) => e.key === 'Enter' && selectStore(store)}
                      className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                        isSelected
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-slate-100 hover:border-primary/20 hover:bg-slate-50'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        {store.logoUrl ? (
                          <img
                            src={store.logoUrl}
                            alt={store.name}
                            className='h-10 w-10 flex-shrink-0 rounded-xl object-cover'
                          />
                        ) : (
                          <div
                            className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white'
                            style={{ background: store.primaryColor || '#6366f1' }}
                          >
                            {store.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-semibold text-slate-800'>{store.name}</p>
                          {store.addressText ? (
                            <p className='truncate text-xs text-slate-400'>{store.addressText}</p>
                          ) : store.storeType === 'RESTAURANT' ? (
                            <p className='text-xs text-amber-600'>🍽️ Restaurante</p>
                          ) : null}
                        </div>

                        <div className='flex flex-col items-end gap-1.5'>
                          {dist !== null ? (
                            <span className={`text-xs font-bold ${dist < 2 ? 'text-emerald-600' : 'text-primary'}`}>
                              {formatDist(dist)}
                            </span>
                          ) : null}
                          <div className='flex items-center gap-1'>
                            {/* Route button */}
                            <button
                              type='button'
                              onClick={(e) => { e.stopPropagation(); requestRoute(store); }}
                              title='Cómo llegar'
                              disabled={loadingRoute && !isLoadingRoute}
                              className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs transition ${
                                hasRoute
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-slate-200 text-slate-400 hover:border-primary/30 hover:text-primary'
                              } disabled:opacity-40`}
                            >
                              <i className={`bx ${isLoadingRoute ? 'bx-loader-alt animate-spin' : 'bx-navigation'}`} aria-hidden='true' />
                            </button>
                            <Link
                              to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
                              onClick={(e) => e.stopPropagation()}
                              className='rounded-lg border border-primary/30 px-2.5 py-0.5 text-[10px] font-semibold text-primary transition hover:bg-primary hover:text-white'
                            >
                              Ver
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Map ── */}
        <div className='relative min-h-0 flex-1'>
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

            {/* User position */}
            {userPos ? <Marker position={userPos} icon={USER_ICON} /> : null}

            {/* Route polyline */}
            {routeCoords ? (
              <Polyline positions={routeCoords} color='#6366f1' weight={5} opacity={0.85} />
            ) : null}

            {/* Store markers */}
            {sorted.map((store) => (
              <Marker
                key={store.id}
                position={[store.lat, store.lng]}
                icon={makeStoreIcon(store, selectedId === store.id)}
                eventHandlers={{ click: () => selectStore(store) }}
              >
                <Popup minWidth={210} maxWidth={240}>
                  <div className='space-y-2.5 pb-1'>
                    {/* Store header */}
                    <div className='flex items-center gap-2.5'>
                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className='h-9 w-9 flex-shrink-0 rounded-xl object-cover'
                        />
                      ) : (
                        <div
                          className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white'
                          style={{ background: store.primaryColor || '#6366f1' }}
                        >
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <p className='font-bold text-sm text-slate-800 leading-tight'>{store.name}</p>
                        <p className='text-xs text-slate-500'>
                          {store.storeType === 'RESTAURANT' ? '🍽️ Restaurante' : '🏪 Tienda'}
                        </p>
                      </div>
                    </div>

                    {store.addressText ? (
                      <p className='text-xs text-slate-500 leading-snug'>{store.addressText}</p>
                    ) : null}

                    {userPos ? (
                      <p className='text-xs font-semibold text-primary'>
                        📍 {formatDist(haversineKm(userPos[0], userPos[1], store.lat, store.lng))} de tu ubicación
                      </p>
                    ) : null}

                    {/* Action buttons */}
                    <div className='flex flex-col gap-1.5'>
                      {/* Trace route on map */}
                      <button
                        type='button'
                        onClick={() => requestRoute(store)}
                        disabled={loadingRoute}
                        className={`flex w-full items-center justify-center gap-1.5 rounded-xl border py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                          routeStoreId === store.id && routeCoords
                            ? 'border-primary bg-primary text-white'
                            : 'border-primary/30 text-primary hover:bg-primary hover:text-white'
                        }`}
                      >
                        <i
                          className={`bx text-sm ${
                            loadingRoute && routeStoreId === store.id
                              ? 'bx-loader-alt animate-spin'
                              : 'bx-navigation'
                          }`}
                          aria-hidden='true'
                        />
                        {loadingRoute && routeStoreId === store.id
                          ? 'Calculando ruta...'
                          : routeStoreId === store.id && routeCoords
                            ? 'Ruta activa en el mapa'
                            : 'Cómo llegar (en el mapa)'}
                      </button>

                      {/* Open Google Maps */}
                      <a
                        href={gmapsDirectionsUrl(store, userPos)}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold text-white transition hover:opacity-90'
                        style={{ background: store.primaryColor || '#6366f1' }}
                      >
                        <i className='bx bx-map text-sm' aria-hidden='true' />
                        Abrir en Google Maps
                      </a>

                      {/* Go to store */}
                      <Link
                        to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
                        className='block w-full rounded-xl border border-slate-200 py-1.5 text-center text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50'
                      >
                        Ver tienda →
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* ── Route info banner ── */}
          {routeInfo ? (
            <div className='pointer-events-auto absolute left-1/2 top-3 z-[500] -translate-x-1/2'>
              <div className='flex items-center gap-3 rounded-2xl border border-white/60 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-sm'>
                <i className='bx bx-car text-xl text-primary' aria-hidden='true' />
                <div>
                  <p className='text-sm font-bold text-slate-800'>
                    {formatDist(routeInfo.distanceM / 1000)}
                  </p>
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

          {/* ── No-location hint ── */}
          {!userPos && !locating && storesWithCoords.length > 0 ? (
            <div className='pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2'>
              <div className='rounded-2xl border border-white/70 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm'>
                <p className='text-xs font-medium text-slate-600'>
                  <i className='bx bx-current-location mr-1 text-primary' aria-hidden='true' />
                  Comparte tu ubicación para ver tiendas cercanas y calcular rutas
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
