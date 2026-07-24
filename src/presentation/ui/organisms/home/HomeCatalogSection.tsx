import { useState, useMemo, useRef, useEffect } from 'react';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { userPreferences } from '@/shared/utils/userPreferences';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'newest',     label: 'Más nuevos',              icon: 'bx-time'         },
  { value: 'price_asc',  label: 'Precio: menor a mayor',   icon: 'bx-trending-up'  },
  { value: 'price_desc', label: 'Precio: mayor a menor',   icon: 'bx-trending-down'},
  { value: 'name_asc',   label: 'Nombre A–Z',              icon: 'bx-sort-a-z'     },
];

interface HomeCatalogSectionProps {
  products: IProduct[];
  search: string;
  selectedCategoryId: string;
  loading: boolean;
  error: string | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAddToCart: (productId: string) => void;
}

const HomeCatalogSection = ({
  products,
  search,
  selectedCategoryId,
  loading,
  error,
  onSearchChange,
  onCategoryChange,
  onAddToCart,
}: HomeCatalogSectionProps) => {
  const [sortBy, setSortBy]             = useState<SortOption>('newest');
  const [sortOpen, setSortOpen]         = useState(false);
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [minPrice, setMinPrice]         = useState<number | null>(null);
  const [maxPrice, setMaxPrice]         = useState<number | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const sortRef    = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const h = (e: MouseEvent) => { if (!sortRef.current?.contains(e.target as Node)) setSortOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [sortOpen]);

  // ── Preference tracking ─────────────────────────────────────────────────────
  const trackProduct = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (p?.categoryId) userPreferences.trackCategory(p.categoryId);
  };

  const handleAddToCart = (productId: string) => {
    trackProduct(productId);
    onAddToCart(productId);
  };

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId) userPreferences.trackCategory(categoryId);
    onCategoryChange(categoryId);
  };
  // ────────────────────────────────────────────────────────────────────────────

  const applyPriceFilter = () => {
    setMinPrice(minPriceInput !== '' ? Number(minPriceInput) : null);
    setMaxPrice(maxPriceInput !== '' ? Number(maxPriceInput) : null);
  };

  const clearAllFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setMinPrice(null);
    setMaxPrice(null);
    setOnlyAvailable(false);
    setSortBy('newest');
    handleCategoryChange('');
    onSearchChange('');
  };

  const activeFilterCount =
    (selectedCategoryId ? 1 : 0) +
    (minPrice !== null || maxPrice !== null ? 1 : 0) +
    (onlyAvailable ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  const AD_INTERVAL = 4; // insert 1 sponsored product after every N organic products

  const { processedProducts, sponsoredIds } = useMemo(() => {
    let list = [...products];

    // ── 1. Filters ───────────────────────────────────────────────────────────
    if (onlyAvailable) list = list.filter((p) => p.availableQuantity > 0);
    if (minPrice !== null) list = list.filter((p) => Number(p.price) >= minPrice);
    if (maxPrice !== null) list = list.filter((p) => Number(p.price) <= maxPrice);

    // ── 2. Separate organic vs sponsored ────────────────────────────────────
    const organic   = list.filter((p) => !p.store?.isPremiumAdvertiser);
    const sponsored = list.filter((p) =>  p.store?.isPremiumAdvertiser);

    // ── 3. Sort each pool ───────────────────────────────────────────────────
    const sortPool = (pool: IProduct[]) => {
      if (sortBy === 'price_asc')   pool.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sortBy === 'price_desc') pool.sort((a, b) => Number(b.price) - Number(a.price));
      else if (sortBy === 'name_asc')   pool.sort((a, b) => a.name.localeCompare(b.name));
      else if (userPreferences.hasPreferences()) {
        // Default: affinity boost — preferred categories float up within each pool
        pool.sort((a, b) =>
          userPreferences.getCategoryScore(b.categoryId) -
          userPreferences.getCategoryScore(a.categoryId)
        );
      }
      return pool;
    };

    const sortedOrganic   = sortPool(organic);
    // Sponsored pool always sorted by affinity (most relevant ad first, regardless of explicit sort)
    const sortedSponsored = sponsored.sort((a, b) =>
      userPreferences.getCategoryScore(b.categoryId) -
      userPreferences.getCategoryScore(a.categoryId)
    );

    // ── 4. Interleave: 1 sponsored after every AD_INTERVAL organic ──────────
    const result: IProduct[] = [];
    let adIdx = 0;
    sortedOrganic.forEach((product, i) => {
      result.push(product);
      if ((i + 1) % AD_INTERVAL === 0 && adIdx < sortedSponsored.length) {
        result.push(sortedSponsored[adIdx++]);
      }
    });
    // Tail: any remaining sponsored products not yet shown
    while (adIdx < sortedSponsored.length) {
      result.push(sortedSponsored[adIdx++]);
    }

    const ids = new Set(sortedSponsored.map((p) => p.id));
    return { processedProducts: result, sponsoredIds: [...ids] };
  }, [products, sortBy, minPrice, maxPrice, onlyAvailable]);

  const priceFilterActive = minPrice !== null || maxPrice !== null;

  return (
    <div className='space-y-5'>
      {/* ── Hero search banner ── */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-6 text-white shadow-lg sm:px-10'>
        <div
          className='pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5'
          aria-hidden='true'
        />
        <div
          className='pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/5'
          aria-hidden='true'
        />

        <div className='relative z-10 mx-auto max-w-2xl text-center'>
          <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Marketplace</p>
          <h1 className='mb-3 text-2xl font-extrabold tracking-tight'>
            Encuentra lo que necesitas
          </h1>
          <div className='flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 ring-1 ring-white/20 backdrop-blur-sm transition-all focus-within:bg-white/20 focus-within:ring-white/40'>
            <i
              className='bx bx-search text-xl text-white/70'
              aria-hidden='true'
            />
            <input
              type='search'
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder='Buscar productos...'
              className='flex-1 bg-transparent text-sm font-medium text-white placeholder:text-white/50 focus:outline-none'
              aria-label='Buscar productos'
            />
            {search ? (
              <button
                type='button'
                onClick={() => onSearchChange('')}
                className='text-white/60 hover:text-white'
                aria-label='Limpiar búsqueda'
              >
                <i className='bx bx-x text-lg' aria-hidden='true' />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-2'>
            {/* Filters toggle */}
            <button
              type='button'
              onClick={() => setFiltersOpen(o => !o)}
              className={`relative flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${
                filtersOpen || activeFilterCount > 0
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:text-primary'
              }`}
              aria-expanded={filtersOpen}
            >
              <i className='bx bx-slider text-base' aria-hidden='true' />
              Filtros
              {activeFilterCount > 0 ? (
                <span className='flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white'>
                  {activeFilterCount}
                </span>
              ) : null}
              <i
                className={`bx bx-chevron-down text-base transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
                aria-hidden='true'
              />
            </button>

            {/* Sort dropdown */}
            <div ref={sortRef} className='relative'>
              <button
                type='button'
                onClick={() => setSortOpen(o => !o)}
                className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary'
              >
                <i
                  className={`bx ${SORT_OPTIONS.find(o => o.value === sortBy)?.icon} text-base`}
                  aria-hidden='true'
                />
                <span className='hidden sm:inline'>
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                </span>
                <i
                  className={`bx bx-chevron-down text-base transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
                  aria-hidden='true'
                />
              </button>

              {sortOpen ? (
                <div className='absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_48px_rgba(15,23,42,0.12)]'>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type='button'
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                        sortBy === opt.value
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <i
                        className={`bx ${opt.icon} text-base`}
                        aria-hidden='true'
                      />
                      {opt.label}
                      {sortBy === opt.value ? (
                        <i
                          className='bx bx-check ml-auto text-base text-primary'
                          aria-hidden='true'
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

        {/* Row 2: collapsible filter panel */}
        {filtersOpen ? (
          <div
            ref={filtersRef}
            className='flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
          >
            {/* Price range */}
            <div className='flex flex-wrap items-end gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-xs font-semibold text-slate-500'>
                  Precio mínimo
                </label>
                <div className='flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-primary focus-within:bg-white'>
                  <span className='text-xs text-slate-400'>$</span>
                  <input
                    type='number'
                    min={0}
                    value={minPriceInput}
                    onChange={e => setMinPriceInput(e.target.value)}
                    placeholder='0'
                    className='w-24 bg-transparent text-sm text-slate-800 focus:outline-none'
                  />
                </div>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-xs font-semibold text-slate-500'>
                  Precio máximo
                </label>
                <div className='flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-primary focus-within:bg-white'>
                  <span className='text-xs text-slate-400'>$</span>
                  <input
                    type='number'
                    min={0}
                    value={maxPriceInput}
                    onChange={e => setMaxPriceInput(e.target.value)}
                    placeholder='Sin límite'
                    className='w-28 bg-transparent text-sm text-slate-800 focus:outline-none'
                  />
                </div>
              </div>
              <button
                type='button'
                onClick={applyPriceFilter}
                className='rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dark active:scale-95'
              >
                Aplicar
              </button>
              {priceFilterActive ? (
                <div className='flex items-center gap-1.5 rounded-xl bg-primary/8 px-3 py-2 text-xs font-medium text-primary'>
                  <i className='bx bx-filter-alt text-sm' aria-hidden='true' />
                  {minPrice !== null && maxPrice !== null
                    ? `${formatCurrencyCOP(minPrice)} – ${formatCurrencyCOP(maxPrice)}`
                    : minPrice !== null
                      ? `Desde ${formatCurrencyCOP(minPrice)}`
                      : `Hasta ${formatCurrencyCOP(maxPrice!)}`}
                  <button
                    type='button'
                    onClick={() => {
                      setMinPriceInput('');
                      setMaxPriceInput('');
                      setMinPrice(null);
                      setMaxPrice(null);
                    }}
                    className='ml-0.5 text-primary/70 hover:text-primary'
                    aria-label='Quitar filtro de precio'
                  >
                    <i className='bx bx-x text-sm' aria-hidden='true' />
                  </button>
                </div>
              ) : null}
            </div>

            {/* Divider */}
            <div
              className='h-8 w-px bg-slate-200 max-sm:hidden'
              aria-hidden='true'
            />

            {/* Stock toggle */}
            <label className='flex cursor-pointer items-center gap-2.5'>
              <div
                className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${onlyAvailable ? 'bg-primary' : 'bg-slate-300'}`}
                onClick={() => setOnlyAvailable(v => !v)}
                role='switch'
                aria-checked={onlyAvailable}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter')
                    setOnlyAvailable(v => !v);
                }}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${onlyAvailable ? 'translate-x-4' : 'translate-x-0.5'}`}
                />
              </div>
              <span className='text-sm font-medium text-slate-700'>
                Solo disponibles
              </span>
            </label>

            {/* Clear all */}
            {activeFilterCount > 0 ? (
              <button
                type='button'
                onClick={clearAllFilters}
                className='ml-auto text-sm font-medium text-slate-400 transition hover:text-red-500'
              >
                <i className='bx bx-reset mr-1 text-sm' aria-hidden='true' />
                Limpiar todo
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Active filter chips (when panel is closed) */}
        {!filtersOpen && activeFilterCount > 0 ? (
          <div className='flex flex-wrap gap-2'>
            {priceFilterActive ? (
              <span className='flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary'>
                <i className='bx bx-dollar text-sm' aria-hidden='true' />
                {minPrice !== null && maxPrice !== null
                  ? `${formatCurrencyCOP(minPrice)} – ${formatCurrencyCOP(maxPrice)}`
                  : minPrice !== null
                    ? `Desde ${formatCurrencyCOP(minPrice)}`
                    : `Hasta ${formatCurrencyCOP(maxPrice!)}`}
                <button
                  type='button'
                  onClick={() => {
                    setMinPriceInput('');
                    setMaxPriceInput('');
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                  aria-label='Quitar filtro precio'
                >
                  <i className='bx bx-x text-sm' aria-hidden='true' />
                </button>
              </span>
            ) : null}
            {onlyAvailable ? (
              <span className='flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700'>
                <i className='bx bx-check-circle text-sm' aria-hidden='true' />
                Solo disponibles
                <button
                  type='button'
                  onClick={() => setOnlyAvailable(false)}
                  aria-label='Quitar filtro disponibilidad'
                >
                  <i className='bx bx-x text-sm' aria-hidden='true' />
                </button>
              </span>
            ) : null}
            {sortBy !== 'newest' ? (
              <span className='flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600'>
                <i className='bx bx-sort-alt-2 text-sm' aria-hidden='true' />
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                <button
                  type='button'
                  onClick={() => setSortBy('newest')}
                  aria-label='Quitar filtro de orden'
                >
                  <i className='bx bx-x text-sm' aria-hidden='true' />
                </button>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* ── Error ── */}
      {error ? (
        <div className='flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          <i className='bx bx-error-circle text-base' aria-hidden='true' />
          {error}
        </div>
      ) : null}

      {/* ── Products grid ── */}
      <ProductBody
        products={processedProducts}
        loading={loading}
        sponsoredIds={sponsoredIds}
        emptyMessage='No encontramos productos para este filtro.'
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default HomeCatalogSection;
