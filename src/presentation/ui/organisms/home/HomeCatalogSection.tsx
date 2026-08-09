import { useState, useMemo, useRef, useEffect } from 'react';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { userPreferences } from '@/shared/utils/userPreferences';
import { CatalogSortOption } from '@/application/useCases/products/usePublicCatalog';

const SORT_OPTIONS: { value: CatalogSortOption; label: string; icon: string }[] = [
  { value: 'newest',     label: 'Más nuevos',              icon: 'bx-time'         },
  { value: 'price_asc',  label: 'Precio: menor a mayor',   icon: 'bx-trending-up'  },
  { value: 'price_desc', label: 'Precio: mayor a menor',   icon: 'bx-trending-down'},
  { value: 'name_asc',   label: 'Nombre A–Z',              icon: 'bx-sort-a-z'     },
];

function getSearchAffinityScore(product: IProduct): number {
  const terms = userPreferences.getRecentSearches();
  if (terms.length === 0) return 0;
  const haystack = `${product.name} ${(product.tags ?? []).join(' ')}`.toLowerCase();
  return terms.reduce((score, term) => (haystack.includes(term) ? score + 1 : score), 0);
}

interface HomeCatalogSectionProps {
  products: IProduct[];
  sponsoredProducts?: IProduct[];
  search: string;
  selectedCategoryId: string;
  sortBy: CatalogSortOption;
  onSortChange: (value: CatalogSortOption | null) => void;
  minPrice: number | null;
  maxPrice: number | null;
  onPriceRangeChange: (min: number | null, max: number | null) => void;
  onlyAvailable: boolean;
  onOnlyAvailableChange: (value: boolean) => void;
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  error: string | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAddToCart: (productId: string) => void;
}

const HomeCatalogSection = ({
  products,
  sponsoredProducts = [],
  search,
  selectedCategoryId,
  sortBy,
  onSortChange,
  minPrice,
  maxPrice,
  onPriceRangeChange,
  onlyAvailable,
  onOnlyAvailableChange,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  error,
  onSearchChange,
  onCategoryChange,
  onAddToCart,
}: HomeCatalogSectionProps) => {
  const [sortOpen, setSortOpen]         = useState(false);
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [minPriceInput, setMinPriceInput] = useState(minPrice !== null ? String(minPrice) : '');
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice !== null ? String(maxPrice) : '');
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const sortRef    = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchSuggestionsOpen) return;
    const h = (e: MouseEvent) => { if (!searchBoxRef.current?.contains(e.target as Node)) setSearchSuggestionsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [searchSuggestionsOpen]);

  const recentSearches = userPreferences.getRecentSearches();
  const searchSuggestions = search.trim()
    ? recentSearches.filter((term) => term.includes(search.trim().toLowerCase()) && term !== search.trim().toLowerCase())
    : recentSearches;

  useEffect(() => {
    if (!scrollSentinelRef.current || !hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '320px 0px' },
    );

    observer.observe(scrollSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

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
    onPriceRangeChange(
      minPriceInput !== '' ? Number(minPriceInput) : null,
      maxPriceInput !== '' ? Number(maxPriceInput) : null,
    );
  };

  const clearPriceFilter = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    onPriceRangeChange(null, null);
  };

  const clearAllFilters = () => {
    clearPriceFilter();
    onOnlyAvailableChange(false);
    onSortChange(null);
    handleCategoryChange('');
    onSearchChange('');
  };

  const activeFilterCount =
    (selectedCategoryId ? 1 : 0) +
    (minPrice !== null || maxPrice !== null ? 1 : 0) +
    (onlyAvailable ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  const AD_INTERVAL = 4; // insert 1 sponsored product after every N organic products

  // Price/availability/search/category filters and the explicit sort
  // (price_asc, price_desc, name_asc) are all applied server-side now — this
  // only handles: (a) excluding sponsored picks from the organic list so they
  // don't render twice, and (b) the affinity boost, which stays client-side
  // because the preference signal itself lives in localStorage, not the API.
  const { processedProducts, sponsoredIds } = useMemo(() => {
    const sponsoredPoolIds = new Set(sponsoredProducts.map((p) => p.id));
    const organic = products.filter((p) => !sponsoredPoolIds.has(p.id));
    const sponsored = sponsoredProducts;

    const affinityScore = (product: IProduct) =>
      userPreferences.getCategoryScore(product.categoryId) + getSearchAffinityScore(product);

    const sortedOrganic = [...organic];
    if (sortBy === 'newest' && (userPreferences.hasPreferences() || userPreferences.hasSearchHistory())) {
      // Default order + personalization signal → preferred categories/past searches float up
      sortedOrganic.sort((a, b) => affinityScore(b) - affinityScore(a));
    }
    // Sponsored pool always sorted by affinity (most relevant ad first, regardless of explicit sort)
    const sortedSponsored = [...sponsored].sort((a, b) => affinityScore(b) - affinityScore(a));

    // ── Interleave: 1 sponsored after every AD_INTERVAL organic ──────────
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
  }, [products, sponsoredProducts, sortBy]);

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
          <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Merku</p>
          <h1 className='mb-3 text-2xl font-extrabold tracking-tight'>
            Encuentra lo que necesitas
          </h1>
          <div ref={searchBoxRef} className='relative'>
            <div className='flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 ring-1 ring-white/20 backdrop-blur-sm transition-all focus-within:bg-white/20 focus-within:ring-white/40'>
              <i
                className='bx bx-search text-xl text-white/70'
                aria-hidden='true'
              />
              <input
                type='text'
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                onFocus={() => setSearchSuggestionsOpen(true)}
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

            {searchSuggestionsOpen && searchSuggestions.length > 0 ? (
              <div className='absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl'>
                <p className='px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400'>
                  Búsquedas recientes
                </p>
                {searchSuggestions.map((term) => (
                  <button
                    key={term}
                    type='button'
                    onClick={() => { onSearchChange(term); setSearchSuggestionsOpen(false); }}
                    className='flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900'
                  >
                    <i className='bx bx-history text-base text-slate-400' aria-hidden='true' />
                    {term}
                  </button>
                ))}
              </div>
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
                        onSortChange(opt.value === 'newest' ? null : opt.value);
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
                    onClick={clearPriceFilter}
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
                onClick={() => onOnlyAvailableChange(!onlyAvailable)}
                role='switch'
                aria-checked={onlyAvailable}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter')
                    onOnlyAvailableChange(!onlyAvailable);
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
                  onClick={clearPriceFilter}
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
                  onClick={() => onOnlyAvailableChange(false)}
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
                  onClick={() => onSortChange(null)}
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

      {hasMore ? <div ref={scrollSentinelRef} className='h-1 w-full' /> : null}

      {loadingMore ? (
        <p className='py-4 text-center text-sm text-slate-400'>
          Cargando más productos...
        </p>
      ) : null}
    </div>
  );
};

export default HomeCatalogSection;
