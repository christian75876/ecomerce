import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';

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
  return (
    <Box className='space-y-5'>
      <Box className='surface-panel rounded-[2rem] p-6'>
        <Box className='flex flex-col gap-4'>
          <Box className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
            <Box>
              <Typography variant='h1' className='text-3xl font-bold md:text-4xl'>
                Catálogo comercial
              </Typography>
              <Typography className='text-sm text-neutral-dark/65'>
                Explora productos activos, cambia de categoría y agrega al carrito sin salir de la portada.
              </Typography>
            </Box>
            <Typography className='text-sm text-neutral-dark/55'>
              {products.length} producto{products.length === 1 ? '' : 's'} visibles
            </Typography>
          </Box>

          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder='Buscar producto por nombre'
            className='max-w-2xl'
          />

          <Box className='flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={() => onCategoryChange('')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategoryId === ''
                  ? 'bg-primary text-white'
                  : 'bg-background text-neutral-dark hover:bg-primary hover:text-white'
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type='button'
                onClick={() => onCategoryChange(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategoryId === category.id
                    ? 'bg-primary text-white'
                    : 'bg-background text-neutral-dark hover:bg-primary hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </Box>
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
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
      />
    </Box>
  );
};

export default HomeCatalogSection;
