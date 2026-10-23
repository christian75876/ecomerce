import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { usePublicCategories } from '@/application/useCases/categories/usePublicCategory';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import { PAGE_META } from '@/shared/constants/pageMeta';
import { ROUTES } from '@/shared/constants/routes';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

const APP_URL = import.meta.env.VITE_APP_URL ?? '';
const META = PAGE_META['/categorias'];

const CategoriesPage = () => {
  const { collections, loading, error } = usePublicCategories();

  return (
    <div className='section-full-bleed space-y-6 animate-fade-up'>
      <Helmet>
        <title>{META.title}</title>
        <meta name='description' content={META.description} />
        <link rel='canonical' href={`${APP_URL}/categorias`} />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Merku' />
        <meta property='og:url' content={`${APP_URL}/categorias`} />
        <meta property='og:title' content={META.title} />
        <meta property='og:description' content={META.description} />
        <meta property='og:image' content={`${APP_URL}/og-image.png`} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={META.title} />
        <meta name='twitter:description' content={META.description} />
      </Helmet>

      <div className='gradient-hero relative overflow-hidden py-8 text-neutral-dark lg:rounded-b-[2.5rem]'>
        <div className='content-container relative z-10'>
          <div className='mx-auto max-w-2xl text-center'>
            <p className='mb-1 text-xs font-bold uppercase tracking-[0.2em] text-neutral-dark/60'>Merku</p>
            <h1 className='mb-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl'>
              Categorías de productos
            </h1>
            <p className='text-sm text-neutral-dark/75'>
              Productos de tiendas y restaurantes locales de Medellín organizados por categoría.
            </p>
          </div>
        </div>
      </div>

      <div className='content-container'>
        {error ? (
          <Box className='rounded-3xl border border-error/25 bg-error-light px-6 py-4 text-sm text-error'>{error}</Box>
        ) : loading ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-28 animate-pulse rounded-3xl bg-neutral-gray/10' />
            ))}
          </div>
        ) : (
          <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {collections.map((c) => (
              <li key={c.slug}>
                <Link
                  to={ROUTES.PUBLIC.CATEGORY_DETAILS.replace(':slug', c.slug)}
                  className='surface-panel block h-full rounded-3xl p-5 transition-transform hover:-translate-y-0.5'
                >
                  <h2 className='font-display text-lg font-extrabold text-neutral-dark'>{c.name}</h2>
                  <p className='mt-1 text-sm text-neutral-muted'>
                    {c.productCount === 1 ? '1 producto' : `${c.productCount} productos`}
                    {' · '}
                    {c.storeCount === 1 ? '1 tienda' : `${c.storeCount} tiendas`}
                  </p>
                  {c.minPrice != null ? (
                    <p className='mt-2 text-sm font-semibold text-primary'>Desde {formatCurrencyCOP(c.minPrice)}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
