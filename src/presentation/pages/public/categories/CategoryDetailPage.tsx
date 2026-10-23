import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { usePublicCategories, usePublicCategory } from '@/application/useCases/categories/usePublicCategory';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import ProductGrid from '@/presentation/ui/organisms/products/ProductGrid';
import HomeFeaturedCategories from '@/presentation/ui/organisms/home/HomeFeaturedCategories';
import { categoryIntro, categoryPageTitle } from '@/shared/constants/pageMeta';
import { ROUTES } from '@/shared/constants/routes';
import { useCart } from '@/shared/hooks/useCart';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import { serializeJsonLd, toMetaDescription } from '@/shared/utils/jsonLd';
import { buildProductPath } from '@/shared/utils/productUrl';

const APP_URL = import.meta.env.VITE_APP_URL ?? '';

const CategoryDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { collection, products, loading, loadingMore, hasMore, loadMore, error } = usePublicCategory(slug);
  const { collections } = usePublicCategories();
  const { addItem } = useCart();

  const addProductToCart = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      taxMode: product.taxMode ?? null,
      taxRate: product.taxRate ?? null,
      imageUrl: product.imageUrl,
      storeId: product.storeId ?? undefined,
      storeAddressText: product.store?.addressText ?? null,
      storeDeliveryOptions: product.store?.deliveryOptions,
    });
    const label = product.name.length > 28 ? `${product.name.slice(0, 28)}…` : product.name;
    SnackbarUtilities.success(`${label} agregado al carrito`, 'top', 'center');
  };

  if (!loading && (error || !collection)) {
    return (
      <Box className='content-container rounded-3xl border border-error/25 bg-error-light px-6 py-4 text-sm text-error'>
        <Helmet>
          <title>Categoría no encontrada — Merku</title>
          <meta name='robots' content='noindex, follow' />
        </Helmet>
        {error || 'No fue posible encontrar la categoría.'}{' '}
        <Link to={ROUTES.PUBLIC.CATEGORIES} className='font-semibold underline'>
          Ver todas las categorías
        </Link>
      </Box>
    );
  }

  const url = `${APP_URL}/categorias/${slug ?? ''}`;
  const title = collection ? categoryPageTitle(collection.name) : 'Categorías — Merku';
  const intro = collection ? categoryIntro(collection) : '';
  const description = toMetaDescription(intro, `${collection?.name ?? 'Categorías'} en tiendas locales de Medellín. Pide en Merku.`);
  const otherCategories = collections.filter((c) => c.slug !== slug).slice(0, 12);

  return (
    <div className='section-full-bleed space-y-6 animate-fade-up'>
      {collection ? (
        <Helmet>
          <title>{title}</title>
          <meta name='description' content={description} />
          {/* Con muy pocos productos la página es contenido escaso: noindex
              hasta llegar al mínimo (MIN_INDEXABLE_PRODUCTS en el backend). */}
          {!collection.indexable ? <meta name='robots' content='noindex, follow' /> : null}
          <link rel='canonical' href={url} />
          <meta property='og:type' content='website' />
          <meta property='og:site_name' content='Merku' />
          <meta property='og:url' content={url} />
          <meta property='og:title' content={title} />
          <meta property='og:description' content={description} />
          <meta property='og:image' content={`${APP_URL}/og-image.png`} />
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:title' content={title} />
          <meta name='twitter:description' content={description} />
          <script type='application/ld+json'>{serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: title,
            description,
            url,
            inLanguage: 'es-CO',
            isPartOf: { '@id': `${APP_URL}/#website` },
            dateModified: collection.lastModified ?? undefined,
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: collection.productCount,
              itemListElement: products.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: p.name,
                url: `${APP_URL}${buildProductPath(p.id, p.name)}`,
              })),
            },
          })}</script>
          <script type='application/ld+json'>{serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { name: 'Inicio', item: `${APP_URL}/home` },
              { name: 'Categorías', item: `${APP_URL}/categorias` },
              { name: collection.name, item: url },
            ].map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })),
          })}</script>
        </Helmet>
      ) : null}

      <div className='gradient-hero relative overflow-hidden py-8 text-neutral-dark lg:rounded-b-[2.5rem]'>
        <div
          className='pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl'
          aria-hidden='true'
        />
        <div className='content-container relative z-10'>
          <nav aria-label='Ruta de navegación' className='mb-4 flex flex-wrap items-center gap-2 text-sm text-neutral-dark/55'>
            <Link to={ROUTES.PUBLIC.HOME} className='font-medium text-neutral-dark/60'>Merku</Link>
            <span>/</span>
            <Link to={ROUTES.PUBLIC.CATEGORIES} className='font-medium text-neutral-dark/60'>Categorías</Link>
            <span>/</span>
            <span className='text-neutral-dark'>{collection?.name ?? '…'}</span>
          </nav>
          <div className='max-w-3xl'>
            <h1 className='mb-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl'>
              {collection?.name ?? 'Cargando categoría…'}
            </h1>
            {intro ? <p className='text-sm leading-relaxed text-neutral-dark/75 sm:text-base'>{intro}</p> : null}
          </div>
        </div>
      </div>

      <div className='content-container space-y-10'>
        <ProductGrid
          products={products}
          loading={loading || loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onAddToCart={addProductToCart}
        />

        <HomeFeaturedCategories categories={otherCategories} title='Otras categorías' showAllLink />
      </div>
    </div>
  );
};

export default CategoryDetailPage;
