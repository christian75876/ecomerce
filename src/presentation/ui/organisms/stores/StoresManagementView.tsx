import { useState } from 'react';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { StoreFormState } from '@/application/useCases/stores/useStoresManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import ColorPicker from '@/presentation/ui/atoms/color-picker/ColorPicker';

interface StoresManagementViewProps {
  stores: IStore[];
  form: StoreFormState;
  editingId: string | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onFormChange: <K extends keyof StoreFormState>(key: K, value: StoreFormState[K]) => void;
  onSubmit: () => Promise<boolean>;
  onEdit: (store: IStore) => void;
  onReset: () => void;
}

type BrandingTab = 'info' | 'colors' | 'style' | 'delivery';

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

const StorePreview = ({ form }: { form: StoreFormState }) => {
  const primary = form.primaryColor || '#6366f1';
  const secondary = form.secondaryColor || '#a5b4fc';
  const accent = form.accentColor || '#f59e0b';
  const bg = form.bgColor || '#ffffff';
  const text = form.textColor || '#1e293b';
  const btnRadius = buttonRadiusClass(form.buttonStyle);
  const font = fontClass(form.fontStyle);

  const coverBg =
    form.coverStyle === 'SOLID'
      ? primary
      : form.coverStyle === 'MINIMAL'
        ? '#f8fafc'
        : `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;

  const coverText = form.coverStyle === 'MINIMAL' ? text : '#ffffff';

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-neutral-gray/20 shadow-lg ${font}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {/* Cover */}
      <div
        className='px-5 py-6'
        style={{ background: coverBg, color: coverText }}
      >
        <div className='flex items-center gap-3'>
          <div
            className='flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow'
            style={{ backgroundColor: accent }}
          >
            {(form.name || 'T').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className='text-lg font-bold'>{form.name || 'Nombre de tu tienda'}</p>
            <p className='text-xs opacity-75'>{form.description ? form.description.slice(0, 50) : 'Descripción breve'}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className='p-4' style={{ backgroundColor: bg }}>
        {/* Mini product cards */}
        <div className={form.layoutStyle === 'LIST' ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}>
          {[1, 2].map((i) => (
            <div
              key={i}
              className='overflow-hidden rounded-xl border border-neutral-gray/15'
              style={{ backgroundColor: '#fff' }}
            >
              <div className='h-16 w-full' style={{ backgroundColor: `${primary}15` }} />
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

        {/* CTA button */}
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
  onFormChange,
  onSubmit,
  onEdit,
  onReset,
}: StoresManagementViewProps) => {
  const [activeTab, setActiveTab] = useState<BrandingTab>('info');

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
  ];

  return (
    <Box className='space-y-6'>
      <Box>
        <Typography variant='h1' className='text-3xl font-bold'>
          Tiendas
        </Typography>
        <Typography className='mt-2 text-neutral-dark/70'>
          Configura el branding completo de cada tienda — colores, tipografía, layout y más.
        </Typography>
      </Box>

      <Box className='grid gap-6 xl:grid-cols-[1fr_340px]'>
        {/* ── Editor ── */}
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-xl font-semibold'>
            {editingId ? 'Editar tienda' : 'Nueva tienda'}
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

                <Box className='grid gap-4 sm:grid-cols-2'>
                  <Box>
                    <Label htmlFor='store-logo'>Logo URL</Label>
                    <Input
                      id='store-logo'
                      value={form.logoUrl}
                      onChange={(e) => onFormChange('logoUrl', e.target.value)}
                      disabled={submitting}
                      placeholder='https://...'
                    />
                  </Box>
                  <Box>
                    <Label htmlFor='store-banner'>Banner URL</Label>
                    <Input
                      id='store-banner'
                      value={form.bannerUrl}
                      onChange={(e) => onFormChange('bannerUrl', e.target.value)}
                      disabled={submitting}
                      placeholder='https://...'
                    />
                  </Box>
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

                <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
                  <input
                    type='checkbox'
                    checked={form.isActive}
                    onChange={(e) => onFormChange('isActive', e.target.checked)}
                    disabled={submitting}
                  />
                  Tienda activa y visible en el marketplace
                </label>
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

            {error ? (
              <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </Box>
            ) : null}

            <Box className='flex gap-3 pt-2'>
              <Button type='submit' variant='primary' loading={submitting}>
                {submitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear tienda'}
              </Button>
              {editingId ? (
                <Button type='button' variant='outline' onClick={onReset}>
                  Cancelar
                </Button>
              ) : null}
            </Box>
          </form>
        </Box>

        {/* ── Right column: Preview + Stores list ── */}
        <Box className='flex flex-col gap-6'>
          {/* Live Preview */}
          <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-5 shadow-sm'>
            <Box className='mb-3 flex items-center gap-2'>
              <i className='bx bx-show text-lg text-primary' aria-hidden='true' />
              <Typography variant='h3' className='text-sm font-semibold'>
                Vista previa en tiempo real
              </Typography>
            </Box>
            <StorePreview form={form} />
          </Box>

          {/* Stores list */}
          <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-5 shadow-sm'>
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
                  className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 bg-white px-4 py-3 transition hover:border-primary/20 hover:shadow-sm'
                >
                  {/* Color swatch */}
                  <div
                    className='h-8 w-8 flex-shrink-0 rounded-xl shadow-inner'
                    style={{
                      background: store.primaryColor
                        ? `linear-gradient(135deg, ${store.primaryColor}, ${store.secondaryColor || store.primaryColor})`
                        : '#f1f5f9',
                    }}
                  />
                  <Box className='min-w-0 flex-1'>
                    <Typography className='truncate text-sm font-semibold'>
                      {store.name}
                    </Typography>
                    <Typography className='text-xs text-neutral-dark/45'>
                      /{store.slug} · {store.isActive ? 'Activa' : 'Inactiva'}
                    </Typography>
                  </Box>
                  <button
                    type='button'
                    onClick={() => onEdit(store)}
                    className='rounded-xl border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5'
                  >
                    Editar
                  </button>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
