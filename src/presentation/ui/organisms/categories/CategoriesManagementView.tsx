import { createPortal } from 'react-dom';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import FeaturePanel from '@/presentation/ui/templates/feature/FeaturePanel';
import FeatureScreen from '@/presentation/ui/templates/feature/FeatureScreen';
import FeatureScreenHeader from '@/presentation/ui/templates/feature/FeatureScreenHeader';

const CategoryProductsPanel = ({
  category,
  products,
  loading,
  onToggle,
  onClose,
}: {
  category: ICategory;
  products: IProduct[];
  loading: boolean;
  onToggle: (product: IProduct) => Promise<void>;
  onClose: () => void;
}) =>
  createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-neutral-dark/50 px-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-neutral-gray/20 px-6 py-4'>
          <div>
            <h2 className='text-lg font-bold text-neutral-dark'>{category.name}</h2>
            <p className='text-sm text-neutral-dark/55'>
              {products.length} {products.length === 1 ? 'producto' : 'productos'} asociados
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full text-neutral-dark/50 transition hover:bg-neutral-gray/20 hover:text-neutral-dark'
            aria-label='Cerrar'
          >
            <i className='bx bx-x text-xl' aria-hidden='true' />
          </button>
        </div>

        {/* Content */}
        <div className='overflow-y-auto p-4'>
          {loading ? (
            <p className='py-8 text-center text-sm text-neutral-dark/55'>Cargando productos...</p>
          ) : products.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-neutral-gray/40 bg-background px-6 py-10 text-center'>
              <p className='text-sm text-neutral-dark/55'>No hay productos en esta categoría.</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {products.map((product) => (
                <div
                  key={product.id}
                  className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3'
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className='h-10 w-10 flex-shrink-0 rounded-xl object-cover'
                    />
                  ) : (
                    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-gray/20 text-neutral-dark/30'>
                      <i className='bx bx-image text-lg' aria-hidden='true' />
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-neutral-dark'>{product.name}</p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() => void onToggle(product)}
                    disabled={loading}
                    className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                      product.isActive
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {product.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );

interface CategoriesManagementViewProps {
  categories: ICategory[];
  search: string;
  name: string;
  editingId: string | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  viewingCategory: ICategory | null;
  categoryProducts: IProduct[];
  productsLoading: boolean;
  onSearchChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: () => Promise<boolean>;
  onEdit: (category: ICategory) => void;
  onToggleStatus: (category: ICategory) => Promise<void>;
  onReset: () => void;
  onReload: () => Promise<void>;
  onViewProducts: (category: ICategory) => void;
  onCloseProducts: () => void;
  onToggleProduct: (product: IProduct) => Promise<void>;
}

export const CategoriesManagementView = ({
  categories,
  search,
  name,
  editingId,
  loading,
  submitting,
  error,
  viewingCategory,
  categoryProducts,
  productsLoading,
  onSearchChange,
  onNameChange,
  onSubmit,
  onEdit,
  onToggleStatus,
  onReset,
  onReload,
  onViewProducts,
  onCloseProducts,
  onToggleProduct,
}: CategoriesManagementViewProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <FeatureScreen>
      <FeatureScreenHeader
        title='Categorías'
        description='Administra la estructura base del catálogo. Desde aquí puedes crear, editar y activar o desactivar categorías visibles para productos.'
      />

      <Box className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <FeaturePanel
          title={editingId ? 'Editar categoría' : 'Nueva categoría'}
          subtitle='Usa nombres claros y evita duplicados.'
        >
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Ej. Electrónica"
              disabled={submitting}
            />

            {error ? (
              <Box className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </Box>
            ) : null}

            <Box className="flex gap-3">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Crear categoría'}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onReset}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              ) : null}
            </Box>
          </form>
        </FeaturePanel>

        <FeaturePanel
          title='Categorías registradas'
          action={
            <Button
              type="button"
              variant="ghost"
              onClick={() => void onReload()}
              disabled={loading || submitting}
            >
              Recargar
            </Button>
          }
        >
          <div className='relative mb-4 mt-2'>
            <i className='bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-neutral-dark/40' aria-hidden='true' />
            <input
              type='text'
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder='Buscar categoría...'
              className='w-full rounded-2xl border border-neutral-gray/80 bg-white/90 py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
            />
            {search ? (
              <button
                type='button'
                onClick={() => onSearchChange('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark/40 transition hover:text-neutral-dark'
                aria-label='Limpiar búsqueda'
              >
                <i className='bx bx-x text-base' aria-hidden='true' />
              </button>
            ) : null}
          </div>

          {loading ? (
            <Box className='space-y-3'>
              <div className='h-14 skeleton rounded-2xl' />
              <div className='h-14 skeleton rounded-2xl' />
              <div className='h-14 skeleton rounded-2xl' />
              <div className='h-14 skeleton rounded-2xl' />
            </Box>
          ) : categories.length === 0 ? (
            <Box className="rounded-2xl border border-dashed border-neutral-gray/40 bg-background px-6 py-10 text-center">
              <Typography>{search ? 'No se encontraron categorías.' : 'No hay categorías creadas todavía.'}</Typography>
            </Box>
          ) : (
            <Box className="space-y-3">
              {categories.map((category) => (
                <Box
                  key={category.id}
                  className="flex flex-col gap-4 rounded-2xl border border-neutral-gray/20 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <Box>
                    <Typography variant="h3" className="text-lg font-semibold">
                      {category.name}
                    </Typography>
                    <Box className='mt-1 flex flex-wrap items-center gap-2'>
                      <Typography className="text-sm text-neutral-dark/65">
                        Estado:{' '}
                        <span className={category.isActive ? 'text-success' : 'text-error'}>
                          {category.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </Typography>
                      <button
                        type='button'
                        onClick={() => void onViewProducts(category)}
                        className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition hover:bg-primary/20'
                      >
                        <i className='bx bx-package text-sm' aria-hidden='true' />
                        {category.productCount ?? 0} {(category.productCount ?? 0) === 1 ? 'producto' : 'productos'}
                      </button>
                    </Box>
                  </Box>

                  <Box className="flex gap-3">
                    <Button
                      type="button"
                      variant="outlinePrimary"
                      onClick={() => onEdit(category)}
                      disabled={submitting}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant={category.isActive ? 'danger' : 'secondary'}
                      onClick={() => void onToggleStatus(category)}
                      disabled={submitting}
                    >
                      {category.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </FeaturePanel>
      </Box>

      {viewingCategory ? (
        <CategoryProductsPanel
          category={viewingCategory}
          products={categoryProducts}
          loading={productsLoading}
          onToggle={onToggleProduct}
          onClose={onCloseProducts}
        />
      ) : null}
    </FeatureScreen>
  );
};
