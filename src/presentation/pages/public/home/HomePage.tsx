import { usePublicCatalog } from '@/application/useCases/products/usePublicCatalog';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import ProductHeader from '@/presentation/ui/molecules/products/ProductHeader';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import Link from '@/presentation/ui/atoms/link/Simplelink';
import { ROUTES } from '@/shared/constants/routes';
import { useCart } from '@/shared/hooks/useCart';

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
  const { addItem, items } = useCart();

  return (
    <Box className='space-y-8'>
      <Box className='rounded-[2rem] bg-[linear-gradient(135deg,_#fff4ec_0%,_#ffffff_55%,_#edf5ff_100%)] px-6 py-10 shadow-sm'>
        <ProductHeader title='Catálogo de productos' />
        <Typography className='mt-3 max-w-2xl text-neutral-dark/70'>
          Explora productos activos por categoría, revisa precios y entra al detalle para continuar la compra.
        </Typography>
        <Box className='mt-4 flex items-center justify-between gap-4'>
          <Typography className='text-sm text-neutral-dark/65'>
            Carrito actual: {items.length} producto(s)
          </Typography>
          <Link to={ROUTES.PUBLIC.CART} className='text-sm font-semibold'>
            Ir al carrito
          </Link>
        </Box>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Buscar producto por nombre'
          className='mt-6 max-w-xl'
        />
        <Box className='mt-6 flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={() => setSelectedCategoryId('')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedCategoryId === ''
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-dark shadow-sm'
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
                  ? 'bg-primary text-white'
                  : 'bg-white text-neutral-dark shadow-sm'
              }`}
            >
              {category.name}
            </button>
          ))}
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
        emptyMessage='No encontramos productos activos para mostrar.'
        onAddToCart={(productId) => {
          const product = products.find((item) => item.id === productId);
          if (!product) return;

          addItem({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            imageUrl: product.imageUrl,
          });
        }}
      />
    </Box>
  );
};
