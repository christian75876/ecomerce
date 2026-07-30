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
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    loading,
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
    });
    const label = product.name.length > 28 ? `${product.name.slice(0, 28)}…` : product.name;
    SnackbarUtilities.success(`${label} agregado al carrito`, 'top', 'center');
  };

  return (
    <Box className='space-y-8'>
      <Helmet>
        <title>Marketplace — Hot Commerce</title>
        <meta name='description' content='Explora cientos de productos de tiendas locales. Encuentra lo que necesitas al mejor precio.' />
        <meta property='og:title' content='Marketplace — Hot Commerce' />
        <meta property='og:description' content='Explora cientos de productos de tiendas locales. Encuentra lo que necesitas al mejor precio.' />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Hot Commerce' />
        <meta property='og:image' content='https://ecomercehot.netlify.app/icons/icon-512x512.png' />
        <meta name='twitter:card' content='summary' />
        <meta name='twitter:title' content='Marketplace — Hot Commerce' />
        <meta name='twitter:description' content='Explora cientos de productos de tiendas locales. Encuentra lo que necesitas al mejor precio.' />
        <meta name='twitter:image' content='https://ecomercehot.netlify.app/icons/icon-512x512.png' />
      </Helmet>
      <HomeCatalogSection
        products={products}
        search={search}
        selectedCategoryId={selectedCategoryId}
        loading={loading}
        error={error}
        onSearchChange={setSearch}
        onCategoryChange={setSelectedCategoryId}
        onAddToCart={(productId) => {
          addProductToCart(productId, products);
        }}
      />

      {homeError ? (
        <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
          {homeError}
        </Box>
      ) : null}

      <Box className='grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] [&>*]:min-w-0'>
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
  );
};

export default HomePage;
