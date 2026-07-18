import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PaginationControls from '@/presentation/ui/molecules/common/PaginationControls';
import SelectDropdown from '@/presentation/ui/molecules/common/SelectDropdown';
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
  isSeller: boolean;
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
  onGalleryImageUpload: (files: File[]) => Promise<void>;
  onGalleryImageRemove: (imageId: string) => Promise<void>;
  onGalleryImageReorder: (imageIds: string[]) => Promise<void>;
  onVideoUrlChange: (value: string) => void;
  onVideoTitleChange: (value: string) => void;
  onAddVideo: () => Promise<void>;
  onRemoveVideo: (videoId: string) => Promise<void>;
  onSubmit: () => Promise<boolean>;
  onEdit: (product: IProduct) => void;
  onToggleStatus: (product: IProduct) => Promise<void>;
  onReset: () => void;
  onQuickCreateCategory: (name: string) => Promise<ICategory | null>;
  onQuickCreateSupplier: (name: string) => Promise<ISupplier | null>;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onChangePage: (page: number) => void | Promise<void>;
}

const QuickCreateModal = ({
  title,
  placeholder,
  onConfirm,
  onClose,
}: {
  title: string;
  placeholder: string;
  onConfirm: (name: string) => Promise<void>;
  onClose: () => void;
}) => {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    await onConfirm(value.trim());
    setSaving(false);
  };

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-neutral-dark/50 px-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-sm rounded-[1.75rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='mb-4 text-lg font-bold text-neutral-dark'>{title}</h2>
        <form onSubmit={handleSubmit} className='space-y-3'>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={saving}
            className='w-full rounded-xl border border-neutral-gray/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
          />
          <div className='flex gap-2'>
            <button
              type='submit'
              disabled={saving || !value.trim()}
              className='flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
            >
              {saving ? 'Creando...' : 'Crear'}
            </button>
            <button
              type='button'
              onClick={onClose}
              disabled={saving}
              className='rounded-xl border border-neutral-gray/30 px-4 py-2.5 text-sm font-semibold text-neutral-dark/70 transition hover:bg-neutral-gray/10'
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getTikTokEmbedUrl(url: string): string | null {
  const match = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
}

function getInstagramEmbedUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/);
  return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : null;
}

function getFacebookEmbedUrl(url: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
}

interface VideoPreviewInfo {
  embedUrl: string;
  isPortrait: boolean;
}

function getVideoPreview(url: string): VideoPreviewInfo | null {
  const yt = getYouTubeEmbedUrl(url);
  if (yt) return { embedUrl: yt, isPortrait: false };
  const tt = getTikTokEmbedUrl(url);
  if (tt) return { embedUrl: tt, isPortrait: true };
  const ig = getInstagramEmbedUrl(url);
  if (ig) return { embedUrl: ig, isPortrait: true };
  if (url.includes('facebook.com') && url.includes('video')) {
    return { embedUrl: getFacebookEmbedUrl(url), isPortrait: false };
  }
  return null;
}

function getVideoPreviewFromType(videoUrl: string, videoType: string): VideoPreviewInfo | null {
  if (videoType === 'YOUTUBE') {
    const u = getYouTubeEmbedUrl(videoUrl);
    return u ? { embedUrl: u, isPortrait: false } : null;
  }
  if (videoType === 'TIKTOK') {
    const u = getTikTokEmbedUrl(videoUrl);
    return u ? { embedUrl: u, isPortrait: true } : null;
  }
  if (videoType === 'INSTAGRAM') {
    const u = getInstagramEmbedUrl(videoUrl);
    return u ? { embedUrl: u, isPortrait: true } : null;
  }
  if (videoType === 'FACEBOOK') {
    return { embedUrl: getFacebookEmbedUrl(videoUrl), isPortrait: false };
  }
  return null;
}

export const ProductsManagementView = ({
  isSeller,
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
  onGalleryImageReorder,
  onVideoUrlChange,
  onVideoTitleChange,
  onAddVideo,
  onRemoveVideo,
  onSubmit,
  onEdit,
  onToggleStatus,
  onReset,
  onQuickCreateCategory,
  onQuickCreateSupplier,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onChangePage,
}: ProductsManagementViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);

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
                <Label htmlFor="product-cost">Precio de costo</Label>
                <Input
                  id="product-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Costo de adquisición"
                  value={form.cost}
                  onChange={(event) => onFormChange('cost', event.target.value)}
                  disabled={submitting}
                />
              </Box>
            </Box>

            <Box className="grid gap-4 md:grid-cols-2">
              <Box>
                <Label htmlFor="product-stock">Stock disponible</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Unidades en inventario"
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
                <SelectDropdown
                  value={form.categoryId}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder='Selecciona una categoría'
                  disabled={submitting}
                  onCreateClick={() => setShowCreateCategoryModal(true)}
                  createLabel='+ Nueva categoría'
                  onChange={(v) => onFormChange('categoryId', v)}
                />
              </Box>
              <Box>
                <Label htmlFor="product-store">Tienda</Label>
                {isSeller ? (
                  <div className='flex h-[50px] items-center rounded-2xl border border-neutral-gray/20 bg-background px-4 text-sm text-neutral-dark'>
                    {stores[0]?.name ?? 'Cargando...'}
                  </div>
                ) : (
                  <SelectDropdown
                    value={form.storeId}
                    options={stores.map((s) => ({
                      value: s.id,
                      label: `${s.storeType === 'RESTAURANT' ? '🍽️ ' : ''}${s.name}`,
                    }))}
                    placeholder='Selecciona una tienda'
                    disabled={submitting}
                    onChange={(v) => {
                      onFormChange('storeId', v);
                      onFormChange('menuCategoryId', '');
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Menu category — only for restaurant stores */}
            {menuCategories.length > 0 ? (
              <Box>
                <Label htmlFor="product-menu-category">
                  <span className='mr-1'>🍽️</span> Sección del menú
                </Label>
                <SelectDropdown
                  value={form.menuCategoryId}
                  options={[...menuCategories]
                    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                    .map((c) => ({ value: c.id, label: c.name }))}
                  placeholder='Sin sección (aparece en "Otros")'
                  disabled={submitting}
                  onChange={(v) => onFormChange('menuCategoryId', v)}
                />
              </Box>
            ) : null}

            <Box>
              <Label htmlFor="product-supplier">Proveedor</Label>
              <SelectDropdown
                value={form.supplierId}
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                placeholder='Sin proveedor asociado'
                disabled={submitting}
                onCreateClick={() => setShowCreateSupplierModal(true)}
                createLabel='+ Nuevo proveedor'
                onChange={(v) => onFormChange('supplierId', v)}
              />
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

            <Box className='grid gap-4 md:grid-cols-2'>
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

              <Box>
                <Label htmlFor='low-stock-threshold'>Alerta de stock bajo (unidades)</Label>
                <Input
                  id='low-stock-threshold'
                  type='number'
                  min='0'
                  step='1'
                  placeholder='Ej. 5 — avisa cuando quede poco'
                  value={form.lowStockThreshold}
                  onChange={(e) => onFormChange('lowStockThreshold', e.target.value)}
                  disabled={submitting}
                />
              </Box>
            </Box>

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

              {/* Hidden multi-file input */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={async (event) => {
                  const files = Array.from(event.target.files ?? []);
                  if (files.length > 0) {
                    await onGalleryImageUpload(files);
                    event.target.value = '';
                  }
                }}
              />

              {/* Drop zone */}
              <div
                className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  dropZoneActive
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-primary/3'
                }`}
                onClick={() => galleryInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDropZoneActive(true); }}
                onDragLeave={() => setDropZoneActive(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDropZoneActive(false);
                  const files = Array.from(e.dataTransfer.files).filter((f) =>
                    ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
                  );
                  if (files.length > 0) await onGalleryImageUpload(files);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') galleryInputRef.current?.click(); }}
                aria-label="Subir imágenes a la galería"
              >
                {gallerySubmitting ? (
                  <>
                    <i className="bx bx-loader-alt animate-spin text-2xl text-primary" aria-hidden="true" />
                    <span className="text-sm font-medium text-primary">Subiendo imágenes...</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-cloud-upload text-2xl text-slate-400" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-600">
                      Arrastra fotos aquí o <span className="text-primary underline">haz clic para seleccionar</span>
                    </span>
                    <span className="text-xs text-slate-400">JPEG · PNG · WebP · máx 8 MB · múltiples archivos</span>
                  </>
                )}
              </div>

              {/* Gallery grid with drag-to-reorder */}
              {gallery.length > 0 ? (
                <>
                  {gallery.length > 1 ? (
                    <p className="mb-2 text-xs text-slate-400">
                      <i className="bx bx-move mr-1" aria-hidden="true" />
                      Arrastra las imágenes para reordenarlas
                    </p>
                  ) : null}
                  <Box className="grid grid-cols-3 gap-3">
                    {gallery.map((img, index) => (
                      <Box
                        key={img.id}
                        draggable
                        onDragStart={() => { dragIndexRef.current = index; }}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                        onDragLeave={() => setDragOverIndex(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = dragIndexRef.current;
                          if (from === null || from === index) { setDragOverIndex(null); return; }
                          const newOrder = [...gallery];
                          const [moved] = newOrder.splice(from, 1);
                          newOrder.splice(index, 0, moved);
                          setDragOverIndex(null);
                          dragIndexRef.current = null;
                          void onGalleryImageReorder(newOrder.map((i) => i.id));
                        }}
                        onDragEnd={() => { dragIndexRef.current = null; setDragOverIndex(null); }}
                        className={`group relative cursor-grab overflow-hidden rounded-xl border-2 transition-all active:cursor-grabbing ${
                          dragOverIndex === index
                            ? 'border-primary shadow-md scale-105'
                            : 'border-neutral-gray/20 hover:border-primary/30'
                        }`}
                      >
                        {/* Order badge */}
                        <span className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                        <img
                          src={img.imageUrl}
                          alt={`Galería ${index + 1}`}
                          className="h-24 w-full object-cover"
                          draggable={false}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); void onGalleryImageRemove(img.id); }}
                          disabled={gallerySubmitting}
                          aria-label="Eliminar imagen"
                          className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 disabled:opacity-40"
                        >
                          <i className="bx bx-x text-sm" aria-hidden="true" />
                        </button>
                        {/* Drag handle hint */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/30 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <i className="bx bx-move text-sm text-white" aria-hidden="true" />
                        </div>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Typography className="text-sm text-neutral-dark/50">
                  Sin imágenes adicionales en la galería.
                </Typography>
              )}
            </Box>
          ) : null}

          {/* Videos section */}
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
                {/* Video embed preview */}
                {(() => {
                  const preview = getVideoPreview(videoUrl);
                  if (!preview) return null;
                  return preview.isPortrait ? (
                    <Box className="mt-3 mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl border border-neutral-gray/20 shadow-sm">
                      <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
                        <iframe
                          src={preview.embedUrl}
                          title="Vista previa"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          scrolling="no"
                          className="absolute inset-0 h-full w-full"
                        />
                      </div>
                    </Box>
                  ) : (
                    <Box className="mt-3 overflow-hidden rounded-2xl border border-neutral-gray/20 shadow-sm">
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={preview.embedUrl}
                          title="Vista previa"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          scrolling="no"
                          className="absolute inset-0 h-full w-full"
                        />
                      </div>
                    </Box>
                  );
                })()}
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
              {!editingId ? (
                <Box className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Guarda el producto primero para poder agregar videos.
                </Box>
              ) : (
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={videoSubmitting || !videoUrl.trim()}
                >
                  {videoSubmitting ? 'Agregando...' : 'Agregar video'}
                </Button>
              )}
            </form>

            {videos.length > 0 ? (
              <Box className="space-y-3">
                {videos.map((video) => {
                  const preview = getVideoPreviewFromType(video.videoUrl, video.videoType);
                  return (
                    <Box
                      key={video.id}
                      className={`overflow-hidden rounded-2xl border border-neutral-gray/20 ${preview?.isPortrait ? 'mx-auto max-w-[320px]' : ''}`}
                    >
                      {preview ? (
                        <div className="relative w-full" style={{ paddingBottom: preview.isPortrait ? '177.78%' : '56.25%' }}>
                          <iframe
                            src={preview.embedUrl}
                            title={video.title ?? 'Video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            scrolling="no"
                            className="absolute inset-0 h-full w-full"
                          />
                        </div>
                      ) : null}
                      <Box className="flex items-center justify-between gap-3 px-4 py-3">
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
                          <Typography className="mt-0.5 truncate text-xs text-neutral-dark/50">
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
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography className="text-sm text-neutral-dark/50">
                Sin videos agregados aún.
              </Typography>
            )}
          </Box>
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
              <SelectDropdown
                value={selectedCategoryId}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                placeholder='Todas las categorías'
                onChange={(v) => onCategoryFilterChange(v)}
              />
            </Box>
          </Box>

          <Box className="mt-6 space-y-3">
            {loading ? (
              <>
                <div className='h-16 skeleton rounded-2xl' />
                <div className='h-16 skeleton rounded-2xl' />
                <div className='h-16 skeleton rounded-2xl' />
                <div className='h-16 skeleton rounded-2xl' />
              </>
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

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            loading={loading}
            onChangePage={onChangePage}
          />
        </FeaturePanel>
      </Box>

      {showCreateCategoryModal ? (
        <QuickCreateModal
          title='Nueva categoría'
          placeholder='Ej. Electrónica'
          onClose={() => setShowCreateCategoryModal(false)}
          onConfirm={async (name) => {
            const created = await onQuickCreateCategory(name);
            if (created) onFormChange('categoryId', created.id);
            setShowCreateCategoryModal(false);
          }}
        />
      ) : null}

      {showCreateSupplierModal ? (
        <QuickCreateModal
          title='Nuevo proveedor'
          placeholder='Ej. Distribuidora ABC'
          onClose={() => setShowCreateSupplierModal(false)}
          onConfirm={async (name) => {
            const created = await onQuickCreateSupplier(name);
            if (created) onFormChange('supplierId', created.id);
            setShowCreateSupplierModal(false);
          }}
        />
      ) : null}
    </FeatureScreen>
  );
};
