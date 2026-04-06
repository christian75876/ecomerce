import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { ProductFormState } from '@/application/useCases/products/useProductsManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface ProductsManagementViewProps {
  products: IProduct[];
  categories: ICategory[];
  stores: IStore[];
  suppliers: ISupplier[];
  form: ProductFormState;
  editingId: string | null;
  search: string;
  selectedCategoryId: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onFormChange: <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => void;
  onSubmit: () => Promise<boolean>;
  onEdit: (product: IProduct) => void;
  onToggleStatus: (product: IProduct) => Promise<void>;
  onReset: () => void;
}

export const ProductsManagementView = ({
  products,
  categories,
  stores,
  suppliers,
  form,
  editingId,
  search,
  selectedCategoryId,
  loading,
  submitting,
  error,
  onSearchChange,
  onCategoryFilterChange,
  onFormChange,
  onSubmit,
  onEdit,
  onToggleStatus,
  onReset,
}: ProductsManagementViewProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <Box className="space-y-8">
      <Box className="flex flex-col gap-3">
        <Typography variant="h1" className="text-3xl font-bold">
          Productos
        </Typography>
        <Typography className="max-w-3xl text-neutral-dark/70">
          Gestiona el catálogo comercial con SKU único, tienda, proveedor,
          costo, stock inicial y visibilidad de stock en el catálogo.
        </Typography>
      </Box>

      <Box className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
          <Typography variant="h2" className="text-xl font-semibold">
            {editingId ? 'Editar producto' : 'Nuevo producto'}
          </Typography>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Box>
              <Label htmlFor="product-name">Nombre</Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(event) => onFormChange('name', event.target.value)}
                disabled={submitting}
              />
            </Box>

            <Box>
              <Label htmlFor="product-description">Descripción</Label>
              <textarea
                id="product-description"
                value={form.description}
                onChange={(event) =>
                  onFormChange('description', event.target.value)
                }
                disabled={submitting}
                className="min-h-28 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Box>

            <Box className="grid gap-4 md:grid-cols-2">
              <Box>
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  value={form.sku}
                  onChange={(event) => onFormChange('sku', event.target.value)}
                  disabled={submitting}
                />
              </Box>
              <Box>
                <Label htmlFor="product-price">Precio</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => onFormChange('price', event.target.value)}
                  disabled={submitting}
                />
              </Box>
            </Box>

            <Box className="grid gap-4 md:grid-cols-2">
              <Box>
                <Label htmlFor="product-cost">Costo opcional</Label>
                <Input
                  id="product-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={(event) => onFormChange('cost', event.target.value)}
                  disabled={submitting}
                />
              </Box>
              <Box>
                <Label htmlFor="product-stock">Stock inicial opcional</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.initialStock}
                  onChange={(event) =>
                    onFormChange('initialStock', event.target.value)
                  }
                  disabled={submitting || Boolean(editingId)}
                />
              </Box>
            </Box>

            <Box className="grid gap-4 md:grid-cols-2">
              <Box>
                <Label htmlFor="product-category">Categoría</Label>
                <select
                  id="product-category"
                  value={form.categoryId}
                  onChange={(event) =>
                    onFormChange('categoryId', event.target.value)
                  }
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Box>
              <Box>
                <Label htmlFor="product-store">Tienda</Label>
                <select
                  id="product-store"
                  value={form.storeId}
                  onChange={(event) => onFormChange('storeId', event.target.value)}
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona una tienda</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </Box>
            </Box>

            <Box>
              <Label htmlFor="product-supplier">Proveedor opcional</Label>
              <select
                id="product-supplier"
                value={form.supplierId}
                onChange={(event) => onFormChange('supplierId', event.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sin proveedor asociado</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box>
              <Label htmlFor="product-image">Imagen principal opcional</Label>
              <Input
                id="product-image"
                value={form.imageUrl}
                onChange={(event) =>
                  onFormChange('imageUrl', event.target.value)
                }
                placeholder="https://..."
                disabled={submitting}
              />
            </Box>

            <label className="flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark">
              <input
                type="checkbox"
                checked={form.showStock}
                onChange={(event) =>
                  onFormChange('showStock', event.target.checked)
                }
                disabled={submitting}
              />
              Mostrar stock disponible en el catálogo
            </label>

            {error ? (
              <Box className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </Box>
            ) : null}

            <Box className="flex flex-wrap gap-3">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Crear producto'}
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
        </Box>

        <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
          <Box className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <Box>
              <Typography variant="h2" className="text-xl font-semibold">
                Catálogo administrativo
              </Typography>
              <Typography className="mt-2 text-sm text-neutral-dark/65">
                Filtra por texto o por categoría para encontrar productos rápido.
              </Typography>
            </Box>

            <Box className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_220px]">
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por nombre"
              />
              <select
                value={selectedCategoryId}
                onChange={(event) => onCategoryFilterChange(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          <Box className="mt-6 space-y-3">
            {loading ? (
              <Typography>Cargando productos...</Typography>
            ) : products.length === 0 ? (
              <Box className="rounded-2xl border border-dashed border-neutral-gray/40 bg-background px-6 py-10 text-center">
                <Typography>No hay productos registrados todavía.</Typography>
              </Box>
            ) : (
              products.map((product) => (
                <Box
                  key={product.id}
                  className="grid gap-4 rounded-2xl border border-neutral-gray/20 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <Box className="space-y-2">
                    <Box className="flex flex-wrap items-center gap-3">
                      <Typography variant="h3" className="text-lg font-semibold">
                        {product.name}
                      </Typography>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </Box>
                    <Typography className="text-sm text-neutral-dark/70">
                      SKU: {product.sku} · Categoría: {product.category.name} ·
                      Tienda: {product.store?.name ?? 'Sin tienda'}
                    </Typography>
                    <Typography className="text-sm text-neutral-dark/70">
                      ${Number(product.price).toFixed(2)} · Costo:{' '}
                      {product.cost ? `$${Number(product.cost).toFixed(2)}` : 'N/D'} ·
                      Stock visible:{' '}
                      {product.showStock ? 'Sí' : 'No'}
                    </Typography>
                    {product.supplier ? (
                      <Typography className="text-sm text-neutral-dark/70">
                        Proveedor: {product.supplier.name}
                      </Typography>
                    ) : null}
                    <Typography className="text-sm text-neutral-dark/75">
                      {product.description}
                    </Typography>
                  </Box>

                  <Box className="flex flex-wrap gap-3 lg:flex-col">
                    <Button
                      type="button"
                      variant="outlinePrimary"
                      onClick={() => onEdit(product)}
                      disabled={submitting}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant={product.isActive ? 'danger' : 'secondary'}
                      onClick={() => void onToggleStatus(product)}
                      disabled={submitting}
                    >
                      {product.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
