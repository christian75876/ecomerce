import { useEffect, useRef, useState } from 'react';
import { useAdminStoreFilterContext } from '@/shared/context/AdminStoreFilterContext';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import type { IStore } from '@/application/dtos/stores/response/StoreResponse';
import MapAddressPicker, {
  MapAddress
} from '@/presentation/ui/molecules/common/MapAddressPicker';

// ── Store Preview ─────────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { name: 'Producto estrella', price: '$45.000', emoji: '⭐' },
  { name: 'Oferta del día', price: '$28.500', emoji: '🔥' },
  { name: 'Más vendido', price: '$67.000', emoji: '🏆' }
];

const btnRadius = (style: string) => {
  if (style === 'PILL') return 'rounded-full';
  if (style === 'SHARP') return 'rounded-none';
  return 'rounded-xl';
};

const coverBg = (f: FormState) => {
  const p = f.primaryColor || '#6366f1';
  const s = f.secondaryColor || '#a5b4fc';
  if (f.coverStyle === 'SOLID') return p;
  if (f.coverStyle === 'MINIMAL') return '#f8fafc';
  return `linear-gradient(135deg, ${p} 0%, ${s} 100%)`;
};

const coverText = (f: FormState) =>
  f.coverStyle === 'MINIMAL' ? f.textColor || '#1e293b' : '#ffffff';

const fontCls = (f: FormState) => {
  if (f.fontStyle === 'CLASSIC') return 'font-serif';
  if (f.fontStyle === 'PLAYFUL') return 'tracking-wide';
  return 'font-sans';
};

const StorePreviewPanel = ({
  form,
  logoUrl,
  bannerUrl
}: {
  form: FormState;
  logoUrl: string | null;
  bannerUrl: string | null;
}) => {
  const primary = form.primaryColor || '#6366f1';
  const accent = form.accentColor || '#f59e0b';
  const bg = form.bgColor || '#ffffff';
  const text = form.textColor || '#1e293b';
  const isGrid = form.layoutStyle !== 'LIST';

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-slate-200 shadow-sm text-sm ${fontCls(form)}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {/* Browser chrome mockup */}
      <div className='flex items-center gap-2 bg-slate-100 px-4 py-2.5 border-b border-slate-200'>
        <div className='flex gap-1.5'>
          <span className='h-3 w-3 rounded-full bg-red-400' />
          <span className='h-3 w-3 rounded-full bg-yellow-400' />
          <span className='h-3 w-3 rounded-full bg-green-400' />
        </div>
        <div className='flex-1 rounded-lg bg-white border border-slate-200 px-3 py-1 text-xs text-slate-400'>
          marketplace.com/stores/{form.slug || 'mi-tienda'}
        </div>
      </div>

      {/* Cover */}
      <div
        className='relative overflow-hidden px-5 py-6'
        style={{ background: coverBg(form), color: coverText(form) }}
      >
        {bannerUrl ? (
          <div
            className='absolute inset-0 bg-cover bg-center opacity-20'
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />
        ) : null}
        <div className='relative z-10 flex items-start gap-3'>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=''
              className='h-14 w-14 flex-shrink-0 rounded-2xl border-2 border-white/30 object-cover shadow'
            />
          ) : (
            <div
              className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow'
              style={{ backgroundColor: accent }}
            >
              {(form.name || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <p
              className='text-lg font-bold leading-tight'
              style={{ color: 'inherit' }}
            >
              {form.name || 'Nombre de tu tienda'}
            </p>
            {form.description ? (
              <p
                className='mt-1 text-xs opacity-80 line-clamp-2'
                style={{ color: 'inherit' }}
              >
                {form.description}
              </p>
            ) : null}
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {[
                form.phone && `📞 ${form.phone}`,
                form.deliveryOptions !== 'PICKUP' && '🚚 Envío',
                form.deliveryOptions !== 'DELIVERY' && '🏪 Recogida'
              ]
                .filter(Boolean)
                .map((pill, i) => (
                  <span
                    key={i}
                    className='rounded-full px-2 py-0.5 text-[11px] font-medium'
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
                  >
                    {pill as string}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products section */}
      <div className='p-4' style={{ backgroundColor: bg }}>
        <p
          className='mb-3 text-xs font-semibold'
          style={{ color: text, opacity: 0.5 }}
        >
          PRODUCTOS
        </p>
        <div className={isGrid ? 'grid grid-cols-3 gap-2' : 'space-y-2'}>
          {MOCK_PRODUCTS.map(p =>
            isGrid ? (
              <div
                key={p.name}
                className='overflow-hidden rounded-2xl border'
                style={{ borderColor: `${primary}22`, backgroundColor: bg }}
              >
                <div
                  className='flex h-20 items-center justify-center text-2xl'
                  style={{ backgroundColor: `${primary}12` }}
                >
                  {p.emoji}
                </div>
                <div className='p-2'>
                  <p
                    className='text-[11px] font-semibold leading-tight line-clamp-1'
                    style={{ color: text }}
                  >
                    {p.name}
                  </p>
                  <p
                    className='mt-0.5 text-[11px] font-bold'
                    style={{ color: primary }}
                  >
                    {p.price}
                  </p>
                  <button
                    className={`mt-1.5 w-full py-1 text-[10px] font-bold text-white ${btnRadius(form.buttonStyle)}`}
                    style={{ backgroundColor: primary }}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={p.name}
                className='flex items-center gap-3 rounded-2xl border p-2'
                style={{ borderColor: `${primary}22`, backgroundColor: bg }}
              >
                <div
                  className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg'
                  style={{ backgroundColor: `${primary}12` }}
                >
                  {p.emoji}
                </div>
                <div className='flex-1 min-w-0'>
                  <p
                    className='text-[11px] font-semibold'
                    style={{ color: text }}
                  >
                    {p.name}
                  </p>
                  <p
                    className='text-[11px] font-bold'
                    style={{ color: primary }}
                  >
                    {p.price}
                  </p>
                </div>
                <button
                  className={`flex-shrink-0 px-3 py-1 text-[10px] font-bold text-white ${btnRadius(form.buttonStyle)}`}
                  style={{ backgroundColor: primary }}
                >
                  +
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ── helpers ───────────────────────────────────────────────────────────────────
const FONT_OPTS = ['MODERN', 'CLASSIC', 'PLAYFUL'] as const;
const BTN_OPTS = ['ROUNDED', 'SHARP', 'PILL'] as const;
const LAY_OPTS = ['GRID', 'LIST'] as const;
const COV_OPTS = ['GRADIENT', 'SOLID', 'MINIMAL'] as const;
const TYP_OPTS = ['STORE', 'RESTAURANT'] as const;
const DEL_OPTS = ['DELIVERY', 'PICKUP', 'BOTH'] as const;

const FONT_LABEL: Record<string, string> = {
  MODERN: 'Moderno',
  CLASSIC: 'Clásico',
  PLAYFUL: 'Divertido'
};
const BTN_LABEL: Record<string, string> = {
  ROUNDED: 'Redondeado',
  SHARP: 'Cuadrado',
  PILL: 'Pastilla'
};
const LAY_LABEL: Record<string, string> = { GRID: 'Cuadrícula', LIST: 'Lista' };
const COV_LABEL: Record<string, string> = {
  GRADIENT: 'Degradado',
  SOLID: 'Sólido',
  MINIMAL: 'Mínimal'
};
const TYP_LABEL: Record<string, string> = {
  STORE: 'Tienda',
  RESTAURANT: 'Restaurante'
};
const DEL_LABEL: Record<string, string> = {
  DELIVERY: 'Domicilio',
  PICKUP: 'Recogida',
  BOTH: 'Ambos'
};

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

// ── sub-components ────────────────────────────────────────────────────────────
const SectionCard = ({
  title,
  icon,
  children,
  className
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 ${className ?? ''}`}>
    <h2 className='flex items-center gap-2 text-base font-semibold text-slate-800'>
      <i className={`bx ${icon} text-xl text-primary`} />
      {title}
    </h2>
    {children}
  </div>
);

const Field = ({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className='space-y-1.5'>
    <label className='block text-xs font-semibold text-slate-600'>
      {label}
    </label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    rows={3}
    className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none'
  />
);

const SegmentedControl = <T extends string>({
  options,
  labels,
  value,
  onChange
}: {
  options: readonly T[];
  labels: Record<string, string>;
  value: T;
  onChange: (v: T) => void;
}) => (
  <div className='flex gap-2 flex-wrap'>
    {options.map(opt => (
      <button
        key={opt}
        type='button'
        onClick={() => onChange(opt)}
        className={`rounded-2xl px-4 py-2 text-xs font-semibold transition border ${
          value === opt
            ? 'bg-primary text-white border-primary'
            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/40'
        }`}
      >
        {labels[opt] ?? opt}
      </button>
    ))}
  </div>
);

// ── image upload card ─────────────────────────────────────────────────────────
const ImageUploadCard = ({
  label,
  current,
  onUpload,
  uploading,
  aspect
}: {
  label: string;
  current: string | null;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  aspect: 'square' | 'banner';
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isSquare = aspect === 'square';

  return (
    <div className='space-y-2'>
      <p className='text-xs font-semibold text-slate-600'>{label}</p>
      <div
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-primary/40 transition ${
          isSquare ? 'w-28 h-28' : 'w-full h-36'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {current ? (
          <img
            src={current}
            alt={label}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='flex flex-col items-center gap-1 text-slate-400'>
            <i className='bx bx-image-add text-3xl' />
            <span className='text-xs'>Subir imagen</span>
          </div>
        )}
        {uploading ? (
          <div className='absolute inset-0 flex items-center justify-center bg-white/70'>
            <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          </div>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        className='hidden'
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) void onUpload(f);
        }}
      />
      <p className='text-[11px] text-slate-400'>
        JPG, PNG o WebP. Haz clic para cambiar.
      </p>
    </div>
  );
};

// ── color picker field ────────────────────────────────────────────────────────
const ColorField = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className='flex items-center gap-3'>
    <div className='relative'>
      <input
        type='color'
        value={value || '#6366f1'}
        onChange={e => onChange(e.target.value)}
        className='w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white'
      />
    </div>
    <div className='flex-1'>
      <p className='text-xs font-semibold text-slate-600'>{label}</p>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder='#6366f1'
        className='mt-1 !py-1.5 !text-xs font-mono'
      />
    </div>
  </div>
);

// ── main page ─────────────────────────────────────────────────────────────────
type FormState = {
  name: string;
  slug: string;
  description: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  storeType: 'STORE' | 'RESTAURANT';
  deliveryOptions: 'DELIVERY' | 'PICKUP' | 'BOTH';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  fontStyle: 'MODERN' | 'CLASSIC' | 'PLAYFUL';
  buttonStyle: 'ROUNDED' | 'SHARP' | 'PILL';
  layoutStyle: 'GRID' | 'LIST';
  coverStyle: 'GRADIENT' | 'SOLID' | 'MINIMAL';
  addressText: string;
  lat: string;
  lng: string;
};

const toForm = (s: IStore): FormState => ({
  name: s.name ?? '',
  slug: s.slug ?? '',
  description: s.description ?? '',
  email: s.email ?? '',
  phone: s.phone ?? '',
  whatsappNumber: s.whatsappNumber ?? '',
  storeType: s.storeType ?? 'STORE',
  deliveryOptions: s.deliveryOptions ?? 'DELIVERY',
  primaryColor: s.primaryColor ?? '#6366f1',
  secondaryColor: s.secondaryColor ?? '#8b5cf6',
  accentColor: s.accentColor ?? '#f59e0b',
  bgColor: s.bgColor ?? '#ffffff',
  textColor: s.textColor ?? '#1e293b',
  fontStyle: s.fontStyle ?? 'MODERN',
  buttonStyle: s.buttonStyle ?? 'ROUNDED',
  layoutStyle: s.layoutStyle ?? 'GRID',
  coverStyle: s.coverStyle ?? 'GRADIENT',
  addressText: s.addressText ?? '',
  lat: s.lat != null ? String(s.lat) : '',
  lng: s.lng != null ? String(s.lng) : ''
});

const MyStorePage = () => {
  const { selectedStore, stores } = useAdminStoreFilterContext();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [localLogo, setLocalLogo] = useState<string | null>(null);
  const [localBanner, setLocalBanner] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  const store = selectedStore ?? stores[0] ?? null;

  useEffect(() => {
    if (store) {
      setForm(toForm(store));
      setLocalLogo(store.logoUrl);
      setLocalBanner(store.bannerUrl);
      setSlugManual(false);
    }
  }, [store?.id]);

  if (!store || !form) {
    return (
      <div className='flex flex-col items-center justify-center py-32 text-slate-400'>
        <i className='bx bx-store-alt text-5xl mb-3' />
        <p className='font-semibold'>No tienes tiendas asignadas</p>
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => (f ? { ...f, [key]: value } : f));

  const handleNameChange = (v: string) => {
    set('name', v);
    if (!slugManual) set('slug', slugify(v));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await StoresRepository.updateStore(store.id, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        whatsappNumber: form.whatsappNumber.trim() || undefined,
        storeType: form.storeType,
        deliveryOptions: form.deliveryOptions,
        primaryColor: form.primaryColor || undefined,
        secondaryColor: form.secondaryColor || undefined,
        accentColor: form.accentColor || undefined,
        bgColor: form.bgColor || undefined,
        textColor: form.textColor || undefined,
        fontStyle: form.fontStyle,
        buttonStyle: form.buttonStyle,
        layoutStyle: form.layoutStyle,
        coverStyle: form.coverStyle,
        addressText: form.addressText.trim() || undefined,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null
      });
      SnackbarUtilities.success('Tienda actualizada', 'top', 'center');
    } catch (err) {
      SnackbarUtilities.error(
        err instanceof Error ? err.message : 'Error al guardar',
        'top',
        'center'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const res = await StoresRepository.uploadLogo(store.id, file);
      setLocalLogo(res.data.logoUrl);
      SnackbarUtilities.success('Logo actualizado', 'top', 'center');
    } catch (err) {
      SnackbarUtilities.error(
        err instanceof Error ? err.message : 'Error al subir logo',
        'top',
        'center'
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true);
    try {
      const res = await StoresRepository.uploadBanner(store.id, file);
      setLocalBanner(res.data.bannerUrl);
      SnackbarUtilities.success('Banner actualizado', 'top', 'center');
    } catch (err) {
      SnackbarUtilities.error(
        err instanceof Error ? err.message : 'Error al subir banner',
        'top',
        'center'
      );
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className='animate-fade-up max-w-[1200px] mx-auto space-y-6'>
      {/* Header */}
      <div
        className='relative overflow-hidden rounded-3xl px-6 py-8 text-white shadow-lg sm:px-10 flex items-center gap-5'
        style={{
          background:
            form.primaryColor && form.secondaryColor
              ? `linear-gradient(135deg, ${form.primaryColor} 0%, ${form.secondaryColor} 100%)`
              : form.primaryColor
                ? `linear-gradient(135deg, ${form.primaryColor} 0%, ${form.primaryColor}99 100%)`
                : 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)'
        }}
      >
        {localLogo ? (
          <img
            src={localLogo}
            alt={form.name}
            className='h-16 w-16 rounded-2xl object-cover border-2 border-white/30 flex-shrink-0'
          />
        ) : (
          <div className='h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0'>
            <i className='bx bx-store-alt text-3xl text-white' />
          </div>
        )}
        <div>
          <p className='text-xs font-semibold uppercase tracking-widest text-white/60'>
            Mi tienda
          </p>
          <h1 className='mt-1 text-2xl font-extrabold tracking-tight'>
            {form.name || 'Sin nombre'}
          </h1>
          <p className='mt-0.5 text-sm text-white/70'>/{form.slug}</p>
        </div>
        <button
          type='button'
          onClick={() => void handleSave()}
          disabled={saving}
          className='ml-auto flex-shrink-0 flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-50'
        >
          {saving ? (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
          ) : (
            <i className='bx bx-save text-base' />
          )}
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      {/* Información básica — ancho completo */}
      <SectionCard title='Información básica' icon='bx-info-circle'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field label='Nombre de la tienda *'>
            <Input
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder='Mi tienda'
            />
          </Field>
          <Field label='Slug (URL pública)'>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400'>
                /
              </span>
              <input
                value={form.slug}
                onChange={e => {
                  setSlugManual(true);
                  set('slug', slugify(e.target.value));
                }}
                placeholder='mi-tienda'
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 pl-6 pr-4 py-2.5 text-sm font-mono outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              />
            </div>
          </Field>
        </div>

        <Field label='Descripción'>
          <Textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder='Cuéntale a tus clientes sobre tu tienda…'
          />
        </Field>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <Field label='Email de contacto'>
            <Input
              type='email'
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder='hola@tienda.com'
            />
          </Field>
          <Field label='Teléfono'>
            <Input
              type='tel'
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder='3001234567'
            />
          </Field>
          <Field label='WhatsApp'>
            <Input
              type='tel'
              value={form.whatsappNumber}
              onChange={e => set('whatsappNumber', e.target.value)}
              placeholder='573001234567'
            />
          </Field>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field label='Tipo de tienda'>
            <SegmentedControl
              options={TYP_OPTS}
              labels={TYP_LABEL}
              value={form.storeType}
              onChange={v => set('storeType', v)}
            />
          </Field>
          <Field label='Opciones de entrega'>
            <SegmentedControl
              options={DEL_OPTS}
              labels={DEL_LABEL}
              value={form.deliveryOptions}
              onChange={v => set('deliveryOptions', v)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Imágenes — ancho completo */}
      <SectionCard title='Imágenes' icon='bx-image'>
        <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
          <ImageUploadCard
            label='Logo'
            current={localLogo}
            onUpload={handleLogoUpload}
            uploading={uploadingLogo}
            aspect='square'
          />
          <div className='flex-1'>
            <ImageUploadCard
              label='Banner / portada'
              current={localBanner}
              onUpload={handleBannerUpload}
              uploading={uploadingBanner}
              aspect='banner'
            />
          </div>
        </div>
      </SectionCard>

      {/* Apariencia + Vista previa — dos columnas */}
      <div className='flex flex-col gap-6 xl:flex-row'>
        {/* Apariencia */}
        <div className='min-w-0 flex-1 flex flex-col'>
        <SectionCard title='Apariencia' icon='bx-palette' className='flex-1'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <ColorField
              label='Color primario'
              value={form.primaryColor}
              onChange={v => set('primaryColor', v)}
            />
            <ColorField
              label='Color secundario'
              value={form.secondaryColor}
              onChange={v => set('secondaryColor', v)}
            />
            <ColorField
              label='Color de acento'
              value={form.accentColor}
              onChange={v => set('accentColor', v)}
            />
            <ColorField
              label='Color de fondo'
              value={form.bgColor}
              onChange={v => set('bgColor', v)}
            />
            <ColorField
              label='Color de texto'
              value={form.textColor}
              onChange={v => set('textColor', v)}
            />
          </div>

          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
            <Field label='Fuente'>
              <SegmentedControl
                options={FONT_OPTS}
                labels={FONT_LABEL}
                value={form.fontStyle}
                onChange={v => set('fontStyle', v)}
              />
            </Field>
            <Field label='Estilo de botones'>
              <SegmentedControl
                options={BTN_OPTS}
                labels={BTN_LABEL}
                value={form.buttonStyle}
                onChange={v => set('buttonStyle', v)}
              />
            </Field>
            <Field label='Vista de productos'>
              <SegmentedControl
                options={LAY_OPTS}
                labels={LAY_LABEL}
                value={form.layoutStyle}
                onChange={v => set('layoutStyle', v)}
              />
            </Field>
            <Field label='Estilo de portada'>
              <SegmentedControl
                options={COV_OPTS}
                labels={COV_LABEL}
                value={form.coverStyle}
                onChange={v => set('coverStyle', v)}
              />
            </Field>
          </div>
        </SectionCard>
        </div>

        {/* Vista previa — columna derecha */}
        <div className='xl:w-[400px] xl:flex-shrink-0 xl:self-start xl:sticky xl:top-20'>
          <div className='rounded-3xl border border-slate-200 bg-white p-4 shadow-sm'>
            <div className='mb-3 flex items-center gap-2'>
              <i className='bx bx-desktop text-lg text-primary' />
              <span className='text-sm font-semibold text-slate-800'>
                Vista previa en vivo
              </span>
            </div>
            <StorePreviewPanel
              form={form}
              logoUrl={localLogo}
              bannerUrl={localBanner}
            />
          </div>
        </div>
      </div>
      {/* end apariencia + preview */}

      {/* Ubicación — ancho completo */}
      <SectionCard title='Ubicación' icon='bx-map'>
        <MapAddressPicker
          value={
            form.lat && form.lng
              ? {
                  street: form.addressText || '',
                  city: '',
                  department: '',
                  lat: parseFloat(form.lat),
                  lng: parseFloat(form.lng)
                }
              : null
          }
          onChange={(addr: MapAddress) => {
            const full = [addr.street, addr.city, addr.department]
              .filter(Boolean)
              .join(', ');
            set('addressText', full);
            set('lat', String(addr.lat));
            set('lng', String(addr.lng));
          }}
        />
      </SectionCard>

      {/* Save button bottom */}
      <div className='flex justify-end pb-2'>
        <button
          type='button'
          onClick={() => void handleSave()}
          disabled={saving}
          className='flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50'
        >
          {saving ? (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
          ) : (
            <i className='bx bx-save text-base' />
          )}
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default MyStorePage;
