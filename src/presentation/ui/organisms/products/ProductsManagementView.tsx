import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PaginationControls from '@/presentation/ui/molecules/common/PaginationControls';
import SelectDropdown from '@/presentation/ui/molecules/common/SelectDropdown';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct, IProductImage, IProductVariant, IProductVideo } from '@/application/dtos/products/response/ProductResponse';
import type { ColorOption, VariantCombination } from '@/application/useCases/products/useProductsManagement';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { ProductFieldErrors, ProductFormState } from '@/application/useCases/products/useProductsManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import FeaturePanel from '@/presentation/ui/templates/feature/FeaturePanel';
import FeatureScreen from '@/presentation/ui/templates/feature/FeatureScreen';
import FeatureScreenHeader from '@/presentation/ui/templates/feature/FeatureScreenHeader';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import InstagramEmbed from '@/presentation/ui/atoms/video/InstagramEmbed';

function formatThousands(raw: string): string {
  const n = raw.replace(/\D/g, '');
  if (!n) return '';
  return Number(n).toLocaleString('es-CO');
}

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
  fieldErrors: ProductFieldErrors;
  imagePreview: string | null;
  gallery: IProductImage[];
  gallerySubmitting: boolean;
  galleryError: string | null;
  pendingGalleryPreviews: string[];
  onPendingGalleryAdd: (files: File[]) => void;
  onPendingGalleryRemove: (index: number) => void;
  videos: IProductVideo[];
  pendingVideos: Array<{ videoUrl: string; videoTitle: string }>;
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
  variants: IProductVariant[];
  variantSizes: string[];
  variantColors: ColorOption[];
  variantCombinations: VariantCombination[];
  variantSubmitting: boolean;
  variantError: string | null;
  onAddVariantSize: (size: string) => void;
  onRemoveVariantSize: (size: string) => void;
  onAddVariantColor: (color: ColorOption) => void;
  onRemoveVariantColor: (colorName: string) => void;
  onUpdateCombination: (idx: number, field: keyof VariantCombination, value: string | boolean) => void;
  onSaveVariants: () => Promise<void>;
  onVideoUrlChange: (value: string) => void;
  onVideoTitleChange: (value: string) => void;
  onAddVideo: () => Promise<void>;
  onRemovePendingVideo: (index: number) => void;
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
  fieldErrors,
  imagePreview,
  gallery,
  gallerySubmitting,
  galleryError,
  pendingGalleryPreviews,
  onPendingGalleryAdd,
  onPendingGalleryRemove,
  variants,
  variantSizes,
  variantColors,
  variantCombinations,
  variantSubmitting,
  variantError,
  onAddVariantSize,
  onRemoveVariantSize,
  onAddVariantColor,
  onRemoveVariantColor,
  onUpdateCombination,
  onSaveVariants,
  videos,
  pendingVideos,
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
  onRemovePendingVideo,
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
  const pendingGalleryInputRef = useRef<HTMLInputElement>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);
  const [sizeInput, setSizeInput] = useState('');
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#3b82f6');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (editingId) setIsFormOpen(true);
  }, [editingId]);

  const handleReset = () => {
    onReset();
    setIsFormOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await onSubmit();
    if (success) setIsFormOpen(false);
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

  const isFormReady =
    form.name.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.sku.trim().length > 0 &&
    form.price !== '' && Number(form.price) > 0 &&
    form.categoryId !== '' &&
    form.storeId !== '';

  return (
    <FeatureScreen>
      <FeatureScreenHeader
        title='Productos'
        description='Gestiona el catálogo comercial con tipo de producto, manejo por lotes, SKU único, proveedor base y stock inicial opcional.'
      />

      {isFormOpen ? createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-neutral-dark/50 backdrop-blur-sm"
            onClick={!submitting ? handleReset : undefined}
          />
          <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ maxHeight: 'min(90vh, calc(100vh - 7rem))', marginBottom: '6rem' }}>
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-gray/20 px-6 py-4">
              <h2 className="text-lg font-bold text-neutral-dark">
                {editingId ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-dark/50 transition hover:bg-neutral-gray/10"
                aria-label="Cerrar"
              >
                <i className="bx bx-x text-xl" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            <Box>
              <Label htmlFor="product-name">Nombre <span className="text-red-500">*</span></Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(event) => onFormChange('name', event.target.value)}
                disabled={submitting}
                error={fieldErrors.name}
              />
            </Box>

            <Box>
              <Label htmlFor="product-description">Descripción <span className="text-red-500">*</span></Label>
              <textarea
                id="product-description"
                value={form.description}
                onChange={(event) =>
                  onFormChange('description', event.target.value)
                }
                disabled={submitting}
                maxLength={1000}
                className={`min-h-28 w-full rounded-lg border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary ${fieldErrors.description ? 'border-red-300 bg-red-50/40' : 'border-gray-300'}`}
              />
              <div className="mt-1 flex items-start justify-between">
                <span>
                  {fieldErrors.description ? (
                    <p className="text-xs text-red-500">{fieldErrors.description}</p>
                  ) : null}
                </span>
                <p className={`text-xs tabular-nums ${form.description.length >= 900 ? 'text-orange-500 font-semibold' : 'text-neutral-dark/40'}`}>
                  {form.description.length}/1000
                </p>
              </div>
            </Box>

            <Box className="grid gap-4 md:grid-cols-2">
              <Box>
                <Label htmlFor="product-sku">SKU <span className="text-red-500">*</span></Label>
                <Input
                  id="product-sku"
                  value={form.sku}
                  onChange={(event) => onFormChange('sku', event.target.value)}
                  disabled={submitting}
                  error={fieldErrors.sku}
                />
              </Box>
              <Box>
                <Label htmlFor="product-price">Precio <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-sm text-slate-400">$</span>
                  <input
                    id="product-price"
                    type="text"
                    inputMode="numeric"
                    value={formatThousands(form.price)}
                    onChange={(e) => onFormChange('price', e.target.value.replace(/\D/g, ''))}
                    disabled={submitting}
                    placeholder="0"
                    className={`w-full rounded-xl border py-2.5 pl-7 pr-4 text-sm text-slate-800 placeholder:text-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60 ${fieldErrors.price ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-300/30' : 'border-slate-200 bg-white hover:border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20'}`}
                  />
                </div>
                {fieldErrors.price ? (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.price}</p>
                ) : null}
              </Box>
            </Box>

            <Box className="grid gap-4 md:grid-cols-2">
              <Box>
                <Label htmlFor="product-compare-at-price">Precio antes (tachado)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-sm text-slate-400">$</span>
                  <input
                    id="product-compare-at-price"
                    type="text"
                    inputMode="numeric"
                    value={formatThousands(form.compareAtPrice)}
                    onChange={(e) => onFormChange('compareAtPrice', e.target.value.replace(/\D/g, ''))}
                    disabled={submitting}
                    placeholder="Precio original (opcional)"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-7 pr-4 text-sm text-slate-800 placeholder:text-slate-300 transition-all duration-200 hover:border-indigo-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </Box>
              <Box>
                <Label htmlFor="product-cost">Precio de costo</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-sm text-slate-400">$</span>
                  <input
                    id="product-cost"
                    type="text"
                    inputMode="numeric"
                    value={formatThousands(form.cost)}
                    onChange={(e) => onFormChange('cost', e.target.value.replace(/\D/g, ''))}
                    disabled={submitting}
                    placeholder="Costo de adquisición"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-7 pr-4 text-sm text-slate-800 placeholder:text-slate-300 transition-all duration-200 hover:border-indigo-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </Box>
            </Box>

            <Box className="grid gap-4 md:grid-cols-2">
              <Box>
                <Label htmlFor="product-stock">Stock disponible</Label>
                {(variantCombinations.length > 0 || variants.length > 0) ? (
                  <div className="flex h-[50px] items-center rounded-2xl border border-neutral-gray/20 bg-neutral-gray/5 px-4 text-sm text-neutral-dark/50">
                    Se toma de las variantes
                  </div>
                ) : (
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
                )}
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
                <Label htmlFor="product-category">Categoría <span className="text-red-500">*</span></Label>
                <SelectDropdown
                  value={form.categoryId}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder='Selecciona una categoría'
                  disabled={submitting}
                  onCreateClick={() => setShowCreateCategoryModal(true)}
                  createLabel='+ Nueva categoría'
                  onChange={(v) => onFormChange('categoryId', v)}
                />
                {fieldErrors.categoryId ? (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.categoryId}</p>
                ) : null}
              </Box>
              <Box>
                <Label htmlFor="product-store">Tienda <span className="text-red-500">*</span></Label>
                {isSeller ? (
                  <div className='flex h-[50px] items-center rounded-2xl border border-neutral-gray/20 bg-background px-4 text-sm text-neutral-dark'>
                    {stores[0]?.name ?? 'Cargando...'}
                  </div>
                ) : (
                  <>
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
                    {fieldErrors.storeId ? (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.storeId}</p>
                    ) : null}
                  </>
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

            {/* ── Extra fields ───────────────────────────── */}
            <Box className='grid gap-4 md:grid-cols-2'>
              <Box>
                <Label htmlFor='product-brand'>Marca</Label>
                <Input
                  id='product-brand'
                  placeholder='Ej. Nike, Samsung, Colgate…'
                  value={form.brand}
                  onChange={(e) => onFormChange('brand', e.target.value)}
                  disabled={submitting}
                />
              </Box>
              <Box>
                <Label htmlFor='product-unit'>Unidad de medida</Label>
                <Input
                  id='product-unit'
                  placeholder='Ej. kg, litro, par, unidad…'
                  value={form.unit}
                  onChange={(e) => onFormChange('unit', e.target.value)}
                  disabled={submitting}
                />
              </Box>
            </Box>

            <Box>
              <Label htmlFor='product-tags'>Etiquetas</Label>
              <Input
                id='product-tags'
                placeholder='oferta, nuevo, importado  (separa con comas)'
                value={form.tags}
                onChange={(e) => onFormChange('tags', e.target.value)}
                disabled={submitting}
              />
              <p className='mt-1 text-xs text-neutral-dark/40'>Separa cada etiqueta con una coma.</p>
            </Box>

            <Box className='rounded-2xl border border-neutral-gray/20 p-4'>
              <p className='mb-3 text-sm font-semibold text-neutral-dark'>
                Peso y dimensiones
                <span className='ml-1.5 font-normal text-neutral-dark/40'>(opcional)</span>
              </p>
              <Box className='space-y-3'>
                {/* Peso */}
                <Box>
                  <Label htmlFor='product-weight' className='text-xs'>Peso</Label>
                  <Box className='flex items-center gap-2'>
                    <Input
                      id='product-weight'
                      type='number'
                      min='0'
                      step='0.001'
                      placeholder='0.000'
                      value={form.weight}
                      onChange={(e) => onFormChange('weight', e.target.value)}
                      disabled={submitting}
                      className='max-w-[160px]'
                    />
                    <select
                      value={form.weightUnit}
                      onChange={(e) => onFormChange('weightUnit', e.target.value)}
                      disabled={submitting}
                      className='flex-shrink-0 rounded-xl border border-neutral-gray/20 bg-background px-2 py-2.5 text-sm text-neutral-dark focus:border-primary focus:outline-none'
                    >
                      <option value='kg'>kg</option>
                      <option value='g'>g</option>
                      <option value='lb'>lb</option>
                      <option value='oz'>oz</option>
                    </select>
                  </Box>
                </Box>

                {/* Dimensiones */}
                <Box>
                  <Label className='text-xs'>Dimensiones</Label>
                  <Box className='flex items-center gap-1.5'>
                    <Input
                      id='product-width'
                      type='number'
                      min='0'
                      step='0.01'
                      placeholder='Ancho'
                      value={form.width}
                      onChange={(e) => onFormChange('width', e.target.value)}
                      disabled={submitting}
                      className='flex-1'
                      aria-label='Ancho (cm)'
                    />
                    <span className='flex-shrink-0 text-neutral-dark/30'>×</span>
                    <Input
                      id='product-height'
                      type='number'
                      min='0'
                      step='0.01'
                      placeholder='Alto'
                      value={form.height}
                      onChange={(e) => onFormChange('height', e.target.value)}
                      disabled={submitting}
                      className='flex-1'
                      aria-label='Alto (cm)'
                    />
                    <span className='flex-shrink-0 text-neutral-dark/30'>×</span>
                    <Input
                      id='product-depth'
                      type='number'
                      min='0'
                      step='0.01'
                      placeholder='Prof.'
                      value={form.depth}
                      onChange={(e) => onFormChange('depth', e.target.value)}
                      disabled={submitting}
                      className='flex-1'
                      aria-label='Profundidad (cm)'
                    />
                    <select
                      value={form.dimensionsUnit}
                      onChange={(e) => onFormChange('dimensionsUnit', e.target.value)}
                      disabled={submitting}
                      className='flex-shrink-0 rounded-xl border border-neutral-gray/20 bg-background px-2 py-2.5 text-sm text-neutral-dark focus:border-primary focus:outline-none'
                    >
                      <option value='cm'>cm</option>
                      <option value='m'>m</option>
                      <option value='mm'>mm</option>
                      <option value='pulg'>pulg</option>
                      <option value='ft'>ft</option>
                    </select>
                  </Box>
                </Box>
              </Box>
            </Box>

          </form>

          {/* Gallery section */}
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
          ) : (
            /* Create mode: pending gallery (local previews, uploaded after save) */
            <Box className="mt-6 border-t border-neutral-gray/20 pt-6">
              <Typography variant="h3" className="mb-1 text-base font-semibold">
                Fotos adicionales
              </Typography>
              <p className="mb-4 text-xs text-neutral-dark/50">
                Se subirán automáticamente al crear el producto.
              </p>

              <input
                ref={pendingGalleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length > 0) onPendingGalleryAdd(files);
                  e.target.value = '';
                }}
              />

              <div
                className="mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                onClick={() => pendingGalleryInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pendingGalleryInputRef.current?.click(); }}
                aria-label="Agregar fotos adicionales del producto"
              >
                <i className="bx bx-images text-2xl text-slate-400" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-600">
                  Arrastra fotos aquí o{' '}
                  <span className="text-primary underline">haz clic para seleccionar</span>
                </span>
                <span className="text-xs text-slate-400">JPEG · PNG · WebP · múltiples archivos</span>
              </div>

              {pendingGalleryPreviews.length > 0 ? (
                <Box className="grid grid-cols-3 gap-3">
                  {pendingGalleryPreviews.map((url, idx) => (
                    <Box key={idx} className="group relative overflow-hidden rounded-xl border-2 border-neutral-gray/20">
                      <span className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <img src={url} alt={`Foto ${idx + 1}`} className="h-24 w-full object-cover" draggable={false} />
                      <button
                        type="button"
                        onClick={() => onPendingGalleryRemove(idx)}
                        aria-label="Quitar imagen"
                        className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                      >
                        <i className="bx bx-x text-sm" aria-hidden="true" />
                      </button>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography className="text-sm text-neutral-dark/50">
                  Sin fotos adicionales aún.
                </Typography>
              )}
            </Box>
          )}

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
                  if (!videoUrl.trim()) return null;
                  // Instagram: use official embed.js approach for inline playback
                  if (videoUrl.includes('instagram.com')) {
                    const match = videoUrl.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/);
                    if (!match) return null;
                    return (
                      <Box className="mt-3">
                        <InstagramEmbed url={videoUrl} />
                      </Box>
                    );
                  }
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
              <Button
                type="submit"
                variant="secondary"
                disabled={videoSubmitting || !videoUrl.trim()}
              >
                {videoSubmitting ? 'Agregando...' : 'Agregar video'}
              </Button>
            </form>

            {editingId ? (
              /* Edit mode: API-backed video list */
              videos.length > 0 ? (
                <Box className="space-y-3">
                  {videos.map((video) => {
                    const preview = getVideoPreviewFromType(video.videoUrl, video.videoType);
                    return (
                      <Box
                        key={video.id}
                        className={`overflow-hidden rounded-2xl border border-neutral-gray/20 ${preview?.isPortrait && video.videoType !== 'INSTAGRAM' ? 'mx-auto max-w-[320px]' : ''}`}
                      >
                        {video.videoType === 'INSTAGRAM' ? (
                          <div className="p-3">
                            <InstagramEmbed url={video.videoUrl} />
                          </div>
                        ) : preview ? (
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
                                video.videoType === 'YOUTUBE' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {video.videoType === 'YOUTUBE' ? 'YouTube' : 'Instagram'}
                              </span>
                              {video.title ? (
                                <Typography className="truncate text-sm font-medium">{video.title}</Typography>
                              ) : null}
                            </Box>
                            <Typography className="mt-0.5 truncate text-xs text-neutral-dark/50">
                              {video.videoUrl}
                            </Typography>
                          </Box>
                          <Button type="button" variant="danger" onClick={() => void onRemoveVideo(video.id)} disabled={videoSubmitting}>
                            Eliminar
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography className="text-sm text-neutral-dark/50">Sin videos agregados aún.</Typography>
              )
            ) : (
              /* Create mode: pending video list (local, submitted after product is saved) */
              pendingVideos.length > 0 ? (
                <Box className="space-y-2">
                  <p className="text-xs text-neutral-dark/50">Se subirán automáticamente al crear el producto.</p>
                  {pendingVideos.map((pv, idx) => {
                    const isInstagram = pv.videoUrl.includes('instagram.com');
                    return (
                      <Box key={idx} className="flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3">
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${isInstagram ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'}`}>
                          {isInstagram ? 'Instagram' : 'YouTube'}
                        </span>
                        <div className="min-w-0 flex-1">
                          {pv.videoTitle ? (
                            <p className="truncate text-sm font-medium">{pv.videoTitle}</p>
                          ) : null}
                          <p className="truncate text-xs text-neutral-dark/50">{pv.videoUrl}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemovePendingVideo(idx)}
                          className="flex-shrink-0 text-xs font-semibold text-red-500 hover:text-red-700"
                        >
                          Quitar
                        </button>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography className="text-sm text-neutral-dark/50">Sin videos agregados aún.</Typography>
              )
            )}
          </Box>

          {/* ── Variants section ───────────────────────────── */}
          <Box className="mt-6 border-t border-neutral-gray/20 pt-6">
            <Typography variant="h3" className="mb-1 text-base font-semibold">
              Variantes
            </Typography>
            <p className="mb-4 text-xs text-neutral-dark/50">
              Agrega las tallas y colores disponibles — las combinaciones se generan automáticamente.
              {editingId ? ' Haz clic en "Guardar variantes" para aplicar los cambios.' : ' Se guardarán al crear el producto.'}
            </p>

            {variantError ? (
              <Box className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {variantError}
              </Box>
            ) : null}

            <Box className="grid gap-4 sm:grid-cols-2">
              {/* ── Size chips ── */}
              <Box className="rounded-2xl border border-neutral-gray/20 p-4">
                <p className="mb-3 text-sm font-semibold text-neutral-dark">Tallas disponibles</p>
                {variantSizes.length > 0 ? (
                  <Box className="mb-3 flex flex-wrap gap-2">
                    {variantSizes.map((size) => (
                      <span
                        key={size}
                        className="flex items-center gap-1 rounded-full border border-neutral-gray/30 bg-white px-3 py-1 text-sm font-medium text-neutral-dark"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => onRemoveVariantSize(size)}
                          className="ml-0.5 text-neutral-dark/40 hover:text-red-500"
                          aria-label={`Eliminar talla ${size}`}
                        >
                          <i className="bx bx-x text-base leading-none" aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </Box>
                ) : (
                  <p className="mb-3 text-xs text-neutral-dark/40">Sin tallas aún</p>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onAddVariantSize(sizeInput);
                    setSizeInput('');
                  }}
                  className="space-y-2"
                >
                  <Input
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="S, M, L, XL, 38…"
                    className="w-full"
                  />
                  <button
                    type="submit"
                    disabled={!sizeInput.trim()}
                    className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                  >
                    + Agregar talla
                  </button>
                </form>
              </Box>

              {/* ── Color chips ── */}
              <Box className="rounded-2xl border border-neutral-gray/20 p-4">
                <p className="mb-3 text-sm font-semibold text-neutral-dark">Colores disponibles</p>
                {variantColors.length > 0 ? (
                  <Box className="mb-3 flex flex-wrap gap-2">
                    {variantColors.map((c) => (
                      <span
                        key={c.name}
                        className="flex items-center gap-1.5 rounded-full border border-neutral-gray/30 bg-white py-1 pl-2 pr-2 text-sm font-medium text-neutral-dark"
                      >
                        {c.hex ? (
                          <span
                            className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-neutral-gray/30"
                            style={{ background: c.hex }}
                          />
                        ) : null}
                        {c.name}
                        <button
                          type="button"
                          onClick={() => onRemoveVariantColor(c.name)}
                          className="ml-0.5 text-neutral-dark/40 hover:text-red-500"
                          aria-label={`Eliminar color ${c.name}`}
                        >
                          <i className="bx bx-x text-base leading-none" aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </Box>
                ) : (
                  <p className="mb-3 text-xs text-neutral-dark/40">Sin colores aún</p>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onAddVariantColor({ name: colorNameInput, hex: colorHexInput });
                    setColorNameInput('');
                  }}
                  className="space-y-2"
                >
                  <Box className="flex gap-2">
                    <input
                      type="color"
                      value={colorHexInput}
                      onChange={(e) => setColorHexInput(e.target.value)}
                      className="h-[42px] w-10 flex-shrink-0 cursor-pointer rounded-xl border border-neutral-gray/20 bg-white p-0.5"
                      title="Seleccionar color"
                    />
                    <Input
                      value={colorNameInput}
                      onChange={(e) => setColorNameInput(e.target.value)}
                      placeholder="Rojo, Azul marino…"
                      className="flex-1"
                    />
                  </Box>
                  <button
                    type="submit"
                    disabled={!colorNameInput.trim()}
                    className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                  >
                    + Agregar color
                  </button>
                </form>
              </Box>
            </Box>

            {/* ── Combinations table ── */}
            {variantCombinations.length > 0 ? (
              <Box className="mt-4">
                <p className="mb-2 text-sm font-semibold text-neutral-dark">
                  Combinaciones generadas
                  <span className="ml-2 font-normal text-neutral-dark/50">({variantCombinations.length})</span>
                </p>
                <div className="overflow-x-auto rounded-2xl border border-neutral-gray/20">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="bg-neutral-gray/10">
                      <tr>
                        <th className="py-2.5 pl-4 pr-2 text-left text-xs font-semibold text-neutral-dark/60">Variante</th>
                        <th className="px-2 py-2.5 text-left text-xs font-semibold text-neutral-dark/60">SKU</th>
                        <th className="px-2 py-2.5 text-left text-xs font-semibold text-neutral-dark/60">
                          Precio
                          <span className="ml-1 font-normal opacity-60">(vacío = base)</span>
                        </th>
                        <th className="px-2 py-2.5 text-left text-xs font-semibold text-neutral-dark/60">Stock</th>
                        <th className="px-2 py-2.5 pr-4 text-left text-xs font-semibold text-neutral-dark/60">Activa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-gray/10">
                      {variantCombinations.map((combo, idx) => {
                        const colorHex = variantColors.find((c) => c.name === combo.color)?.hex;
                        const label = [combo.size, combo.color].filter(Boolean).join(' · ') || '—';
                        return (
                          <tr key={idx} className="bg-white transition hover:bg-neutral-gray/5">
                            <td className="py-2 pl-4 pr-2">
                              <Box className="flex items-center gap-2">
                                {colorHex ? (
                                  <span
                                    className="h-4 w-4 flex-shrink-0 rounded-full border border-neutral-gray/30"
                                    style={{ background: colorHex }}
                                  />
                                ) : null}
                                <span className="font-medium text-neutral-dark">{label}</span>
                              </Box>
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={combo.sku}
                                onChange={(e) => onUpdateCombination(idx, 'sku', e.target.value)}
                                placeholder="SKU-001"
                                className="w-full rounded-xl border border-neutral-gray/20 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={combo.price}
                                onChange={(e) => onUpdateCombination(idx, 'price', e.target.value)}
                                placeholder="—"
                                className="w-28 rounded-xl border border-neutral-gray/20 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={combo.stock}
                                onChange={(e) => onUpdateCombination(idx, 'stock', e.target.value)}
                                className="w-20 rounded-xl border border-neutral-gray/20 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5 pr-4">
                              <input
                                type="checkbox"
                                checked={combo.isActive}
                                onChange={(e) => onUpdateCombination(idx, 'isActive', e.target.checked)}
                                className="h-4 w-4 accent-primary"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {editingId ? (
                  <Box className="mt-3">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={variantSubmitting}
                      onClick={() => void onSaveVariants()}
                    >
                      {variantSubmitting ? 'Guardando variantes…' : 'Guardar variantes'}
                    </Button>
                  </Box>
                ) : (
                  <p className="mt-2 text-xs text-neutral-dark/50">
                    Las variantes se guardarán al crear el producto.
                  </p>
                )}
              </Box>
            ) : null}
          </Box>

            </div>
            <div className="shrink-0 border-t border-neutral-gray/20 bg-white px-6 py-4">
              {error ? (
                <Box className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </Box>
              ) : null}
              <Box className="flex flex-wrap gap-3">
                <Button type="submit" form="product-form" variant="primary" disabled={submitting || !isFormReady}>
                  {submitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={submitting}>
                  Cancelar
                </Button>
              </Box>
            </div>
          </div>
        </div>,
        document.body
      ) : null}

      <Box>
        <FeaturePanel
          title='Catálogo administrativo'
          subtitle='Filtra por texto o por categoría para encontrar productos rápido.'
          action={
            <Button type="button" variant="primary" onClick={() => setIsFormOpen(true)}>
              + Nuevo producto
            </Button>
          }
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

          <Box className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-neutral-gray/20">
                  <div className="aspect-square skeleton" />
                  <div className="space-y-2 p-3">
                    <div className="skeleton h-4 rounded" />
                    <div className="skeleton h-3 w-2/3 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))
            ) : products.length === 0 ? (
              <Box className="col-span-full rounded-2xl border border-dashed border-neutral-gray/40 bg-background px-6 py-10 text-center">
                <Typography>No hay productos registrados todavía.</Typography>
              </Box>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-neutral-gray/20 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-slate-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <i className="bx bx-image text-4xl text-slate-300" aria-hidden="true" />
                      </div>
                    )}
                    <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400">{product.category?.name ?? 'Sin categoría'}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{formatCurrencyCOP(product.price)}</p>
                    <p className="text-[11px] text-slate-400">SKU: {product.sku}</p>
                    {product.store ? <p className="text-[11px] text-slate-400">{product.store.name}</p> : null}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-slate-100 p-3">
                    <Button
                      type="button"
                      variant="outlinePrimary"
                      onClick={() => onEdit(product)}
                      disabled={submitting}
                      className="flex-1 !py-1.5 text-xs"
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant={product.isActive ? 'danger' : 'secondary'}
                      onClick={() => void onToggleStatus(product)}
                      disabled={submitting}
                      className="flex-1 !py-1.5 text-xs"
                    >
                      {product.isActive ? 'Desact.' : 'Activar'}
                    </Button>
                  </div>
                </div>
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
