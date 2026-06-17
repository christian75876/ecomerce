import { useRef, useState } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct, IProductImage, IProductVideo } from '@/application/dtos/products/response/ProductResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { ProductFormState } from '@/application/useCases/products/useProductsManagement';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface ProductsManagementViewProps {
  products: IProduct[];
  categories: ICategory[];
  stores: IStore[];
  suppliers: ISupplier[];
  menuCategories: IMenuCategory[];
  isSeller: boolean;
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
  onFormChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
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
  onAddCategory: (name: string) => Promise<ICategory | null>;
  onAddSupplier: (name: string, phone?: string, email?: string) => Promise<ISupplier | null>;
}

// ── helpers ───────────────────────────────────────────────────────────────────
const inputCls =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:opacity-50';

const selectCls =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:opacity-50';

// ── SearchCombobox ────────────────────────────────────────────────────────────
const SearchCombobox = ({
  items,
  value,
  onChange,
  onRequestCreate,
  placeholder,
  disabled,
}: {
  items: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  onRequestCreate: (prefill: string) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = items.find(i => i.id === value);
  const filtered = query.trim()
    ? items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : items;
  const exactMatch = filtered.some(
    i => i.name.toLowerCase() === query.toLowerCase().trim()
  );

  return (
    <div className='relative'>
      {selected ? (
        <div className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5'>
          <span className='flex-1 text-sm text-slate-700'>{selected.name}</span>
          <button
            type='button'
            onClick={() => { onChange(''); setQuery(''); }}
            disabled={disabled}
            className='text-slate-400 transition hover:text-red-500 disabled:opacity-50'
          >
            <i className='bx bx-x text-base' />
          </button>
        </div>
      ) : (
        <>
          <div className='relative'>
            <i className='bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400' />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              placeholder={placeholder}
              disabled={disabled}
              className={`${inputCls} pl-9`}
            />
          </div>
          {open && (
            <div className='absolute z-30 mt-1 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
              <div className='max-h-44 overflow-y-auto'>
                {filtered.slice(0, 8).map(item => (
                  <button
                    key={item.id}
                    type='button'
                    onMouseDown={() => { onChange(item.id); setQuery(''); setOpen(false); }}
                    className='flex w-full items-center px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-primary/5'
                  >
                    {item.name}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className='px-4 py-3 text-xs text-slate-400'>
                    Sin resultados{query ? ` para "${query}"` : ''}
                  </p>
                )}
              </div>
              {!exactMatch && (
                <button
                  type='button'
                  onMouseDown={() => {
                    setOpen(false);
                    onRequestCreate(query.trim());
                  }}
                  className='flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5'
                >
                  <i className='bx bx-plus text-base' />
                  {query.trim() ? `Crear "${query.trim()}"` : 'Crear nuevo'}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── CreateModal ───────────────────────────────────────────────────────────────
const CreateModal = ({
  title,
  nameValue,
  onNameChange,
  extraFields,
  onConfirm,
  onCancel,
  creating,
}: {
  title: string;
  nameValue: string;
  onNameChange: (v: string) => void;
  extraFields?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  creating: boolean;
}) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm'>
    <div
      className='w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4'
      onClick={e => e.stopPropagation()}
    >
      <h3 className='text-base font-bold text-slate-800'>{title}</h3>
      <div className='space-y-1.5'>
        <label className='block text-xs font-semibold text-slate-600'>Nombre *</label>
        <input
          value={nameValue}
          onChange={e => onNameChange(e.target.value)}
          className={inputCls}
          placeholder='Nombre'
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onConfirm(); } }}
        />
      </div>
      {extraFields}
      <div className='flex gap-3 pt-1'>
        <button
          type='button'
          onClick={onConfirm}
          disabled={creating || !nameValue.trim()}
          className='flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-50'
        >
          {creating ? (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
          ) : (
            <i className='bx bx-check text-base' />
          )}
          {creating ? 'Creando…' : 'Crear'}
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50'
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
);

const SectionDivider = ({ label, icon }: { label: string; icon: string }) => (
  <div className='flex items-center gap-2 pt-1'>
    <i className={`bx ${icon} text-base text-primary`} />
    <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>{label}</span>
    <div className='flex-1 border-t border-slate-100' />
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className='space-y-1.5'>
    <label className='block text-xs font-semibold text-slate-600'>{label}</label>
    {children}
  </div>
);

const Toggle = ({
  checked,
  onChange,
  label,
  disabled
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) => (
  <label className='flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-primary/30'>
    <div className='relative flex-shrink-0'>
      <input
        type='checkbox'
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className='sr-only'
      />
      <div
        className={`h-5 w-9 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-200'}`}
      />
      <div
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </div>
    <span className='font-medium'>{label}</span>
  </label>
);

export const ProductsManagementView = ({
  products,
  categories,
  stores,
  suppliers,
  menuCategories,
  isSeller,
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
  onAddCategory,
  onAddSupplier,
}: ProductsManagementViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const dragIndexRef = useRef<number | null>(null);

  // Modal state — category
  const [showCatModal, setShowCatModal] = useState(false);
  const [catModalName, setCatModalName] = useState('');
  const [catCreating, setCatCreating] = useState(false);

  // Modal state — supplier
  const [showSupModal, setShowSupModal] = useState(false);
  const [supModalName, setSupModalName] = useState('');
  const [supModalPhone, setSupModalPhone] = useState('');
  const [supModalEmail, setSupModalEmail] = useState('');
  const [supCreating, setSupCreating] = useState(false);

  const handleCreateCategory = async () => {
    if (!catModalName.trim()) return;
    setCatCreating(true);
    const newCat = await onAddCategory(catModalName.trim());
    setCatCreating(false);
    if (newCat) {
      onFormChange('categoryId', newCat.id);
      setShowCatModal(false);
      setCatModalName('');
    }
  };

  const handleCreateSupplier = async () => {
    if (!supModalName.trim()) return;
    setSupCreating(true);
    const newSup = await onAddSupplier(
      supModalName.trim(),
      supModalPhone.trim() || undefined,
      supModalEmail.trim() || undefined,
    );
    setSupCreating(false);
    if (newSup) {
      onFormChange('supplierId', newSup.id);
      setShowSupModal(false);
      setSupModalName('');
      setSupModalPhone('');
      setSupModalEmail('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit();
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddVideo();
  };

  const resolvedImageSrc = imagePreview ?? (form.imageUrl || null);

  return (
    <div className='animate-fade-up space-y-6'>
      {/* Page header */}
      <div>
        <h1 className='text-2xl font-bold text-slate-800 sm:text-3xl'>Productos</h1>
        <p className='mt-1 text-sm text-slate-500'>
          Gestiona el catálogo comercial: SKU, precios, inventario, categorías e imágenes.
        </p>
      </div>

      <div className='grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]'>
        {/* ── Left: Form ── */}
        <div className='space-y-0'>
          {/* Form header card */}
          <div
            className='rounded-t-3xl px-6 py-5 text-white'
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20'>
                <i className={`bx ${editingId ? 'bx-edit' : 'bx-plus'} text-xl`} />
              </div>
              <div className='flex-1'>
                <p className='text-xs font-semibold uppercase tracking-widest text-white/60'>
                  {editingId ? 'Editando producto' : 'Nuevo producto'}
                </p>
                <p className='text-base font-bold leading-tight'>
                  {editingId ? (form.name || 'Sin nombre') : 'Completa los datos del producto'}
                </p>
              </div>
              {editingId ? (
                <button
                  type='button'
                  onClick={onReset}
                  className='rounded-2xl border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition'
                >
                  <i className='bx bx-x mr-1' />
                  Cancelar
                </button>
              ) : null}
            </div>
          </div>

          {/* Form body */}
          <form
            onSubmit={handleSubmit}
            className='rounded-b-3xl border border-t-0 border-slate-200 bg-white p-6 shadow-sm space-y-5'
          >
            {/* Básico */}
            <SectionDivider label='Básico' icon='bx-info-circle' />

            <Field label='Nombre *'>
              <input
                value={form.name}
                onChange={e => onFormChange('name', e.target.value)}
                disabled={submitting}
                placeholder='Nombre del producto'
                className={inputCls}
              />
            </Field>

            <Field label='Descripción'>
              <textarea
                value={form.description}
                onChange={e => onFormChange('description', e.target.value)}
                disabled={submitting}
                rows={3}
                placeholder='Describe el producto para tus clientes…'
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label='SKU (opcional)'>
              <input
                value={form.sku}
                onChange={e => onFormChange('sku', e.target.value)}
                disabled={submitting}
                placeholder='Código único del producto'
                className={inputCls}
              />
            </Field>

            {/* Precios */}
            <SectionDivider label='Precios' icon='bx-money' />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <Field label='Precio *'>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={form.price}
                  onChange={e => onFormChange('price', e.target.value)}
                  disabled={submitting}
                  placeholder='0'
                  className={inputCls}
                />
              </Field>
              <Field label='Precio tachado'>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={form.compareAtPrice}
                  onChange={e => onFormChange('compareAtPrice', e.target.value)}
                  disabled={submitting}
                  placeholder='Precio original'
                  className={inputCls}
                />
              </Field>
              <Field label='Costo'>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={form.cost}
                  onChange={e => onFormChange('cost', e.target.value)}
                  disabled={submitting}
                  placeholder='Costo interno'
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Inventario */}
            <SectionDivider label='Inventario' icon='bx-box' />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Field label='Stock inicial'>
                <input
                  type='number'
                  min='0'
                  step='1'
                  value={form.initialStock}
                  onChange={e => onFormChange('initialStock', e.target.value)}
                  disabled={submitting || Boolean(editingId)}
                  placeholder='0'
                  className={inputCls}
                />
              </Field>
              <Field label='Alerta de stock bajo'>
                <input
                  type='number'
                  min='0'
                  step='1'
                  value={form.lowStockThreshold}
                  onChange={e => onFormChange('lowStockThreshold', e.target.value)}
                  disabled={submitting}
                  placeholder='Ej. 5 unidades'
                  className={inputCls}
                />
              </Field>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <Toggle
                checked={form.showStock}
                onChange={v => onFormChange('showStock', v)}
                label='Mostrar stock en catálogo'
                disabled={submitting}
              />
              <Toggle
                checked={form.isPerishable}
                onChange={v => onFormChange('isPerishable', v)}
                label='Producto perecedero'
                disabled={submitting}
              />

            </div>

            {form.isPerishable ? (
              <Field label='Vencimiento del stock inicial'>
                <input
                  type='date'
                  value={form.initialExpiresAt}
                  onChange={e => onFormChange('initialExpiresAt', e.target.value)}
                  disabled={submitting || Boolean(editingId)}
                  className={inputCls}
                />
              </Field>
            ) : null}

            {/* Clasificación */}
            <SectionDivider label='Clasificación' icon='bx-category' />

            <div className={`grid gap-4 ${isSeller ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              <Field label='Categoría *'>
                <SearchCombobox
                  items={categories}
                  value={form.categoryId}
                  onChange={id => onFormChange('categoryId', id)}
                  onRequestCreate={prefill => { setCatModalName(prefill); setShowCatModal(true); }}
                  placeholder='Buscar o crear categoría…'
                  disabled={submitting}
                />
              </Field>
              {!isSeller ? (
                <Field label='Tienda *'>
                  <select
                    value={form.storeId}
                    onChange={e => {
                      onFormChange('storeId', e.target.value);
                      onFormChange('menuCategoryId', '');
                    }}
                    disabled={submitting}
                    className={selectCls}
                  >
                    <option value=''>Selecciona una tienda</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.storeType === 'RESTAURANT' ? '🍽️ ' : ''}{s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
            </div>

            {menuCategories.length > 0 ? (
              <Field label='🍽️ Sección del menú'>
                <select
                  value={form.menuCategoryId}
                  onChange={e => onFormChange('menuCategoryId', e.target.value)}
                  disabled={submitting}
                  className='w-full rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:opacity-50'
                >
                  <option value=''>Sin sección (aparece en "Otros")</option>
                  {[...menuCategories]
                    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </Field>
            ) : null}

            <Field label='Proveedor (opcional)'>
              <SearchCombobox
                items={suppliers}
                value={form.supplierId}
                onChange={id => onFormChange('supplierId', id)}
                onRequestCreate={prefill => { setSupModalName(prefill); setShowSupModal(true); }}
                placeholder='Buscar o crear proveedor…'
                disabled={submitting}
              />
            </Field>

            {/* Imagen principal */}
            <SectionDivider label='Imagen principal' icon='bx-image' />

            <div className='space-y-3'>
              {resolvedImageSrc ? (
                <div className='relative overflow-hidden rounded-2xl border border-slate-200'>
                  <img src={resolvedImageSrc} alt='Vista previa' className='h-40 w-full object-cover' />
                  <button
                    type='button'
                    onClick={() => {
                      onImageFileChange(null);
                      onFormChange('imageUrl', '');
                    }}
                    className='absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70'
                  >
                    <i className='bx bx-x text-sm' />
                  </button>
                </div>
              ) : null}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp'
                onChange={e => onImageFileChange(e.target.files?.[0] ?? null)}
                disabled={submitting}
                className='hidden'
              />
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className='flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-4 text-sm font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary disabled:opacity-50'
              >
                <i className='bx bx-image-add text-lg' />
                {resolvedImageSrc ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
              <div className='relative'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400'>URL</span>
                <input
                  value={form.imageUrl}
                  onChange={e => onFormChange('imageUrl', e.target.value)}
                  placeholder='https://...'
                  disabled={submitting}
                  className='w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:opacity-50'
                />
              </div>
            </div>

            {error ? (
              <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </div>
            ) : null}

            <button
              type='submit'
              disabled={submitting}
              className='flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50'
            >
              {submitting ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              ) : (
                <i className='bx bx-save text-base' />
              )}
              {submitting ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </form>

          {/* Gallery — only when editing */}
          {editingId ? (
            <div className='mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4'>
              <h2 className='flex items-center gap-2 text-base font-semibold text-slate-800'>
                <i className='bx bx-images text-xl text-primary' />
                Galería de imágenes
              </h2>

              {galleryError ? (
                <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                  {galleryError}
                </div>
              ) : null}

              <input
                ref={galleryInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp'
                multiple
                className='hidden'
                onChange={async e => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length > 0) {
                    await onGalleryImageUpload(files);
                    e.target.value = '';
                  }
                }}
              />

              <div
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
                  dropZoneActive ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50 hover:border-primary/40'
                }`}
                onClick={() => galleryInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDropZoneActive(true); }}
                onDragLeave={() => setDropZoneActive(false)}
                onDrop={async e => {
                  e.preventDefault();
                  setDropZoneActive(false);
                  const files = Array.from(e.dataTransfer.files).filter(f =>
                    ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
                  );
                  if (files.length > 0) await onGalleryImageUpload(files);
                }}
                role='button'
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') galleryInputRef.current?.click(); }}
                aria-label='Subir imágenes a la galería'
              >
                {gallerySubmitting ? (
                  <>
                    <i className='bx bx-loader-alt animate-spin text-2xl text-primary' />
                    <span className='text-sm font-medium text-primary'>Subiendo imágenes…</span>
                  </>
                ) : (
                  <>
                    <i className='bx bx-cloud-upload text-2xl text-slate-400' />
                    <span className='text-sm font-medium text-slate-600'>
                      Arrastra fotos aquí o <span className='text-primary underline'>haz clic</span>
                    </span>
                    <span className='text-xs text-slate-400'>JPEG · PNG · WebP · múltiples archivos</span>
                  </>
                )}
              </div>

              {gallery.length > 0 ? (
                <div className='grid grid-cols-3 gap-3'>
                  {gallery.length > 1 ? (
                    <p className='col-span-3 text-xs text-slate-400'>
                      <i className='bx bx-move mr-1' />
                      Arrastra para reordenar
                    </p>
                  ) : null}
                  {gallery.map((img, index) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => { dragIndexRef.current = index; }}
                      onDragOver={e => { e.preventDefault(); setDragOverIndex(index); }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={e => {
                        e.preventDefault();
                        const from = dragIndexRef.current;
                        if (from === null || from === index) { setDragOverIndex(null); return; }
                        const newOrder = [...gallery];
                        const [moved] = newOrder.splice(from, 1);
                        newOrder.splice(index, 0, moved);
                        setDragOverIndex(null);
                        dragIndexRef.current = null;
                        void onGalleryImageReorder(newOrder.map(i => i.id));
                      }}
                      onDragEnd={() => { dragIndexRef.current = null; setDragOverIndex(null); }}
                      className={`group relative cursor-grab overflow-hidden rounded-2xl border-2 transition-all active:cursor-grabbing ${
                        dragOverIndex === index ? 'scale-105 border-primary shadow-md' : 'border-slate-200 hover:border-primary/40'
                      }`}
                    >
                      <span className='absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] font-bold text-white'>
                        {index + 1}
                      </span>
                      <img src={img.imageUrl} alt={`Galería ${index + 1}`} className='h-24 w-full object-cover' draggable={false} />
                      <button
                        type='button'
                        onClick={e => { e.stopPropagation(); void onGalleryImageRemove(img.id); }}
                        disabled={gallerySubmitting}
                        className='absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100 disabled:opacity-40'
                      >
                        <i className='bx bx-x text-sm' />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-slate-400'>Sin imágenes adicionales en la galería.</p>
              )}
            </div>
          ) : null}

          {/* Videos — only when editing */}
          {editingId ? (
            <div className='mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4'>
              <h2 className='flex items-center gap-2 text-base font-semibold text-slate-800'>
                <i className='bx bx-video text-xl text-primary' />
                Videos del producto
              </h2>

              <form onSubmit={handleAddVideo} className='space-y-3'>
                <Field label='URL de YouTube, Instagram o Facebook'>
                  <input
                    value={videoUrl}
                    onChange={e => onVideoUrlChange(e.target.value)}
                    placeholder='https://youtube.com/watch?v=...'
                    disabled={videoSubmitting}
                    className={inputCls}
                  />
                </Field>
                <Field label='Título opcional'>
                  <input
                    value={videoTitle}
                    onChange={e => onVideoTitleChange(e.target.value)}
                    placeholder='Ej: Video de demostración'
                    disabled={videoSubmitting}
                    className={inputCls}
                  />
                </Field>
                {videoError ? (
                  <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{videoError}</div>
                ) : null}
                <button
                  type='submit'
                  disabled={videoSubmitting || !videoUrl.trim()}
                  className='flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50'
                >
                  <i className='bx bx-plus text-base' />
                  {videoSubmitting ? 'Agregando…' : 'Agregar video'}
                </button>
              </form>

              {videos.length > 0 ? (
                <div className='space-y-2'>
                  {videos.map(video => (
                    <div
                      key={video.id}
                      className='flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3'
                    >
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          video.videoType === 'YOUTUBE' ? 'bg-red-100 text-red-700' :
                          video.videoType === 'FACEBOOK' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {video.videoType === 'YOUTUBE' ? 'YouTube' : video.videoType === 'FACEBOOK' ? 'Facebook' : 'Instagram'}
                      </span>
                      <div className='min-w-0 flex-1'>
                        {video.title ? (
                          <p className='truncate text-sm font-medium text-slate-700'>{video.title}</p>
                        ) : null}
                        <p className='truncate text-xs text-slate-400'>{video.videoUrl}</p>
                      </div>
                      <button
                        type='button'
                        onClick={() => void onRemoveVideo(video.id)}
                        disabled={videoSubmitting}
                        className='flex-shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50'
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-slate-400'>Sin videos agregados aún.</p>
              )}
            </div>
          ) : null}
        </div>

        {/* ── Right: Catalog ── */}
        <div className='space-y-4'>
          {/* Search + filter */}
          <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h2 className='text-base font-semibold text-slate-800'>Catálogo</h2>
                <p className='text-xs text-slate-400'>
                  {loading ? 'Cargando…' : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]'>
              <div className='relative'>
                <i className='bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400' />
                <input
                  value={search}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder='Buscar por nombre…'
                  className='w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
                />
              </div>
              <select
                value={selectedCategoryId}
                onChange={e => onCategoryFilterChange(e.target.value)}
                className={selectCls}
              >
                <option value=''>Todas las categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product list */}
          <div className='space-y-3'>
            {loading ? (
              <div className='flex items-center justify-center py-16'>
                <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              </div>
            ) : products.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-slate-400'>
                <i className='bx bx-shopping-bag text-4xl mb-3' />
                <p className='font-semibold'>No hay productos registrados todavía</p>
                <p className='mt-1 text-sm'>Crea tu primer producto con el formulario</p>
              </div>
            ) : (
              products.map(product => (
                <div
                  key={product.id}
                  className='flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/20 hover:shadow-md'
                >
                  {/* Image */}
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className='h-16 w-16 flex-shrink-0 rounded-2xl object-cover'
                    />
                  ) : (
                    <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl'>
                      📦
                    </div>
                  )}

                  {/* Info */}
                  <div className='min-w-0 flex-1 space-y-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='text-sm font-bold text-slate-800'>{product.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      {product.isPerishable ? (
                        <span className='rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700'>
                          Perecedero
                        </span>
                      ) : null}
                      {product.trackBatches ? (
                        <span className='rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700'>
                          Por lotes
                        </span>
                      ) : null}
                    </div>

                    <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500'>
                      {product.sku ? <span>SKU: <span className='font-mono font-semibold text-slate-700'>{product.sku}</span></span> : null}
                      <span>{product.category.name}</span>
                      <span>{product.store?.name ?? 'Sin tienda'}</span>
                      {product.menuCategory ? <span>Sección: {product.menuCategory.name}</span> : null}
                      {product.supplier ? <span>Prov: {product.supplier.name}</span> : null}
                    </div>

                    <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs'>
                      <span className='font-bold text-primary'>{formatCurrencyCOP(product.price)}</span>
                      {product.cost ? (
                        <span className='text-slate-400'>Costo: {formatCurrencyCOP(product.cost)}</span>
                      ) : null}
                    </div>

                    {product.description ? (
                      <p className='line-clamp-1 text-xs text-slate-400'>{product.description}</p>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className='flex flex-shrink-0 flex-col gap-2'>
                    <button
                      type='button'
                      onClick={() => onEdit(product)}
                      disabled={submitting}
                      className='flex items-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50'
                    >
                      <i className='bx bx-edit text-sm' />
                      Editar
                    </button>
                    <button
                      type='button'
                      onClick={() => void onToggleStatus(product)}
                      disabled={submitting}
                      className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                        product.isActive
                          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <i className={`bx ${product.isActive ? 'bx-hide' : 'bx-show'} text-sm`} />
                      {product.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category creation modal */}
      {showCatModal && (
        <CreateModal
          title='Nueva categoría'
          nameValue={catModalName}
          onNameChange={setCatModalName}
          onConfirm={handleCreateCategory}
          onCancel={() => { setShowCatModal(false); setCatModalName(''); }}
          creating={catCreating}
        />
      )}

      {/* Supplier creation modal */}
      {showSupModal && (
        <CreateModal
          title='Nuevo proveedor'
          nameValue={supModalName}
          onNameChange={setSupModalName}
          onConfirm={handleCreateSupplier}
          onCancel={() => { setShowSupModal(false); setSupModalName(''); setSupModalPhone(''); setSupModalEmail(''); }}
          creating={supCreating}
          extraFields={
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <label className='block text-xs font-semibold text-slate-600'>Teléfono (opcional)</label>
                <input
                  value={supModalPhone}
                  onChange={e => setSupModalPhone(e.target.value)}
                  className={inputCls}
                  placeholder='3001234567'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='block text-xs font-semibold text-slate-600'>Email (opcional)</label>
                <input
                  type='email'
                  value={supModalEmail}
                  onChange={e => setSupModalEmail(e.target.value)}
                  className={inputCls}
                  placeholder='proveedor@email.com'
                />
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};
