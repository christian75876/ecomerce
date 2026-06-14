import { useRef } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct, IProductImage, IProductVideo } from '@/application/dtos/products/response/ProductResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { ProductFormState } from '@/application/useCases/products/useProductsManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import FeaturePanel from '@/presentation/ui/templates/feature/FeaturePanel';
import FeatureScreen from '@/presentation/ui/templates/feature/FeatureScreen';
import FeatureScreenHeader from '@/presentation/ui/templates/feature/FeatureScreenHeader';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface ProductsManagementViewProps {
  products: IProduct[];
  categories: ICategory[];
  stores: IStore[];
  suppliers: ISupplier[];
  menuCategories: IMenuCategory[];
  form: ProductFormState;
  editingId: string | null;
  search: string;
  selectedCategoryId: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  imagePreview: string | null;
  gallery: IProductImage[];
  gallerySubmitting: boolean;
  galleryError: string | null;
  videos: IProductVideo[];
  videoUrl: string;
  videoTitle: string;
  videoSubmitting: boolean;
  videoError: string | null;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onFormChange: <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => void;
  onImageFileChange: (file: File | null) => void;
  onGalleryImageUpload: (file: File) => Promise<void>;
  onGalleryImageRemove: (imageId: string) => Promise<void>;
  onVideoUrlChange: (value: string) => void;
  onVideoTitleChange: (value: string) => void;
  onAddVideo: () => Promise<void>;
  onRemoveVideo: (videoId: string) => Promise<void>;
  onSubmit: () => Promise<boolean>;
  onEdit: (product: IProduct) => void;
  onToggleStatus: (product: IProduct) => Promise<void>;
  onReset: () => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getInstagramEmbedUrl(url: string): string {
  const clean = url.replace(/\/?$/, '');
  return `${clean}/embed`;
}

export const ProductsManagementView = ({
  products,
  categories,
  stores,
  suppliers,
  menuCategories,
  form,
  editingId,
  search,
  selectedCategoryId,
  loading,
  submitting,
  error,
  imagePreview,
  gallery,
  gallerySubmitting,
  galleryError,
  videos,
  videoUrl,
  videoTitle,
  videoSubmitting,
  videoError,
  onSearchChange,
  onCategoryFilterChange,
  onFormChange,
  onImageFileChange,
  onGalleryImageUpload,
  onGalleryImageRemove,
  onVideoUrlChange,
  onVideoTitleChange,
  onAddVideo,
  onRemoveVideo,
  onSubmit,
  onEdit,
  onToggleStatus,
  onReset,
}: ProductsManagementViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onImageFileChange(file);
  };

  const handleAddVideo = async (event: React.FormEvent) => {
    event.preventDefault();
    await onAddVideo();
  };

  const resolvedImageSrc = imagePreview ?? (form.imageUrl || null);

  return (
    <FeatureScreen>
      <FeatureScreenHeader
        title='Productos'
        description='Gestiona el catálogo comercial con tipo de producto, manejo por lotes, SKU único, proveedor base y stock inicial opcional.'
      />

      <Box className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <FeaturePanel title={editingId ? 'Editar producto' : 'Nuevo producto'}>
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
                <Label htmlFor="product-compare-at-price">Precio antes (tachado)</Label>
                <Input
                  id="product-compare-at-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio original (opcional)"
                  value={form.compareAtPrice}
                  onChange={(event) => onFormChange('compareAtPrice', event.target.value)}
                  disabled={submitting}
                />
              </Box>
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
            </Box>

            <Box className="grid gap-4 md:grid-cols-2">
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
              <label className="flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark">
                <input
                  type="checkbox"
                  checked={form.isPerishable}
                  onChange={(event) =>
                    onFormChange('isPerishable', event.target.checked)
                  }
                  disabled={submitting}
                />
                Producto perecedero
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark">
                <input
                  type="checkbox"
                  checked={form.trackBatches}
                  onChange={(event) =>
                    onFormChange('trackBatches', event.target.checked)
                  }
                  disabled={submitting}
                />
                Gestionar inventario por lotes
              </label>
            </Box>

            {form.isPerishable ? (
              <Box>
                <Label htmlFor="product-initial-expiration">
                  Vencimiento del stock inicial
                </Label>
                <Input
                  id="product-initial-expiration"
                  type="date"
                  value={form.initialExpiresAt}
                  onChange={(event) =>
                    onFormChange('initialExpiresAt', event.target.value)
                  }
                  disabled={submitting || Boolean(editingId)}
                />
              </Box>
            ) : null}

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
                  onChange={(event) => {
                    onFormChange('storeId', event.target.value);
                    onFormChange('menuCategoryId', '');
                  }}
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona una tienda</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.storeType === 'RESTAURANT' ? '🍽️ ' : ''}{store.name}
                    </option>
                  ))}
                </select>
              </Box>
            </Box>

            {/* Menu category — only for restaurant stores */}
            {menuCategories.length > 0 ? (
              <Box>
                <Label htmlFor="product-menu-category">
                  <span className='mr-1'>🍽️</span> Sección del menú
                </Label>
                <select
                  id="product-menu-category"
                  value={form.menuCategoryId}
                  onChange={(event) => onFormChange('menuCategoryId', event.target.value)}
                  disabled={submitting}
                  className="w-full rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Sin sección (aparece en "Otros")</option>
                  {[...menuCategories]
                    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </Box>
            ) : null}

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

            {/* Image upload section */}
            <Box>
              <Label>Imagen principal</Label>
              {resolvedImageSrc ? (
                <Box className="mb-3 overflow-hidden rounded-xl border border-neutral-gray/20">
                  <img
                    src={resolvedImageSrc}
                    alt="Vista previa"
                    className="h-40 w-full object-cover"
                  />
                </Box>
              ) : null}
              <Box className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={submitting}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                >
                  {resolvedImageSrc ? 'Cambiar imagen' : 'Subir imagen'}
                </Button>
                <Typography className="text-xs text-neutral-dark/50">
                  O ingresa una URL de imagen:
                </Typography>
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

          {/* Gallery section — only visible when editing an existing product */}
          {editingId ? (
            <Box className="mt-6 border-t border-neutral-gray/20 pt-6">
              <Typography variant="h3" className="mb-4 text-base font-semibold">
                Galería de imágenes
              </Typography>

              {galleryError ? (
                <Box className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {galleryError}
                </Box>
              ) : null}

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    await onGalleryImageUpload(file);
                    event.target.value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => galleryInputRef.current?.click()}
                disabled={gallerySubmitting}
                className="mb-4"
              >
                {gallerySubmitting ? 'Subiendo...' : 'Agregar imagen a galería'}
              </Button>

              {gallery.length > 0 ? (
                <Box className="grid grid-cols-3 gap-3">
                  {gallery.map((img) => (
                    <Box key={img.id} className="group relative overflow-hidden rounded-xl border border-neutral-gray/20">
                      <img
                        src={img.imageUrl}
                        alt="Galería"
                        className="h-24 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => void onGalleryImageRemove(img.id)}
                        disabled={gallerySubmitting}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography className="text-sm text-neutral-dark/50">
                  Sin imágenes adicionales en la galería.
                </Typography>
              )}
            </Box>
          ) : null}

          {/* Videos section — only visible when editing an existing product */}
          {editingId ? (
            <Box className="mt-6 border-t border-neutral-gray/20 pt-6">
              <Typography variant="h3" className="mb-4 text-base font-semibold">
                Videos del producto
              </Typography>

              <form onSubmit={handleAddVideo} className="mb-4 space-y-3">
                <Box>
                  <Label htmlFor="video-url">URL de YouTube o Instagram</Label>
                  <Input
                    id="video-url"
                    value={videoUrl}
                    onChange={(event) => onVideoUrlChange(event.target.value)}
                    placeholder="https://youtube.com/watch?v=... o https://instagram.com/p/..."
                    disabled={videoSubmitting}
                  />
                </Box>
                <Box>
                  <Label htmlFor="video-title">Título opcional</Label>
                  <Input
                    id="video-title"
                    value={videoTitle}
                    onChange={(event) => onVideoTitleChange(event.target.value)}
                    placeholder="Ej: Video de demostración"
                    disabled={videoSubmitting}
                  />
                </Box>
                {videoError ? (
                  <Box className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {videoError}
                  </Box>
                ) : null}
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={videoSubmitting || !videoUrl.trim()}
                >
                  {videoSubmitting ? 'Agregando...' : 'Agregar video'}
                </Button>
              </form>

              {videos.length > 0 ? (
                <Box className="space-y-2">
                  {videos.map((video) => (
                    <Box
                      key={video.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-gray/20 px-4 py-3"
                    >
                      <Box className="min-w-0 flex-1">
                        <Box className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            video.videoType === 'YOUTUBE'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {video.videoType === 'YOUTUBE' ? 'YouTube' : 'Instagram'}
                          </span>
                          {video.title ? (
                            <Typography className="truncate text-sm font-medium">
                              {video.title}
                            </Typography>
                          ) : null}
                        </Box>
                        <Typography className="mt-1 truncate text-xs text-neutral-dark/50">
                          {video.videoUrl}
                        </Typography>
                      </Box>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => void onRemoveVideo(video.id)}
                        disabled={videoSubmitting}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography className="text-sm text-neutral-dark/50">
                  Sin videos agregados aún.
                </Typography>
              )}
            </Box>
          ) : null}
        </FeaturePanel>

        <FeaturePanel
          title='Catálogo administrativo'
          subtitle='Filtra por texto o por categoría para encontrar productos rápido.'
        >
          <Box className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
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
                  <Box className="flex gap-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                      />
                    ) : null}
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
                        {product.menuCategory ? ` · Sección: ${product.menuCategory.name}` : ''}
                      </Typography>
                      <Typography className="text-sm text-neutral-dark/70">
                        {formatCurrencyCOP(product.price)} · Costo:{' '}
                        {product.cost ? formatCurrencyCOP(product.cost) : 'N/D'} ·
                        Stock visible:{' '}
                        {product.showStock ? 'Sí' : 'No'}
                      </Typography>
                      <Typography className="text-sm text-neutral-dark/70">
                        Tipo: {product.isPerishable ? 'Perecedero' : 'No perecedero'} ·
                        Lotes: {product.trackBatches ? 'Sí' : 'No'}
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
        </FeaturePanel>
      </Box>
    </FeatureScreen>
  );
};
