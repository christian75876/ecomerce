import { useState, useMemo } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

interface HomeCatalogSectionProps {
  products: IProduct[];
  categories: ICategory[];
  search: string;
  selectedCategoryId: string;
  loading: boolean;
  error: string | null;
  favoriteIds: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

const HomeCatalogSection = ({
  products,
  categories,
  search,
  selectedCategoryId,
  loading,
  error,
  favoriteIds,
  onSearchChange,
  onCategoryChange,
  onToggleFavorite,
  onAddToCart,
}: HomeCatalogSectionProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    if (sortBy === 'price_asc') copy.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === 'price_desc') copy.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === 'name_asc') copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy;
  }, [products, sortBy]);

  return (
    <div className='space-y-5'>
      {/* ── Hero search banner ── */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-lg sm:px-10'>
        {/* decorative circles */}
        <div className='pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5' aria-hidden='true' />
        <div className='pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/5' aria-hidden='true' />

        <div className='relative z-10 mx-auto max-w-2xl text-center'>
          <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>
            Marketplace
          </p>
          <h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
            Encuentra lo que necesitas
          </h1>
          <p className='mt-2 text-sm text-white/70'>
            {products.length > 0
              ? `${products.length} producto${products.length === 1 ? '' : 's'} disponibles`
              : 'Explora el catálogo completo'}
          </p>

          {/* Search input */}
          <div className='mt-6 flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 ring-1 ring-white/20 backdrop-blur-sm focus-within:bg-white/20 focus-within:ring-white/40 transition-all'>
            <i className='bx bx-search text-xl text-white/70' aria-hidden='true' />
            <input
              type='search'
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
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

      {/* ── Category pills + sort ── */}
      <div className='flex items-center gap-3'>
        {categories.length > 0 ? (
          <div className='flex flex-1 gap-2 overflow-x-auto pb-1 scrollbar-hide'>
            <button
              type='button'
              onClick={() => onCategoryChange('')}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                selectedCategoryId === ''
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
              }`}
            >
              Todo
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type='button'
                onClick={() => onCategoryChange(cat.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  selectedCategoryId === cat.id
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        ) : <div className='flex-1' />}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className='shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
          aria-label='Ordenar productos'
        >
          <option value='newest'>Más nuevos</option>
          <option value='price_asc'>Precio: menor a mayor</option>
          <option value='price_desc'>Precio: mayor a menor</option>
          <option value='name_asc'>Nombre A–Z</option>
        </select>
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
        products={sortedProducts}
        loading={loading}
        favoriteIds={favoriteIds}
        emptyMessage='No encontramos productos para este filtro.'
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default HomeCatalogSection;
