import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAdvertisingManagement, AdStatusFilter } from '@/application/useCases/advertising/useAdvertisingManagement';
import type { IStoreWithAdStatus } from '@/application/dtos/advertising/AdvertisingResponse';
import type { IRegisterAdvertisementDto } from '@/infrastructure/repositories/api/advertising/AdvertisingRepository';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import StorePaymentHistoryPanel from '@/presentation/ui/organisms/payments/StorePaymentHistoryPanel';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Patrocinado',
  EXPIRED: 'Vencida',
  NEVER: 'Sin publicidad',
};

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: 'bg-amber-100 text-amber-700',
  EXPIRED: 'bg-red-100 text-red-700',
  NEVER: 'bg-slate-100 text-slate-500',
};

// ── MetricCard ────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  accent?: string;
}

const MetricCard = ({ label, value, icon, accent = 'text-primary' }: MetricCardProps) => (
  <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
    <div className='flex items-start justify-between'>
      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{label}</p>
      <i className={`bx ${icon} text-xl ${accent}`} aria-hidden='true' />
    </div>
    <p className='mt-3 text-2xl font-extrabold tracking-tight text-slate-800'>{value}</p>
  </div>
);

// ── RegisterAdModal ───────────────────────────────────────────────────────────

interface RegisterAdModalProps {
  store: IStoreWithAdStatus;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (dto: IRegisterAdvertisementDto) => Promise<void>;
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Efectivo', icon: 'bx-money' },
  { value: 'TRANSFER', label: 'Transferencia', icon: 'bx-transfer' },
  { value: 'OTHER', label: 'Otro', icon: 'bx-dots-horizontal' },
] as const;

const RegisterAdModal = ({ store, submitting, onClose, onSubmit }: RegisterAdModalProps) => {
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(() => addDays(todayIso(), 30));
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'OTHER'>('CASH');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const endBeforeStart = endDate <= startDate;

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    setLocalError(null);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (endBeforeStart) {
      setLocalError('La fecha de fin debe ser posterior a la de inicio');
      return;
    }
    if (endDate === startDate) {
      setLocalError('La fecha de fin debe ser posterior a la de inicio');
      return;
    }
    setLocalError(null);
    await onSubmit({
      storeId: store.store.id,
      startDate,
      endDate,
      paidAmount,
      paymentMethod,
      notes: notes.trim() || undefined,
    });
  };

  const durationDays =
    !endBeforeStart && endDate > startDate
      ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)
      : 0;

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-slate-100 px-6 py-5'>
          <div>
            <h2 className='text-lg font-bold text-slate-800'>Registrar publicidad</h2>
            <p className='mt-0.5 text-sm text-slate-500'>
              Tienda: <span className='font-semibold text-slate-700'>{store.store.name}</span>
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          >
            <i className='bx bx-x text-xl' aria-hidden='true' />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={(e) => void handleSubmit(e)} className='flex flex-col overflow-hidden'>
          <div className='flex-1 overflow-y-auto px-6 py-5 space-y-5'>

            {/* ── Dates ── */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Fecha inicio
                </label>
                <input
                  type='date'
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
                />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Fecha fin
                </label>
                <input
                  type='date'
                  value={endDate}
                  min={startDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className={`w-full rounded-2xl border bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                    endBeforeStart
                      ? 'border-red-300 text-red-600 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-primary/40 focus:ring-primary/10'
                  }`}
                />
                {endBeforeStart ? (
                  <p className='mt-1 text-[11px] font-medium text-red-500'>
                    Debe ser posterior al inicio
                  </p>
                ) : null}
              </div>
            </div>

            {/* ── Duration summary ── */}
            {!endBeforeStart && durationDays > 0 ? (
              <div className='flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700'>
                <i className='bx bx-trophy text-base text-amber-500' aria-hidden='true' />
                <span>
                  {durationDays} días de publicidad patrocinada —{' '}
                  {fmtDate(startDate)} al {fmtDate(endDate)}
                </span>
              </div>
            ) : null}

            {/* ── Amount ── */}
            <div>
              <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Monto pagado (COP)
              </label>
              <input
                type='number'
                min={0}
                step={1000}
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              />
            </div>

            {/* ── Payment method ── */}
            <div>
              <label className='mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Método de pago
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type='button'
                    onClick={() => setPaymentMethod(m.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 text-xs font-semibold transition-all ${
                      paymentMethod === m.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 text-slate-500 hover:border-primary/30 hover:text-slate-700'
                    }`}
                  >
                    <i className={`bx ${m.icon} text-lg`} aria-hidden='true' />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Notes ── */}
            <div>
              <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Notas (opcional)
              </label>
              <input
                type='text'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Observaciones del pago...'
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              />
            </div>

            {localError ? (
              <div className='flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700'>
                <i className='bx bx-error-circle flex-shrink-0' aria-hidden='true' /> {localError}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className='flex gap-3 border-t border-slate-100 px-6 py-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={submitting || endBeforeStart}
              className='flex-1 rounded-2xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
            >
              {submitting ? 'Guardando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

// ── Filter options ────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { label: string; value: AdStatusFilter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Activo', value: 'ACTIVE' },
  { label: 'Vencido', value: 'EXPIRED' },
  { label: 'Sin publicidad', value: 'NEVER' },
];

// ── AdvertisingPage ───────────────────────────────────────────────────────────

const AdvertisingPage = () => {
  const {
    dashboard,
    loading,
    submitting,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredStores,
    loadDashboard,
    registerAdvertisement,
    cancelAdvertisement,
  } = useAdvertisingManagement();

  const [registerTarget, setRegisterTarget] = useState<IStoreWithAdStatus | null>(null);
  const [historyTarget, setHistoryTarget] = useState<IStoreWithAdStatus | null>(null);

  const overview = dashboard?.overview;
  const revenue = dashboard?.revenue;

  const handleRegisterAdvertisement = async (dto: IRegisterAdvertisementDto) => {
    await registerAdvertisement(dto);
    setRegisterTarget(null);
  };

  const handleCancel = async (entry: IStoreWithAdStatus) => {
    const ad = entry.latestAdvertisement;
    if (!ad) return;
    if (!window.confirm(`¿Cancelar la publicidad de "${entry.store.name}"?`)) return;
    await cancelAdvertisement(ad.id);
  };

  const buildWhatsappUrl = (entry: IStoreWithAdStatus) => {
    const num = entry.store.whatsappNumber?.replace(/\D/g, '') ?? '';
    const text = encodeURIComponent(
      `Hola ${entry.store.name}, te contactamos para recordarte que tu publicidad patrocinada en la plataforma está próxima a vencer. Por favor, comunícate con nosotros para renovarla. ¡Gracias!`,
    );
    return `https://wa.me/${num}?text=${text}`;
  };

  // Suppress unused warning — loadDashboard exposed for manual refresh
  void loadDashboard;

  return (
    <div className='space-y-6 animate-fade-up'>
      {/* ── Header ── */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-lg sm:px-10'>
        <div className='pointer-events-none absolute inset-0 opacity-10' aria-hidden='true' />
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Monetización</p>
        <h1 className='mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl'>Publicidad patrocinada</h1>
        <p className='mt-2 text-sm text-white/70'>
          Gestiona los pagos de publicidad y visibilidad destacada de cada tienda.
        </p>
      </div>

      {/* ── Global error ── */}
      {error ? (
        <div className='flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          <i className='bx bx-error-circle text-base' aria-hidden='true' /> {error}
        </div>
      ) : null}

      {/* ── Metric cards ── */}
      {loading ? (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='h-28 skeleton rounded-3xl' />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          <MetricCard
            label='Tiendas activas'
            value={String(overview?.activeAds ?? 0)}
            icon='bx-trophy'
            accent='text-amber-500'
          />
          <MetricCard
            label='Vencidas'
            value={String(overview?.expiredAds ?? 0)}
            icon='bx-time-five'
            accent='text-red-500'
          />
          <MetricCard
            label='Sin publicidad'
            value={String(overview?.neverPaid ?? 0)}
            icon='bx-minus-circle'
            accent='text-slate-400'
          />
          <MetricCard
            label='Vencen en 30 días'
            value={String(overview?.expiringIn30Days ?? 0)}
            icon='bx-alarm'
            accent='text-amber-500'
          />
          <MetricCard
            label='Este mes'
            value={formatCurrencyCOP(revenue?.thisMonthCollected ?? 0)}
            icon='bx-calendar-check'
            accent='text-primary'
          />
          <MetricCard
            label='Total recaudado'
            value={formatCurrencyCOP(revenue?.totalCollected ?? 0)}
            icon='bx-bar-chart-alt-2'
            accent='text-primary'
          />
        </div>
      )}

      {/* ── Stores table ── */}
      <div className='rounded-3xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <h2 className='text-base font-semibold text-slate-800'>
            Tiendas
            {!loading ? (
              <span className='ml-2 text-sm font-normal text-slate-400'>
                ({filteredStores.length})
              </span>
            ) : null}
          </h2>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar tienda...'
              className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 sm:w-52'
            />
            <div className='flex gap-1'>
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => setStatusFilter(opt.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === opt.value
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className='space-y-3 p-6'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-12 skeleton rounded-2xl' />
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className='flex flex-col items-center py-16 text-center'>
            <i className='bx bx-store mb-3 text-5xl text-slate-300' aria-hidden='true' />
            <p className='font-semibold text-slate-500'>No se encontraron tiendas</p>
            <p className='mt-1 text-sm text-slate-400'>Prueba cambiando el filtro o la búsqueda.</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/60 text-left'>
                  <th className='px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Tienda
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Estado
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Vence publicidad
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filteredStores.map((entry) => {
                  const days = daysUntil(entry.store.advertisingExpiresAt);
                  const isInactive = entry.status !== 'ACTIVE';
                  return (
                    <tr
                      key={entry.store.id}
                      className={`transition ${isInactive ? 'bg-slate-100/60 opacity-60' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className='px-6 py-4'>
                        <p className='font-medium text-slate-800'>{entry.store.name}</p>
                        <p className='text-xs text-slate-400'>{entry.store.slug}</p>
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            STATUS_CLASS[entry.status] ?? 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {STATUS_LABEL[entry.status] ?? entry.status}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='text-slate-700'>
                          {fmtDate(entry.store.advertisingExpiresAt)}
                        </span>
                        {days !== null && days >= 0 && days <= 14 ? (
                          <span className='ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700'>
                            {days === 0 ? 'Hoy' : `${days}d`}
                          </span>
                        ) : null}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            onClick={() => setRegisterTarget(entry)}
                            className='rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20'
                          >
                            Registrar pago
                          </button>
                          <button
                            type='button'
                            onClick={() => setHistoryTarget(entry)}
                            title='Ver historial de pagos'
                            className='flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700'
                          >
                            <i className='bx bx-history text-base' aria-hidden='true' />
                          </button>
                          {entry.store.whatsappNumber ? (
                            <a
                              href={buildWhatsappUrl(entry)}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100'
                              title='Contactar por WhatsApp'
                            >
                              <i className='bx bxl-whatsapp text-base' aria-hidden='true' />
                            </a>
                          ) : null}
                          {entry.status === 'ACTIVE' && entry.latestAdvertisement ? (
                            <button
                              type='button'
                              onClick={() => void handleCancel(entry)}
                              disabled={submitting}
                              className='rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50'
                            >
                              Cancelar publicidad
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Payment history panel ── */}
      {historyTarget ? (
        <StorePaymentHistoryPanel
          storeId={historyTarget.store.id}
          storeName={historyTarget.store.name}
          onClose={() => setHistoryTarget(null)}
        />
      ) : null}

      {/* ── Modal ── */}
      {registerTarget ? (
        <RegisterAdModal
          store={registerTarget}
          submitting={submitting}
          onClose={() => setRegisterTarget(null)}
          onSubmit={handleRegisterAdvertisement}
        />
      ) : null}
    </div>
  );
};

export default AdvertisingPage;
