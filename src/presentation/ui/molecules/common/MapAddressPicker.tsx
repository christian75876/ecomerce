import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { setupLeafletIcons } from '@/shared/utils/leafletSetup';

setupLeafletIcons();

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
}

export interface MapAddress {
  street: string;
  city: string;
  department: string;
  lat: number;
  lng: number;
}

interface MapAddressPickerProps {
  value: MapAddress | null;
  onChange: (address: MapAddress) => void;
}

const BOGOTA: [number, number] = [4.5709, -74.2973];

function MapPanner({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 0.6 });
  }, [map, lat, lng, zoom]);
  return null;
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const MapAddressPicker = ({ value, onChange }: MapAddressPickerProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null,
  );
  const [panTo, setPanTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const buildAddress = (addr: NominatimResult['address'], fallback: string): Omit<MapAddress, 'lat' | 'lng'> => {
    const street = [addr.road, addr.house_number, addr.neighbourhood, addr.suburb]
      .filter(Boolean)
      .join(', ') || fallback.split(',')[0];
    const city = addr.city || addr.town || addr.village || '';
    const department = addr.state || '';
    return { street, city, department };
  };

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          { headers: { 'Accept-Language': 'es' } },
        );
        const data = (await res.json()) as NominatimResult;
        const parts = buildAddress(data.address, data.display_name);
        onChange({ ...parts, lat, lng });
      } catch {
        onChange({ street: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, city: '', department: '', lat, lng });
      }
    },
    [onChange],
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setMarkerPos([lat, lng]);
      void reverseGeocode(lat, lng);
    },
    [reverseGeocode],
  );

  const searchAddress = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=co&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } },
      );
      const data = (await res.json()) as NominatimResult[];
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void searchAddress(e.target.value), 500);
  };

  const handleSelectSuggestion = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const parts = buildAddress(result.address, result.display_name);
    setMarkerPos([lat, lng]);
    setPanTo({ lat, lng, zoom: 16 });
    setQuery(result.display_name.split(',').slice(0, 2).join(',').trim());
    setShowSuggestions(false);
    setSuggestions([]);
    onChange({ ...parts, lat, lng });
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude: lat, longitude: lng } = coords;
      setMarkerPos([lat, lng]);
      setPanTo({ lat, lng, zoom: 16 });
      void reverseGeocode(lat, lng);
    });
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className='space-y-2'>
      {/* Search box */}
      <div className='relative' ref={wrapperRef}>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' aria-hidden='true' />
            <input
              type='text'
              value={query}
              onChange={handleQueryChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder='Busca tu dirección o barrio…'
              className='w-full rounded-2xl border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
            />
            {searching ? (
              <i className='bx bx-loader-alt absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400' aria-hidden='true' />
            ) : null}
          </div>
          <button
            type='button'
            onClick={handleMyLocation}
            title='Usar mi ubicación actual'
            className='flex flex-shrink-0 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-primary/30 hover:text-primary'
          >
            <i className='bx bx-current-location text-base' aria-hidden='true' />
            <span className='hidden sm:inline'>Mi ubicación</span>
          </button>
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 ? (
          <div className='absolute z-[9999] mt-1 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type='button'
                onClick={() => handleSelectSuggestion(s)}
                className='flex w-full items-start gap-2 px-4 py-3 text-left text-sm transition hover:bg-slate-50'
              >
                <i className='bx bx-map mt-0.5 flex-shrink-0 text-primary' aria-hidden='true' />
                <span className='line-clamp-2 text-slate-700'>{s.display_name}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Map */}
      <div className='overflow-hidden rounded-2xl border border-slate-200 shadow-sm' style={{ height: 260 }}>
        <MapContainer
          center={BOGOTA}
          zoom={value ? 16 : 6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {panTo ? <MapPanner lat={panTo.lat} lng={panTo.lng} zoom={panTo.zoom} /> : null}
          <ClickHandler onMapClick={handleMapClick} />
          {markerPos ? <Marker position={markerPos} /> : null}
        </MapContainer>
      </div>

      {/* Selected address */}
      {value ? (
        <div className='flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm'>
          <i className='bx bx-map-pin mt-0.5 flex-shrink-0 text-primary' aria-hidden='true' />
          <div className='min-w-0'>
            <span className='font-medium text-slate-800'>{value.street}</span>
            {value.city || value.department ? (
              <span className='text-slate-500'>
                {' '}— {[value.city, value.department].filter(Boolean).join(', ')}
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <p className='text-xs text-slate-400'>
          Busca una dirección o toca el mapa para marcar el punto de entrega.
        </p>
      )}
    </div>
  );
};

export default MapAddressPicker;
