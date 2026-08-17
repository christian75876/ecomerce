import { useState, useEffect, useRef } from 'react';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { createPortal } from 'react-dom';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { StoreFormState } from '@/application/useCases/stores/useStoresManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import ColorPicker from '@/presentation/ui/atoms/color-picker/ColorPicker';
import { useMenuCategories } from '@/application/useCases/menu-categories/useMenuCategories';
import MenuCategoriesManager from '@/presentation/ui/organisms/menu-categories/MenuCategoriesManager';
import { ADMIN_WHATSAPP } from '@/shared/config/appContact';
import MapAddressPicker, { MapAddress } from '@/presentation/ui/molecules/common/MapAddressPicker';

interface StoresManagementViewProps {
  stores: IStore[];
  form: StoreFormState;
  editingId: string | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  isSeller?: boolean;
  isDirty?: boolean;
  onFormChange: <K extends keyof StoreFormState>(key: K, value: StoreFormState[K]) => void;
  onSubmit: () => Promise<boolean>;
  onEdit: (store: IStore) => void;
  onReset: () => void;
  onToggleActive?: (store: IStore) => void;
  onDelete?: (store: IStore) => Promise<boolean>;
}

type BrandingTab = 'info' | 'colors' | 'style' | 'delivery' | 'location';

const THEME_PRESETS: Array<{
  label: string;
  emoji: string;
  values: Partial<StoreFormState>;
}> = [
  {
    label: 'Moderno',
    emoji: '🔷',
    values: {
      primaryColor: '#6366f1',
      secondaryColor: '#a5b4fc',
      accentColor: '#f59e0b',
      bgColor: '#f8fafc',
      textColor: '#1e293b',
      fontStyle: 'MODERN',
      buttonStyle: 'ROUNDED',
      coverStyle: 'GRADIENT',
    },
  },
  {
    label: 'Elegante',
    emoji: '🖤',
    values: {
      primaryColor: '#18181b',
      secondaryColor: '#3f3f46',
      accentColor: '#d4af37',
      bgColor: '#fafafa',
      textColor: '#18181b',
      fontStyle: 'CLASSIC',
      buttonStyle: 'SHARP',
      coverStyle: 'SOLID',
    },
  },
  {
    label: 'Vibrante',
    emoji: '🌈',
    values: {
      primaryColor: '#ec4899',
      secondaryColor: '#a855f7',
      accentColor: '#f97316',
      bgColor: '#fff1f2',
      textColor: '#1e293b',
      fontStyle: 'PLAYFUL',
      buttonStyle: 'PILL',
      coverStyle: 'GRADIENT',
    },
  },
  {
    label: 'Natural',
    emoji: '🌿',
    values: {
      primaryColor: '#16a34a',
      secondaryColor: '#86efac',
      accentColor: '#ca8a04',
      bgColor: '#f0fdf4',
      textColor: '#14532d',
      fontStyle: 'MODERN',
      buttonStyle: 'ROUNDED',
      coverStyle: 'GRADIENT',
    },
  },
  {
    label: 'Océano',
    emoji: '🌊',
    values: {
      primaryColor: '#0284c7',
      secondaryColor: '#7dd3fc',
      accentColor: '#06b6d4',
      bgColor: '#f0f9ff',
      textColor: '#0c4a6e',
      fontStyle: 'MODERN',
      buttonStyle: 'PILL',
      coverStyle: 'GRADIENT',
    },
  },
  {
    label: 'Mínimal',
    emoji: '⬜',
    values: {
      primaryColor: '#334155',
      secondaryColor: '#94a3b8',
      accentColor: '#334155',
      bgColor: '#ffffff',
      textColor: '#0f172a',
      fontStyle: 'MODERN',
      buttonStyle: 'SHARP',
      coverStyle: 'MINIMAL',
    },
  },
];

const ConfirmToggleModal = ({
  store,
  onConfirm,
  onCancel,
}: {
  store: IStore;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const deactivating = store.isActive;
  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm'
      onClick={onCancel}
    >
      <div
        className='w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${deactivating ? 'bg-red-100' : 'bg-emerald-100'}`}>
          <i className={`bx text-2xl ${deactivating ? 'bx-power-off text-red-500' : 'bx-check-circle text-emerald-600'}`} aria-hidden='true' />
        </div>
        <h2 className='text-lg font-bold text-slate-800'>
          {deactivating ? 'Desactivar tienda' : 'Activar tienda'}
        </h2>
        <p className='mt-2 text-sm text-slate-500'>
          {deactivating
            ? <>La tienda <span className='font-semibold text-slate-700'>"{store.name}"</span> dejará de ser visible en Merku inmediatamente.</>
            : <>La tienda <span className='font-semibold text-slate-700'>"{store.name}"</span> volverá a ser visible en Merku.</>}
        </p>
        <div className='mt-6 flex flex-col gap-2'>
          <button
            type='button'
            onClick={onConfirm}
            className={`w-full rounded-2xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 ${deactivating ? 'bg-red-500' : 'bg-emerald-500'}`}
          >
            {deactivating ? 'Sí, desactivar' : 'Sí, activar'}
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const ConfirmDeleteModal = ({
  store,
  error,
  submitting,
  onConfirm,
  onCancel,
}: {
  store: IStore;
  error: string | null;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const [understood, setUnderstood] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const canDelete = understood && confirmText.trim() === store.name.trim();

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm'
      onClick={onCancel}
    >
      <div
        className='w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100'>
          <i className='bx bx-trash text-2xl text-red-500' aria-hidden='true' />
        </div>
        <h2 className='text-lg font-bold text-slate-800'>Eliminar tienda definitivamente</h2>
        <p className='mt-2 text-sm text-slate-500'>
          Esto borra <span className='font-semibold text-slate-700'>"{store.name}"</span>, sus productos,
          categorías de menú, reseñas e historial de inventario. No se puede deshacer.
          {' '}Si la tienda ya tiene pedidos, no se podrá eliminar — desactívala en su lugar.
        </p>

        <label className='mt-4 flex items-start gap-2 text-sm text-slate-600'>
          <input
            type='checkbox'
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className='mt-0.5 h-4 w-4 flex-shrink-0'
          />
          Entiendo que esta acción es permanente y no se puede deshacer.
        </label>

        <div className='mt-3'>
          <Label htmlFor='confirm-delete-store-name'>
            Escribe <span className='font-semibold'>{store.name}</span> para confirmar
          </Label>
          <input
            id='confirm-delete-store-name'
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={store.name}
            className='mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
          />
        </div>

        {error ? (
          <p className='mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600'>{error}</p>
        ) : null}

        <div className='mt-6 flex flex-col gap-2'>
          <button
            type='button'
            onClick={onConfirm}
            disabled={!canDelete || submitting}
            className='w-full rounded-2xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40'
          >
            {submitting ? 'Eliminando…' : 'Eliminar definitivamente'}
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const buttonRadiusClass = (style: StoreFormState['buttonStyle']) => {
  if (style === 'SHARP') return 'rounded-none';
  if (style === 'PILL') return 'rounded-full';
  return 'rounded-xl';
};

const fontClass = (style: StoreFormState['fontStyle']) => {
  if (style === 'CLASSIC') return 'font-serif';
  if (style === 'PLAYFUL') return 'tracking-wide';
  return 'font-sans';
};

const ImagePickerInput = ({
  id,
  label,
  value,
  onChange,
  disabled,
  storeId,
  variant = 'logo',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  storeId: string | null;
  variant?: 'logo' | 'banner';
}) => {
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImgError(false);
    setLocalPreview(null);
    onChange(e.target.value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storeId) return;
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = () => setLocalPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const res = variant === 'logo'
        ? await StoresRepository.uploadLogo(storeId, file)
        : await StoresRepository.uploadBanner(storeId, file);
      const url = (res as unknown as { data?: { logoUrl?: string; bannerUrl?: string } }).data;
      const newUrl = variant === 'logo' ? url?.logoUrl : url?.bannerUrl;
      if (newUrl) { onChange(newUrl); setLocalPreview(null); }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir imagen');
      setLocalPreview(null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const preview = localPreview || (value && !imgError ? value : null);

  return (
    <div className='space-y-2'>
      <label htmlFor={id} className='block text-sm font-medium text-neutral-dark/70'>{label}</label>

      <div className='flex gap-2'>
        <input
          id={id}
          type='text'
          value={value}
          onChange={handleUrlChange}
          disabled={disabled || uploading}
          placeholder='https://... o sube un archivo →'
          className='min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50'
        />
        <button
          type='button'
          disabled={disabled || uploading || !storeId}
          onClick={() => fileRef.current?.click()}
          title={!storeId ? 'Guarda la tienda primero' : 'Subir imagen desde tu dispositivo'}
          className='flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-neutral-dark/70 transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40'
        >
          {uploading
            ? <i className='bx bx-loader-alt animate-spin text-base' />
            : <i className='bx bx-upload text-base' />}
          {uploading ? 'Subiendo...' : 'Subir'}
        </button>
        <input
          ref={fileRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          className='hidden'
          onChange={(e) => void handleFileChange(e)}
        />
      </div>

      {uploadError ? (
        <div className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500'>
          <i className='bx bx-error-circle text-base' /> {uploadError}
        </div>
      ) : null}

      {preview ? (
        variant === 'banner' ? (
          <div className='relative overflow-hidden rounded-xl border border-neutral-gray/20 shadow-sm' style={{ aspectRatio: '4/1' }}>
            {uploading ? <div className='absolute inset-0 flex items-center justify-center bg-white/70'><i className='bx bx-loader-alt animate-spin text-2xl text-primary' /></div> : null}
            <img src={preview} alt={label} onError={() => setImgError(true)} className='h-full w-full object-cover' />
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-gray/20 shadow-sm'>
              {uploading ? <div className='absolute inset-0 flex items-center justify-center bg-white/70'><i className='bx bx-loader-alt animate-spin text-lg text-primary' /></div> : null}
              <img src={preview} alt={label} onError={() => setImgError(true)} className='h-full w-full object-cover' />
            </div>
            <p className='text-xs text-neutral-dark/45'>Vista previa</p>
          </div>
        )
      ) : value && imgError ? (
        <div className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500'>
          <i className='bx bx-error-circle text-base' /> No se pudo cargar la imagen — verifica la URL
        </div>
      ) : null}
    </div>
  );
};

const SubscriptionInfo = ({ expiresAt }: { expiresAt: string }) => {
  const hasExpiry = Boolean(expiresAt);
  const expired = hasExpiry && new Date(expiresAt) < new Date();
  const daysLeft = hasExpiry
    ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
    : null;

  const statusColor = expired
    ? 'border-red-200 bg-red-50/60'
    : hasExpiry && daysLeft! <= 7
      ? 'border-orange-200 bg-orange-50/60'
      : 'border-blue-200 bg-blue-50/40';

  const wppMsg = encodeURIComponent(
    expired
      ? '¡Hola! Mi suscripción en Merku expiró. Quisiera renovarla.'
      : hasExpiry
        ? `¡Hola! Quisiera renovar mi suscripción en Merku antes de que venza el ${new Date(expiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' })}.`
        : '¡Hola! Quisiera consultar los planes de suscripción de Merku.',
  );

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${statusColor}`}>
      <div className='flex items-center gap-2'>
        <i className='bx bx-credit-card text-base text-blue-500' aria-hidden='true' />
        <p className='text-xs font-semibold uppercase tracking-wide text-blue-600'>Suscripción mensual</p>
      </div>

      {expired ? (
        <div className='flex items-center gap-2 rounded-xl bg-red-100 px-3 py-2'>
          <i className='bx bx-error-circle text-lg text-red-500' aria-hidden='true' />
          <div>
            <p className='text-sm font-semibold text-red-700'>Suscripción expirada</p>
            <p className='text-xs text-red-500'>
              Venció el {new Date(expiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' })}. Tu tienda está oculta en Merku.
            </p>
          </div>
        </div>
      ) : hasExpiry && daysLeft! <= 7 ? (
        <div className='flex items-center gap-2 rounded-xl bg-orange-100 px-3 py-2'>
          <i className='bx bx-time text-lg text-orange-500' aria-hidden='true' />
          <div>
            <p className='text-sm font-semibold text-orange-700'>Vence pronto — {daysLeft} día{daysLeft === 1 ? '' : 's'}</p>
            <p className='text-xs text-orange-500'>
              Tu suscripción expira el {new Date(expiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' })}.
            </p>
          </div>
        </div>
      ) : hasExpiry ? (
        <div className='flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2'>
          <i className='bx bx-check-circle text-lg text-green-500' aria-hidden='true' />
          <div>
            <p className='text-sm font-semibold text-green-700'>Activa hasta el {new Date(expiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' })}</p>
            <p className='text-xs text-green-600'>Quedan {daysLeft} días de suscripción.</p>
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2'>
          <i className='bx bx-infinite text-lg text-blue-500' aria-hidden='true' />
          <div>
            <p className='text-sm font-semibold text-blue-700'>Sin vencimiento</p>
            <p className='text-xs text-blue-500'>Tu tienda está visible indefinidamente en Merku.</p>
          </div>
        </div>
      )}

      <div className='border-t border-slate-200/60 pt-3'>
        <p className='mb-2 text-xs text-slate-500'>
          Para renovar o contratar un plan, contáctanos directamente por WhatsApp.
        </p>
        <a
          href={`https://wa.me/${ADMIN_WHATSAPP}?text=${wppMsg}`}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95'
        >
          <i className='bx bxl-whatsapp text-base' aria-hidden='true' />
          Renovar / contratar plan
        </a>
      </div>
    </div>
  );
};

const StorePreview = ({ form, wide = false }: { form: StoreFormState; wide?: boolean }) => {
  const [logoError, setLogoError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  useEffect(() => { setLogoError(false); }, [form.logoUrl]);
  useEffect(() => { setBannerError(false); }, [form.bannerUrl]);

  const primary = form.primaryColor || '#6366f1';
  const secondary = form.secondaryColor || '#a5b4fc';
  const accent = form.accentColor || '#f59e0b';
  const bg = form.bgColor || '#ffffff';
  const text = form.textColor || '#1e293b';
  const btnRadius = buttonRadiusClass(form.buttonStyle);
  const font = fontClass(form.fontStyle);

  const hasBanner = Boolean(form.bannerUrl) && !bannerError;
  const hasLogo = Boolean(form.logoUrl) && !logoError;

  const coverBg =
    form.coverStyle === 'SOLID'
      ? primary
      : form.coverStyle === 'MINIMAL'
        ? '#f8fafc'
        : `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;

  const coverTextColor = form.coverStyle === 'MINIMAL' ? text : '#ffffff';
  const coverMinHeight = wide ? 180 : 88;
  const logoSize = wide ? 'h-16 w-16' : 'h-11 w-11';
  const logoText = wide ? 'text-2xl' : 'text-lg';
  const storeName = wide ? 'text-xl font-bold' : 'text-sm font-bold';
  const storeDesc = wide ? 'text-xs opacity-75' : 'text-[10px] opacity-75';
  const productCols = wide
    ? (form.layoutStyle === 'LIST' ? 'flex flex-col gap-3' : 'grid grid-cols-3 gap-3')
    : (form.layoutStyle === 'LIST' ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2');
  const productCount = wide ? [1, 2, 3] : [1, 2];
  const productImgHeight = wide ? 'h-24' : 'h-16';

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-neutral-gray/20 shadow-lg ${font}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {/* Cover */}
      <div className='relative overflow-hidden' style={{ minHeight: coverMinHeight }}>
        {hasBanner ? (
          <>
            <img
              src={form.bannerUrl}
              alt=''
              onError={() => setBannerError(true)}
              className='absolute inset-0 h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-black/40' />
          </>
        ) : (
          <div className='absolute inset-0' style={{ background: coverBg }} />
        )}

        <div
          className={`relative z-10 flex items-end gap-4 px-6 ${wide ? 'pb-5 pt-10' : 'py-5 px-5'}`}
          style={{ color: hasBanner ? '#ffffff' : coverTextColor }}
        >
          {hasLogo ? (
            <img
              src={form.logoUrl}
              alt=''
              onError={() => setLogoError(true)}
              className={`${logoSize} flex-shrink-0 rounded-xl border-2 border-white/30 object-cover shadow-md`}
            />
          ) : (
            <div
              className={`${logoSize} flex flex-shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-md ${logoText}`}
              style={{ backgroundColor: accent }}
            >
              {(form.name || 'T').charAt(0).toUpperCase()}
            </div>
          )}
          <div className='min-w-0 pb-1'>
            <p className={`truncate ${storeName}`}>{form.name || 'Nombre de tu tienda'}</p>
            <p className={`truncate ${storeDesc}`}>
              {form.description ? form.description.slice(0, wide ? 80 : 50) : 'Descripción breve'}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={wide ? 'p-5' : 'p-4'} style={{ backgroundColor: bg }}>
        <div className={productCols}>
          {productCount.map((i) => (
            <div
              key={i}
              className='overflow-hidden rounded-xl border border-neutral-gray/15'
              style={{ backgroundColor: '#fff' }}
            >
              <div className={`${productImgHeight} w-full`} style={{ backgroundColor: `${primary}15` }} />
              <div className='p-2'>
                <div className='h-2.5 w-3/4 rounded bg-neutral-200' />
                <div className='mt-1.5 flex items-center justify-between'>
                  <div className='h-2 w-12 rounded' style={{ backgroundColor: primary }} />
                  <div
                    className={`px-2 py-0.5 text-xs font-bold text-white ${btnRadius}`}
                    style={{ backgroundColor: primary, fontSize: 9 }}
                  >
                    + Agregar
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`mt-3 py-2 text-center text-xs font-bold text-white ${btnRadius}`}
          style={{ backgroundColor: primary }}
        >
          Ver todos los productos
        </div>
      </div>
    </div>
  );
};

export const StoresManagementView = ({
  stores,
  form,
  editingId,
  loading,
  submitting,
  error,
  isSeller = false,
  isDirty = false,
  onFormChange,
  onSubmit,
  onEdit,
  onReset,
  onToggleActive,
  onDelete,
}: StoresManagementViewProps) => {
  const [activeTab, setActiveTab] = useState<BrandingTab>('info');
  const [confirmStore, setConfirmStore] = useState<IStore | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IStore | null>(null);
  const menuCats = useMenuCategories(
    editingId && form.storeType === 'RESTAURANT' ? editingId : null,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    Object.entries(preset.values).forEach(([key, val]) => {
      onFormChange(key as keyof StoreFormState, val as never);
    });
  };

  const tabs: Array<{ id: BrandingTab; label: string; icon: string }> = [
    { id: 'info', label: 'Información', icon: 'bx-store' },
    { id: 'colors', label: 'Colores', icon: 'bx-palette' },
    { id: 'style', label: 'Estilo', icon: 'bxs-magic-wand' },
    { id: 'delivery', label: 'Entrega', icon: 'bx-package' },
    { id: 'location', label: 'Ubicación', icon: 'bx-map-pin' },
  ];

  return (
    <Box className='space-y-6'>
      <Box>
        <Typography variant='h1' className='text-3xl font-bold'>
          {isSeller ? 'Mi tienda' : 'Tiendas'}
        </Typography>
        <Typography className='mt-2 text-neutral-dark/70'>
          {isSeller
            ? 'Configura el branding de tu tienda — colores, tipografía, layout y más.'
            : 'Configura el branding completo de cada tienda — colores, tipografía, layout y más.'}
        </Typography>
      </Box>

      <Box className={`grid gap-6 ${isSeller ? 'grid-cols-1' : 'xl:grid-cols-[1fr_340px]'}`}>
        {/* ── Editor ── */}
        <Box className={`rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm ${isSeller ? 'order-2' : 'order-1'}`}>
          <Typography variant='h2' className='text-xl font-semibold'>
            {editingId ? 'Editar tienda' : isSeller ? 'Mi tienda' : 'Nueva tienda'}
          </Typography>

          {/* Presets */}
          <Box className='mt-4'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-dark/50'>
              Presets de tema
            </p>
            <div className='flex flex-wrap gap-2'>
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type='button'
                  onClick={() => applyPreset(preset)}
                  className='flex items-center gap-1.5 rounded-full border border-neutral-gray/30 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-dark/70 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-95'
                >
                  <span>{preset.emoji}</span>
                  {preset.label}
                </button>
              ))}
            </div>
          </Box>

          {/* Tabs */}
          <Box className='mt-5 flex gap-1 rounded-2xl border border-neutral-gray/20 bg-neutral-50 p-1'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-neutral-dark/50 hover:text-neutral-dark/70'
                }`}
              >
                <i className={`bx ${tab.icon} text-sm`} aria-hidden='true' />
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            ))}
          </Box>

          <form onSubmit={handleSubmit} className='mt-5 space-y-4'>
            {/* ── Tab: Información ── */}
            {activeTab === 'info' ? (
              <Box className='space-y-4'>
                <Box className='grid gap-4 sm:grid-cols-2'>
                  <Box>
                    <Label htmlFor='store-name'>Nombre *</Label>
                    <Input
                      id='store-name'
                      value={form.name}
                      onChange={(e) => onFormChange('name', e.target.value)}
                      disabled={submitting}
                      placeholder='Mi Tienda'
                    />
                  </Box>
                  <Box>
                    <Label htmlFor='store-slug'>Slug (URL) *</Label>
                    <Input
                      id='store-slug'
                      value={form.slug}
                      onChange={(e) => onFormChange('slug', e.target.value)}
                      disabled={submitting}
                      placeholder='mi-tienda'
                    />
                  </Box>
                </Box>

                <Box>
                  <Label htmlFor='store-description'>Descripción</Label>
                  <textarea
                    id='store-description'
                    value={form.description}
                    onChange={(e) => onFormChange('description', e.target.value)}
                    disabled={submitting}
                    rows={3}
                    placeholder='Describe tu tienda brevemente...'
                    className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </Box>

                <Box>
                  <ImagePickerInput
                    id='store-logo'
                    label='Logo'
                    value={form.logoUrl}
                    onChange={(v) => onFormChange('logoUrl', v)}
                    disabled={submitting}
                    storeId={editingId}
                    variant='logo'
                  />
                </Box>

                <Box>
                  <ImagePickerInput
                    id='store-banner'
                    label='Banner'
                    value={form.bannerUrl}
                    onChange={(v) => onFormChange('bannerUrl', v)}
                    disabled={submitting}
                    storeId={editingId}
                    variant='banner'
                  />
                </Box>

                <Box className='grid gap-4 sm:grid-cols-3'>
                  <Box>
                    <Label htmlFor='store-phone'>Teléfono</Label>
                    <Input
                      id='store-phone'
                      value={form.phone}
                      onChange={(e) => onFormChange('phone', e.target.value)}
                      disabled={submitting}
                    />
                  </Box>
                  <Box>
                    <Label htmlFor='store-whatsapp'>WhatsApp</Label>
                    <Input
                      id='store-whatsapp'
                      value={form.whatsappNumber}
                      onChange={(e) => onFormChange('whatsappNumber', e.target.value)}
                      disabled={submitting}
                      placeholder='573001234567'
                    />
                  </Box>
                  <Box>
                    <Label htmlFor='store-email'>Email</Label>
                    <Input
                      id='store-email'
                      type='email'
                      value={form.email}
                      onChange={(e) => onFormChange('email', e.target.value)}
                      disabled={submitting}
                    />
                  </Box>
                </Box>

                {/* Store type */}
                <Box>
                  <p className='mb-2 text-sm font-semibold text-neutral-dark/70'>Tipo de tienda</p>
                  <div className='grid grid-cols-2 gap-2'>
                    {([
                      { value: 'STORE', label: 'Tienda', sub: 'Productos físicos o digitales', icon: 'bx-store' },
                      { value: 'RESTAURANT', label: 'Restaurante', sub: 'Menú con platos y categorías', icon: 'bx-restaurant' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => onFormChange('storeType', opt.value)}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${
                          form.storeType === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-gray/20 hover:border-primary/30'
                        }`}
                      >
                        <i className={`bx ${opt.icon} text-2xl ${form.storeType === opt.value ? 'text-primary' : 'text-neutral-dark/40'}`} aria-hidden='true' />
                        <div>
                          <p className='text-sm font-semibold'>{opt.label}</p>
                          <p className='text-xs text-neutral-dark/50'>{opt.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </Box>

                {/* PDF menu URL — only for restaurants */}
                {form.storeType === 'RESTAURANT' ? (
                  <Box>
                    <Label htmlFor='store-menu-pdf'>URL del menú en PDF (opcional)</Label>
                    <Input
                      id='store-menu-pdf'
                      value={form.menuPdfUrl}
                      onChange={(e) => onFormChange('menuPdfUrl', e.target.value)}
                      disabled={submitting}
                      placeholder='https://...'
                    />
                    <p className='mt-1 text-xs text-neutral-dark/50'>
                      Si lo proporcionas, los clientes verán un botón para abrirlo en la tienda.
                    </p>
                  </Box>
                ) : null}

                <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
                  <input
                    type='checkbox'
                    checked={form.isActive}
                    onChange={(e) => onFormChange('isActive', e.target.checked)}
                    disabled={submitting}
                  />
                  Tienda activa y visible en Merku
                </label>

                {/* +18 — editable by both admin and seller */}
                <label className='flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/50 px-4 py-3 text-sm text-neutral-dark'>
                  <input
                    type='checkbox'
                    checked={form.isAdultContent}
                    onChange={(e) => onFormChange('isAdultContent', e.target.checked)}
                    disabled={submitting}
                  />
                  <span>
                    <span className='mr-1.5 inline-flex items-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white'>+18</span>
                    Tienda de contenido para adultos — activa verificación de edad
                  </span>
                </label>

                {isSeller ? (
                  <div className='space-y-3'>
                    {/* Patrocinado info */}
                    <div className={`rounded-2xl border p-4 ${form.isPremiumAdvertiser ? 'border-amber-200 bg-amber-50/50' : 'border-neutral-gray/20 bg-neutral-50'}`}>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-2'>
                          <span className='inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600'>Patrocinado</span>
                          <p className='text-sm font-medium text-neutral-dark'>Publicidad en el catálogo</p>
                        </div>
                        {form.isPremiumAdvertiser ? (
                          <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600'>Activo</span>
                        ) : (
                          <span className='rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-dark/40'>Inactivo</span>
                        )}
                      </div>
                      <p className='mt-1.5 text-xs text-neutral-dark/55'>
                        {form.isPremiumAdvertiser
                          ? 'Tus productos aparecen destacados e intercalados en el catálogo principal.'
                          : 'Con el plan Patrocinado tus productos aparecen destacados en el catálogo y llegan a más clientes.'}
                      </p>
                      {form.isPremiumAdvertiser ? (
                        <a
                          href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hola, quisiera consultar sobre mi plan Patrocinado activo.')}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='mt-3 inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-600 shadow-sm transition hover:bg-amber-50 active:scale-95'
                        >
                          <i className='bx bxl-whatsapp text-sm' aria-hidden='true' />
                          Consultar mi plan
                        </a>
                      ) : (
                        <a
                          href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hola, estoy interesado en el plan Patrocinado para destacar mis productos en el catálogo.')}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95'
                        >
                          <i className='bx bxl-whatsapp text-sm' aria-hidden='true' />
                          Contratar plan patrocinado
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <label className='flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-neutral-dark'>
                    <input
                      type='checkbox'
                      checked={form.isPremiumAdvertiser ?? false}
                      onChange={(e) => onFormChange('isPremiumAdvertiser', e.target.checked)}
                      disabled={submitting}
                    />
                    <span>
                      <span className='mr-1.5 inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600'>Patrocinado</span>
                      Tienda con publicidad activa — sus productos aparecen intercalados en el catálogo
                    </span>
                  </label>
                )}

                {/* Subscription expiry */}
                {isSeller ? (
                  <SubscriptionInfo expiresAt={form.subscriptionExpiresAt} />
                ) : (
                  <div className='rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-3'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-blue-600'>Suscripción mensual</p>
                    <p className='text-xs text-slate-500'>Sin fecha de vencimiento la tienda siempre está activa. Con fecha, se oculta automáticamente de Merku al expirar.</p>
                    <div className='flex flex-wrap items-center gap-2'>
                      <input
                        type='date'
                        value={form.subscriptionExpiresAt ?? ''}
                        onChange={(e) => onFormChange('subscriptionExpiresAt', e.target.value)}
                        disabled={submitting}
                        className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                      />
                      <button type='button' disabled={submitting}
                        onClick={() => { const d = new Date(); d.setDate(d.getDate() + 30); onFormChange('subscriptionExpiresAt', d.toISOString().split('T')[0]); }}
                        className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary/40 hover:text-primary transition'>
                        +30 días
                      </button>
                      <button type='button' disabled={submitting}
                        onClick={() => { const d = new Date(); d.setDate(d.getDate() + 60); onFormChange('subscriptionExpiresAt', d.toISOString().split('T')[0]); }}
                        className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary/40 hover:text-primary transition'>
                        +60 días
                      </button>
                      <button type='button' disabled={submitting}
                        onClick={() => { const d = new Date(); d.setDate(d.getDate() + 90); onFormChange('subscriptionExpiresAt', d.toISOString().split('T')[0]); }}
                        className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary/40 hover:text-primary transition'>
                        +90 días
                      </button>
                      {form.subscriptionExpiresAt ? (
                        <button type='button' disabled={submitting}
                          onClick={() => onFormChange('subscriptionExpiresAt', '')}
                          className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-100 transition'>
                          Sin vencimiento
                        </button>
                      ) : null}
                    </div>
                    {form.subscriptionExpiresAt ? (
                      <p className={`text-xs font-medium ${new Date(form.subscriptionExpiresAt) < new Date() ? 'text-red-500' : 'text-green-600'}`}>
                        {new Date(form.subscriptionExpiresAt) < new Date()
                          ? '⚠ Esta fecha ya expiró — la tienda está oculta en Merku'
                          : `Visible hasta el ${new Date(form.subscriptionExpiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                      </p>
                    ) : (
                      <p className='text-xs text-slate-400'>Sin fecha — visible indefinidamente</p>
                    )}
                  </div>
                )}
              </Box>
            ) : null}

            {/* ── Tab: Colores ── */}
            {activeTab === 'colors' ? (
              <Box className='space-y-5'>
                <Box className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
                  <ColorPicker
                    label='Color primario'
                    value={form.primaryColor}
                    onChange={(v) => onFormChange('primaryColor', v)}
                    disabled={submitting}
                  />
                  <ColorPicker
                    label='Color secundario'
                    value={form.secondaryColor}
                    onChange={(v) => onFormChange('secondaryColor', v)}
                    disabled={submitting}
                  />
                  <ColorPicker
                    label='Color de acento'
                    value={form.accentColor}
                    onChange={(v) => onFormChange('accentColor', v)}
                    disabled={submitting}
                  />
                  <ColorPicker
                    label='Fondo de página'
                    value={form.bgColor}
                    onChange={(v) => onFormChange('bgColor', v)}
                    disabled={submitting}
                  />
                  <ColorPicker
                    label='Color de texto'
                    value={form.textColor}
                    onChange={(v) => onFormChange('textColor', v)}
                    disabled={submitting}
                  />
                </Box>

                <Box className='rounded-2xl border border-neutral-gray/20 bg-neutral-50 p-4 text-xs text-neutral-dark/60'>
                  <p className='font-semibold'>Guía de uso de colores:</p>
                  <ul className='mt-1.5 space-y-1 list-disc list-inside'>
                    <li><strong>Primario</strong> — encabezado, botones principales, links</li>
                    <li><strong>Secundario</strong> — gradiente del header, fondos suaves</li>
                    <li><strong>Acento</strong> — badges, precios, call-to-action secundarios</li>
                    <li><strong>Fondo</strong> — color de página detrás del contenido</li>
                    <li><strong>Texto</strong> — color base del texto en la tienda</li>
                  </ul>
                </Box>
              </Box>
            ) : null}

            {/* ── Tab: Estilo visual ── */}
            {activeTab === 'style' ? (
              <Box className='space-y-5'>
                {/* Tipografía */}
                <Box>
                  <p className='mb-2 text-sm font-semibold text-neutral-dark/70'>Tipografía</p>
                  <div className='grid grid-cols-3 gap-2'>
                    {([
                      { value: 'MODERN', label: 'Moderna', sub: 'Sans-serif limpia', style: 'font-sans' },
                      { value: 'CLASSIC', label: 'Clásica', sub: 'Elegante serif', style: 'font-serif' },
                      { value: 'PLAYFUL', label: 'Redondeada', sub: 'Divertida y amigable', style: 'tracking-wide' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => onFormChange('fontStyle', opt.value)}
                        className={`rounded-2xl border-2 p-3 text-left transition-all ${
                          form.fontStyle === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-gray/20 hover:border-primary/30'
                        }`}
                      >
                        <p className={`text-sm font-bold ${opt.style}`}>{opt.label}</p>
                        <p className='mt-0.5 text-xs text-neutral-dark/50'>{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </Box>

                {/* Botones */}
                <Box>
                  <p className='mb-2 text-sm font-semibold text-neutral-dark/70'>Estilo de botones</p>
                  <div className='grid grid-cols-3 gap-2'>
                    {([
                      { value: 'ROUNDED', label: 'Redondeado', className: 'rounded-xl' },
                      { value: 'SHARP', label: 'Cuadrado', className: 'rounded-none' },
                      { value: 'PILL', label: 'Píldora', className: 'rounded-full' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => onFormChange('buttonStyle', opt.value)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all ${
                          form.buttonStyle === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-gray/20 hover:border-primary/30'
                        }`}
                      >
                        <div
                          className={`px-4 py-1.5 text-xs font-semibold text-white ${opt.className}`}
                          style={{ backgroundColor: form.primaryColor || '#6366f1' }}
                        >
                          Botón
                        </div>
                        <span className='text-xs text-neutral-dark/60'>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </Box>

                {/* Layout */}
                <Box>
                  <p className='mb-2 text-sm font-semibold text-neutral-dark/70'>Layout de productos</p>
                  <div className='grid grid-cols-2 gap-2'>
                    {([
                      { value: 'GRID', label: 'Cuadrícula', icon: 'bx-grid-alt', sub: '3 columnas' },
                      { value: 'LIST', label: 'Lista', icon: 'bx-list-ul', sub: '1 columna ancha' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => onFormChange('layoutStyle', opt.value)}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-all ${
                          form.layoutStyle === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-gray/20 hover:border-primary/30'
                        }`}
                      >
                        <i className={`bx ${opt.icon} text-2xl ${form.layoutStyle === opt.value ? 'text-primary' : 'text-neutral-dark/40'}`} aria-hidden='true' />
                        <div className='text-left'>
                          <p className='text-sm font-semibold'>{opt.label}</p>
                          <p className='text-xs text-neutral-dark/50'>{opt.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </Box>

                {/* Cover style */}
                <Box>
                  <p className='mb-2 text-sm font-semibold text-neutral-dark/70'>Estilo del encabezado</p>
                  <div className='grid grid-cols-3 gap-2'>
                    {([
                      { value: 'GRADIENT', label: 'Gradiente', sub: 'Colorido' },
                      { value: 'SOLID', label: 'Sólido', sub: 'Color plano' },
                      { value: 'MINIMAL', label: 'Mínimal', sub: 'Fondo claro' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => onFormChange('coverStyle', opt.value)}
                        className={`rounded-2xl border-2 p-3 text-left transition-all ${
                          form.coverStyle === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-gray/20 hover:border-primary/30'
                        }`}
                      >
                        <div
                          className='mb-2 h-8 w-full rounded-lg'
                          style={{
                            background:
                              opt.value === 'GRADIENT'
                                ? `linear-gradient(135deg, ${form.primaryColor || '#6366f1'}, ${form.secondaryColor || '#a5b4fc'})`
                                : opt.value === 'SOLID'
                                  ? form.primaryColor || '#6366f1'
                                  : '#f8fafc',
                          }}
                        />
                        <p className='text-xs font-semibold'>{opt.label}</p>
                        <p className='text-xs text-neutral-dark/50'>{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </Box>
              </Box>
            ) : null}

            {/* ── Tab: Entrega ── */}
            {activeTab === 'delivery' ? (
              <Box className='space-y-3'>
                <p className='text-sm text-neutral-dark/60'>
                  Define qué opciones de entrega ofreces a tus clientes.
                </p>
                {([
                  { value: 'BOTH', label: 'Envío y recogida', sub: 'El cliente elige en el checkout', icon: 'bx-transfer' },
                  { value: 'DELIVERY', label: 'Solo envío a domicilio', sub: 'El cliente ingresa su dirección', icon: 'bx-car' },
                  { value: 'PICKUP', label: 'Solo recogida en tienda', sub: 'Coordinas con el cliente', icon: 'bx-store' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => onFormChange('deliveryOptions', opt.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      form.deliveryOptions === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-gray/20 hover:border-primary/30'
                    }`}
                  >
                    <i className={`bx ${opt.icon} text-2xl ${form.deliveryOptions === opt.value ? 'text-primary' : 'text-neutral-dark/40'}`} aria-hidden='true' />
                    <div>
                      <p className='font-semibold text-sm'>{opt.label}</p>
                      <p className='text-xs text-neutral-dark/50'>{opt.sub}</p>
                    </div>
                    {form.deliveryOptions === opt.value ? (
                      <i className='bx bx-check-circle ml-auto text-xl text-primary' aria-hidden='true' />
                    ) : null}
                  </button>
                ))}
              </Box>
            ) : null}

            {/* ── Tab: Ubicación ── */}
            {activeTab === 'location' ? (
              <Box className='space-y-4'>
                <p className='text-sm text-neutral-dark/60'>
                  Marca la ubicación física de tu tienda en el mapa. Los clientes podrán verla en tu página.
                </p>
                <MapAddressPicker
                  value={
                    form.lat && form.lng
                      ? { lat: form.lat, lng: form.lng, street: form.addressText, city: '', department: '' }
                      : null
                  }
                  onChange={(addr: MapAddress) => {
                    onFormChange('lat', addr.lat);
                    onFormChange('lng', addr.lng);
                    onFormChange(
                      'addressText',
                      [addr.street, addr.city, addr.department].filter(Boolean).join(', '),
                    );
                  }}
                />
                {form.lat && form.lng ? (
                  <a
                    href={`https://www.google.com/maps?q=${form.lat},${form.lng}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline'
                  >
                    <i className='bx bx-link-external text-sm' aria-hidden='true' />
                    Ver en Google Maps
                  </a>
                ) : null}
              </Box>
            ) : null}

            {error ? (
              <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </Box>
            ) : null}

            <Box className='flex items-center gap-3 pt-2'>
              <Button type='submit' variant='primary' loading={submitting} disabled={submitting || !isDirty}>
                {submitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear tienda'}
              </Button>
              {editingId && !isSeller ? (
                <Button type='button' variant='outline' onClick={onReset}>
                  Cancelar
                </Button>
              ) : null}
              {isDirty && !submitting ? (
                <span className='flex items-center gap-1.5 text-xs font-medium text-amber-600'>
                  <span className='h-2 w-2 rounded-full bg-amber-400' />
                  Cambios sin guardar
                </span>
              ) : null}
            </Box>
          </form>
        </Box>

        {/* ── Right column: Preview + Stores list ── */}
        <Box className={`flex flex-col gap-6 ${isSeller ? 'order-1' : 'order-2'}`}>
          {/* Live Preview */}
          <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-5 shadow-sm'>
            <Box className='mb-3 flex items-center gap-2'>
              <i className='bx bx-show text-lg text-primary' aria-hidden='true' />
              <Typography variant='h3' className='text-sm font-semibold'>
                Vista previa en tiempo real
              </Typography>
            </Box>
            <StorePreview form={form} wide={isSeller} />
          </Box>

          {/* Stores list — hidden for sellers (they only have one store, always in edit mode) */}
          {!isSeller ? <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-5 shadow-sm'>
            <Typography variant='h2' className='text-base font-semibold'>
              Tiendas registradas
            </Typography>

            {loading ? (
              <Box className='mt-4 space-y-2'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='h-14 skeleton rounded-2xl' />
                ))}
              </Box>
            ) : null}

            {!loading && stores.length === 0 ? (
              <Box className='mt-4 rounded-2xl border border-dashed border-neutral-gray/30 py-8 text-center text-sm text-neutral-dark/40'>
                Aún no hay tiendas
              </Box>
            ) : null}

            <Box className='mt-4 space-y-2'>
              {stores.map((store) => (
                <Box
                  key={store.id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition hover:shadow-sm ${
                    store.isActive
                      ? 'border-neutral-gray/20 bg-white hover:border-primary/20'
                      : 'border-red-200/60 bg-red-50/40 opacity-70'
                  }`}
                >
                  {/* Color swatch */}
                  <div
                    className={`h-8 w-8 flex-shrink-0 rounded-xl shadow-inner ${!store.isActive ? 'grayscale' : ''}`}
                    style={{
                      background: store.primaryColor
                        ? `linear-gradient(135deg, ${store.primaryColor}, ${store.secondaryColor || store.primaryColor})`
                        : '#f1f5f9',
                    }}
                  />
                  <Box className='min-w-0 flex-1'>
                    <div className='flex items-center gap-1.5'>
                      <Typography className='truncate text-sm font-semibold'>
                        {store.name}
                      </Typography>
                      {!store.isActive ? (
                        <span className='flex-shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600'>DESACTIVADA</span>
                      ) : null}
                      {store.storeType === 'RESTAURANT' ? (
                        <span className='flex-shrink-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white'>🍽️</span>
                      ) : null}
                      {store.isAdultContent ? (
                        <span className='flex-shrink-0 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white'>+18</span>
                      ) : null}
                    </div>
                    <Typography className='text-xs text-neutral-dark/45'>
                      /{store.slug}
                      {(() => {
                        if (!store.subscriptionExpiresAt) return null;
                        const exp = new Date(store.subscriptionExpiresAt);
                        const now = new Date();
                        const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
                        if (daysLeft < 0) return (
                          <span className='ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600'>Sub. expirada</span>
                        );
                        if (daysLeft <= 7) return (
                          <span className='ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-600'>Vence en {daysLeft}d</span>
                        );
                        return (
                          <span className='ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700'>Sub. activa</span>
                        );
                      })()}
                    </Typography>
                  </Box>
                  <div className='flex items-center gap-1.5'>
                    {onToggleActive ? (
                      <button
                        type='button'
                        onClick={() => setConfirmStore(store)}
                        disabled={submitting}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                          store.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {store.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    ) : null}
                    <button
                      type='button'
                      onClick={() => onEdit(store)}
                      className='rounded-xl border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5'
                    >
                      Editar
                    </button>
                    {onDelete ? (
                      <button
                        type='button'
                        onClick={() => setDeleteTarget(store)}
                        disabled={submitting}
                        className='rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50'
                      >
                        Eliminar
                      </button>
                    ) : null}
                  </div>
                </Box>
              ))}
            </Box>
          </Box> : null}
          {/* Menu categories — only when editing a restaurant */}
          {editingId && form.storeType === 'RESTAURANT' ? (
            <Box className='rounded-[1.75rem] border border-amber-200 bg-amber-50/30 p-5 shadow-sm'>
              <Box className='mb-3 flex items-center gap-2'>
                <i className='bx bx-restaurant text-lg text-amber-500' aria-hidden='true' />
                <Typography variant='h3' className='text-sm font-semibold'>
                  Categorías del menú
                </Typography>
              </Box>
              {menuCats.loading ? (
                <div className='space-y-2'>
                  {[1, 2].map((i) => <div key={i} className='h-10 skeleton rounded-xl' />)}
                </div>
              ) : (
                <MenuCategoriesManager
                  categories={menuCats.categories}
                  submitting={menuCats.submitting}
                  error={menuCats.error}
                  onCreate={menuCats.create}
                  onUpdate={menuCats.update}
                  onRemove={menuCats.remove}
                />
              )}
            </Box>
          ) : null}
        </Box>
      </Box>

      {confirmStore ? (
        <ConfirmToggleModal
          store={confirmStore}
          onConfirm={() => {
            if (onToggleActive) onToggleActive(confirmStore);
            setConfirmStore(null);
          }}
          onCancel={() => setConfirmStore(null)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteModal
          store={deleteTarget}
          error={error}
          submitting={submitting}
          onConfirm={async () => {
            if (!onDelete) return;
            const ok = await onDelete(deleteTarget);
            if (ok) setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </Box>
  );
};
