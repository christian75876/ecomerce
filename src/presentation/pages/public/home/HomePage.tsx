import { Helmet } from 'react-helmet-async';
import { useMarketplaceHome } from '@/application/useCases/products/useMarketplaceHome';
import { usePublicCatalog } from '@/application/useCases/products/usePublicCatalog';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import { useCart } from '@/shared/hooks/useCart';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import HomeCatalogSection from '@/presentation/ui/organisms/home/HomeCatalogSection';
import HomeFeaturedStores from '@/presentation/ui/organisms/home/HomeFeaturedStores';
import HomeProductRail from '@/presentation/ui/organisms/home/HomeProductRail';

export const HomePage = () => {
  const {
    products,
    sponsoredProducts,
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    sortBy,
    changeSort,
    minPrice,
    maxPrice,
    setPriceRange,
    onlyAvailable,
    setOnlyAvailable,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  } = usePublicCatalog();
  const {
    newestProducts,
    bestSellingProducts,
    featuredStores,
    loading: homeLoading,
    error: homeError,
  } = useMarketplaceHome();
  const { addItem } = useCart();

  const addProductToCart = (
    productId: string,
    sourceProducts: typeof products,
  ) => {
    const product = sourceProducts.find((item) => item.id === productId);
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      storeId: product.storeId ?? undefined,
      storeAddressText: product.store?.addressText ?? null,
      storeDeliveryOptions: product.store?.deliveryOptions,
    });
    const label = product.name.length > 28 ? `${product.name.slice(0, 28)}…` : product.name;
    SnackbarUtilities.success(`${label} agregado al carrito`, 'top', 'center');
  };

  return (
    <Box className='section-full-bleed space-y-8'>
      <Helmet>
        <title>Merku — Encuentra lo que buscas</title>
        <meta name='description' content='Merku: explora cientos de productos de tiendas locales. Encuentra lo que necesitas al mejor precio.' />
        <link rel='canonical' href={`${import.meta.env.VITE_APP_URL ?? ''}/home`} />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Merku' />
        <meta property='og:url' content={`${import.meta.env.VITE_APP_URL ?? ''}/home`} />
        <meta property='og:title' content='Merku — Encuentra lo que buscas' />
        <meta property='og:description' content='Merku: explora cientos de productos de tiendas locales. Encuentra lo que necesitas al mejor precio.' />
        <meta property='og:image' content={`${import.meta.env.VITE_APP_URL ?? ''}/og-image.png`} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='Merku — Encuentra lo que buscas' />
        <meta name='twitter:description' content='Merku: explora cientos de productos de tiendas locales. Encuentra lo que necesitas al mejor precio.' />
        <meta name='twitter:image' content={`${import.meta.env.VITE_APP_URL ?? ''}/og-image.png`} />
      </Helmet>
      <HomeCatalogSection
        products={products}
        sponsoredProducts={sponsoredProducts}
        search={search}
        selectedCategoryId={selectedCategoryId}
        sortBy={sortBy}
        onSortChange={changeSort}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceRangeChange={setPriceRange}
        onlyAvailable={onlyAvailable}
        onOnlyAvailableChange={setOnlyAvailable}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        error={error}
        onSearchChange={setSearch}
        onCategoryChange={setSelectedCategoryId}
        onAddToCart={(productId) => {
          addProductToCart(productId, products);
        }}
      />

      {!search.trim() && !selectedCategoryId ? (
        <>
          {homeError ? (
            <Box className='content-container rounded-3xl border border-error/25 bg-error-light px-6 py-4 text-sm text-error'>
              {homeError}
            </Box>
          ) : null}

          <Box className='content-container grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] [&>*]:min-w-0'>
            <HomeProductRail
              title='Productos más vendidos'
              subtitle='Lo que más está moviendo ventas en la plataforma.'
              products={bestSellingProducts.slice(0, 3)}
              loading={homeLoading}
              emptyMessage='Aún no hay suficientes ventas para destacar productos.'
              onAddToCart={(productId) =>
                addProductToCart(productId, bestSellingProducts)
              }
            />

            <HomeFeaturedStores stores={featuredStores} />
          </Box>

          {/* Full-bleed background strip — content re-centers inside via
              .content-container, matching the hero/marquee pattern above. */}
          <Box className='border-y border-secondary-100 bg-secondary-50/60 py-8'>
            <Box className='content-container'>
              <HomeProductRail
                title='Recién llegados'
                subtitle='Productos nuevos para descubrir antes que nadie.'
                products={newestProducts.slice(0, 6)}
                loading={homeLoading}
                emptyMessage='Todavía no hay productos nuevos para mostrar.'
                onAddToCart={(productId) =>
                  addProductToCart(productId, newestProducts)
                }
              />
            </Box>
          </Box>
        </>
      ) : null}
    </Box>
  );
};

export default HomePage;
