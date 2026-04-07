import { usePublicCatalog } from '@/application/useCases/products/usePublicCatalog';
import { useMarketplaceHome } from '@/application/useCases/products/useMarketplaceHome';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import Link from '@/presentation/ui/atoms/link/Simplelink';
import { ROUTES } from '@/shared/constants/routes';
import { useCart } from '@/shared/hooks/useCart';
import { useFavorites } from '@/application/useCases/products/useFavorites';
import { motion } from 'framer-motion';

export const HomePage = () => {
  const {
    products,
    categories,
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    loading,
    error,
  } = usePublicCatalog();
  const {
    categories: featuredCategories,
    newestProducts,
    bestSellingProducts,
    featuredStores,
    loading: homeLoading,
    error: homeError,
  } = useMarketplaceHome();
  const { addItem, items } = useCart();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const addProductToCart = (productId: string, sourceProducts: typeof products) => {
    const product = sourceProducts.find((item) => item.id === productId);
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
    });
  };

  return (
    <Box className='space-y-8'>
      <Box className='grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className='rounded-[2.4rem] bg-[linear-gradient(125deg,_#0f172a_0%,_#111827_30%,_#0f766e_90%,_#f97316_140%)] px-6 py-10 text-white shadow-[0_28px_80px_rgba(15,23,42,0.24)] sm:px-8 md:py-12'
        >
          <Typography variant='span' className='uppercase tracking-[0.3em] text-white/60'>
            Marketplace omnicanal
          </Typography>
          <Typography variant='h1' className='mt-5 max-w-3xl text-balance text-4xl font-bold leading-tight text-white md:text-6xl'>
            Descubre productos, tiendas y novedades con una experiencia mucho más clara.
          </Typography>
          <Typography className='mt-5 max-w-2xl text-lg leading-8 text-white/78'>
            Compra, guarda favoritos y explora catálogos reales desde una sola portada diseñada para navegar rápido.
          </Typography>
          <Box className='mt-8 flex flex-wrap items-center gap-4'>
            <Link to={ROUTES.PUBLIC.CART} className='rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-dark shadow-sm'>
              Ver carrito ({items.length})
            </Link>
            <Link to={ROUTES.PUBLIC.STORES} className='rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur'>
              Explorar tiendas
            </Link>
            <Link to={ROUTES.PUBLIC.FAVORITES} className='rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur'>
              Ver favoritos
            </Link>
          </Box>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Buscar producto por nombre'
            className='mt-8 max-w-xl border-white/10 bg-white text-neutral-dark'
          />
          <Box className='mt-6 flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={() => setSelectedCategoryId('')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategoryId === ''
                  ? 'bg-white text-neutral-dark'
                  : 'bg-white/10 text-white backdrop-blur'
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type='button'
                onClick={() => setSelectedCategoryId(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategoryId === category.id
                    ? 'bg-white text-neutral-dark'
                    : 'bg-white/10 text-white backdrop-blur'
                }`}
              >
                {category.name}
              </button>
            ))}
          </Box>
        </motion.div>

        <Box className='surface-panel rounded-[2.4rem] p-6 sm:p-7'>
          <Typography variant='span' className='uppercase tracking-[0.26em] text-neutral-dark/45'>
            Panorama rápido
          </Typography>
          <Box className='mt-6 grid gap-4'>
            <Box className='rounded-[1.5rem] bg-primary/8 px-5 py-4'>
              <Typography variant='h3'>+{bestSellingProducts.length}</Typography>
              <Typography className='mt-1 text-sm text-neutral-dark/65'>
                Productos moviendo ventas esta semana
              </Typography>
            </Box>
            <Box className='rounded-[1.5rem] bg-secondary/8 px-5 py-4'>
              <Typography variant='h3'>{featuredStores.length}</Typography>
              <Typography className='mt-1 text-sm text-neutral-dark/65'>
                Tiendas destacadas listas para explorar
              </Typography>
            </Box>
            <Box className='rounded-[1.5rem] bg-neutral-dark/[0.04] px-5 py-4'>
              <Typography variant='h3'>{newestProducts.length}</Typography>
              <Typography className='mt-1 text-sm text-neutral-dark/65'>
                Novedades activas publicadas recientemente
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {homeError ? (
        <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
          {homeError}
        </Box>
      ) : null}

      <Box className='grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]'>
        <Box className='surface-panel rounded-[2rem] p-6'>
          <Typography variant='h2' className='text-2xl font-semibold'>
            Productos más vendidos
          </Typography>
          <Typography className='mt-2 text-sm text-neutral-dark/65'>
            Lo que más está moviendo ventas en la plataforma.
          </Typography>
          <Box className='mt-6'>
            <ProductBody
              products={bestSellingProducts.slice(0, 3)}
              loading={homeLoading}
              favoriteIds={favoriteIds}
              emptyMessage='Aún no hay suficientes ventas para destacar productos.'
              onToggleFavorite={(productId) => {
                void toggleFavorite(productId);
              }}
              onAddToCart={(productId) => addProductToCart(productId, bestSellingProducts)}
            />
          </Box>
        </Box>

        <Box className='surface-panel rounded-[2rem] p-6'>
          <Typography variant='h2' className='text-2xl font-semibold'>
            Tiendas destacadas
          </Typography>
          <Typography className='mt-2 text-sm text-neutral-dark/65'>
            Comercios activos para seguir explorando.
          </Typography>
          <Box className='mt-6 space-y-3'>
            {featuredStores.map((store) => (
              <Link
                key={store.id}
                to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
                className='block rounded-2xl border border-neutral-gray/20 px-4 py-4 transition hover:border-primary/30 hover:bg-background'
              >
                <Typography className='font-semibold'>{store.name}</Typography>
                <Typography className='mt-1 text-sm text-neutral-dark/65'>
                  {store.description || 'Tienda activa en el marketplace.'}
                </Typography>
              </Link>
            ))}
          </Box>
        </Box>
      </Box>

      <Box className='surface-panel rounded-[2rem] p-6'>
        <Typography variant='h2' className='text-2xl font-semibold'>
          Categorías destacadas
        </Typography>
        <Box className='mt-5 flex flex-wrap gap-3'>
          {featuredCategories.map((category) => (
            <button
              key={category.id}
              type='button'
              onClick={() => setSelectedCategoryId(category.id)}
              className='rounded-full bg-background px-4 py-2 text-sm font-medium text-neutral-dark transition hover:bg-primary hover:text-white'
            >
              {category.name}
            </button>
          ))}
        </Box>
      </Box>

      <Box className='surface-panel rounded-[2rem] p-6'>
        <Typography variant='h2' className='text-2xl font-semibold'>
          Recién llegados
        </Typography>
        <Typography className='mt-2 text-sm text-neutral-dark/65'>
          Productos nuevos para descubrir antes que nadie.
        </Typography>
        <Box className='mt-6'>
          <ProductBody
            products={newestProducts.slice(0, 6)}
            loading={homeLoading}
            favoriteIds={favoriteIds}
            emptyMessage='Todavía no hay productos nuevos para mostrar.'
            onToggleFavorite={(productId) => {
              void toggleFavorite(productId);
            }}
            onAddToCart={(productId) => addProductToCart(productId, newestProducts)}
          />
        </Box>
      </Box>

      {error ? (
        <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
          {error}
        </Box>
      ) : null}

      <ProductBody
        products={products}
        loading={loading}
        favoriteIds={favoriteIds}
        emptyMessage='No encontramos productos activos para mostrar.'
        onToggleFavorite={(productId) => {
          void toggleFavorite(productId);
        }}
        onAddToCart={(productId) => {
          addProductToCart(productId, products);
        }}
      />
    </Box>
  );
};
