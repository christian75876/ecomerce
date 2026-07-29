import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSubscriptionsManagement, StatusFilter } from '@/application/useCases/subscriptions/useSubscriptionsManagement';
import type {
  ISubscriptionPlan,
  IStoreWithSubscriptionStatus,
} from '@/application/dtos/subscriptions/SubscriptionResponse';
import type { IRegisterPaymentDto } from '@/infrastructure/repositories/api/subscriptions/SubscriptionsRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activa',
  EXPIRED: 'Vencida',
  NEVER: 'Sin pago',
};

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-red-100 text-red-700',
  NEVER: 'bg-slate-100 text-slate-500',
};

// ── RegisterPaymentModal ──────────────────────────────────────────────────────

interface RegisterPaymentModalProps {
  store: IStoreWithSubscriptionStatus;
  plans: ISubscriptionPlan[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (dto: IRegisterPaymentDto) => Promise<void>;
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Efectivo', icon: 'bx-money' },
  { value: 'TRANSFER', label: 'Transferencia', icon: 'bx-transfer' },
  { value: 'OTHER', label: 'Otro', icon: 'bx-dots-horizontal' },
] as const;

const RegisterPaymentModal = ({
  store,
  plans,
  submitting,
  onClose,
  onSubmit,
}: RegisterPaymentModalProps) => {
  const activePlans = plans.filter((p) => p.isActive);
  const [planId, setPlanId] = useState(activePlans[0]?.id ?? '');
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(() => {
    const plan = activePlans[0];
    return plan ? addDays(todayIso(), plan.durationDays) : todayIso();
  });
  const [paidAmount, setPaidAmount] = useState<number>(activePlans[0]?.priceMonthly ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'OTHER'>('CASH');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.id === planId);
  const endBeforeStart = endDate < startDate;

  const handlePlanSelect = (id: string) => {
    setPlanId(id);
    const plan = plans.find((p) => p.id === id);
    if (plan) {
      setEndDate(addDays(startDate, plan.durationDays));
      setPaidAmount(plan.priceMonthly);
    }
    setLocalError(null);
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (selectedPlan) {
      setEndDate(addDays(date, selectedPlan.durationDays));
    }
    setLocalError(null);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) { setLocalError('Selecciona un plan para continuar'); return; }
    if (endBeforeStart) { setLocalError('La fecha de fin no puede ser anterior a la de inicio'); return; }
    if (endDate === startDate) { setLocalError('La fecha de fin debe ser posterior a la de inicio'); return; }
    setLocalError(null);
    await onSubmit({
      storeId: store.store.id,
      planId,
      startDate,
      endDate,
      paidAmount,
      paymentMethod,
      notes: notes.trim() || undefined,
      status: 'ACTIVE',
    });
  };

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm'
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className='relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-slate-100 px-6 py-5'>
          <div>
            <h2 className='text-lg font-bold text-slate-800'>Registrar pago</h2>
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

            {/* ── Plan cards ── */}
            <div>
              <label className='mb-2.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Plan de suscripción
              </label>
              {activePlans.length === 0 ? (
                <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
                  No hay planes activos configurados.
                </div>
              ) : (
                <div className='grid gap-2.5 sm:grid-cols-2'>
                  {activePlans.map((plan) => {
                    const selected = plan.id === planId;
                    return (
                      <button
                        key={plan.id}
                        type='button'
                        onClick={() => handlePlanSelect(plan.id)}
                        className={`rounded-2xl border-2 p-3.5 text-left transition-all ${
                          selected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50'
                        }`}
                      >
                        <div className='flex items-start justify-between gap-2'>
                          <p className={`text-sm font-bold leading-tight ${selected ? 'text-primary' : 'text-slate-800'}`}>
                            {plan.name}
                          </p>
                          {selected ? (
                            <i className='bx bx-check-circle flex-shrink-0 text-lg text-primary' aria-hidden='true' />
                          ) : null}
                        </div>
                        {plan.description ? (
                          <p className='mt-0.5 text-xs text-slate-400 line-clamp-1'>{plan.description}</p>
                        ) : null}
                        <div className='mt-2 flex items-center gap-1.5'>
                          <span className={`text-base font-extrabold ${selected ? 'text-primary' : 'text-slate-700'}`}>
                            {formatCurrencyCOP(plan.priceMonthly)}
                          </span>
                          <span className='text-xs text-slate-400'>· {plan.durationDays} días</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

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
            {!endBeforeStart && startDate && endDate && endDate > startDate ? (
              <div className='flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5 text-sm text-slate-600'>
                <i className='bx bx-calendar-check text-base text-primary' aria-hidden='true' />
                <span>
                  {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)} días de cobertura —{' '}
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
              disabled={submitting || !planId || endBeforeStart}
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

// ── EditPlanModal ─────────────────────────────────────────────────────────────

interface EditPlanModalProps {
  plan: ISubscriptionPlan;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (id: string, dto: Partial<ISubscriptionPlan>) => Promise<void>;
}

const EditPlanModal = ({ plan, submitting, onClose, onSubmit }: EditPlanModalProps) => {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description ?? '');
  const [priceMonthly, setPriceMonthly] = useState(plan.priceMonthly);
  const [durationDays, setDurationDays] = useState(plan.durationDays);
  const [isActive, setIsActive] = useState(plan.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(plan.id, {
      name,
      description: description || null,
      priceMonthly,
      durationDays,
      isActive,
    });
  };

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm'
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className='relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl'>
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        >
          <i className='bx bx-x text-xl' aria-hidden='true' />
        </button>

        <h2 className='mb-5 text-lg font-bold text-slate-800'>Editar plan</h2>

        <form onSubmit={(e) => void handleSubmit(e)} className='space-y-4'>
          <div>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Nombre
            </label>
            <input
              type='text'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
            />
          </div>

          <div>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Descripción
            </label>
            <input
              type='text'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Descripción opcional...'
              className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Precio (COP)
              </label>
              <input
                type='number'
                min={0}
                step={1000}
                required
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(Number(e.target.value))}
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              />
            </div>
            <div>
              <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Duración (días)
              </label>
              <input
                type='number'
                min={1}
                required
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              />
            </div>
          </div>

          <div className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
            <input
              type='checkbox'
              id='plan-active'
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className='h-4 w-4 rounded accent-primary'
            />
            <label htmlFor='plan-active' className='text-sm font-medium text-slate-700'>
              Plan activo (visible para asignación)
            </label>
          </div>

          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='flex-1 rounded-2xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
            >
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
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

// ── SubscriptionsPage ─────────────────────────────────────────────────────────

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Activa', value: 'ACTIVE' },
  { label: 'Vencida', value: 'EXPIRED' },
  { label: 'Sin pago', value: 'NEVER' },
];

const SubscriptionsPage = () => {
  const {
    dashboard,
    plans,
    loading,
    submitting,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredStores,
    registerPayment,
    cancelSubscription,
    updatePlan,
    loadDashboard,
  } = useSubscriptionsManagement();

  const [registerTarget, setRegisterTarget] = useState<IStoreWithSubscriptionStatus | null>(null);
  const [editPlan, setEditPlan] = useState<ISubscriptionPlan | null>(null);
  const [togglingStoreId, setTogglingStoreId] = useState<string | null>(null);
  const [toggleTarget, setToggleTarget] = useState<IStoreWithSubscriptionStatus | null>(null);

  const overview = dashboard?.overview;
  const revenue = dashboard?.revenue;

  const handleRegisterPayment = async (dto: IRegisterPaymentDto) => {
    await registerPayment(dto);
    setRegisterTarget(null);
  };

  const handleUpdatePlan = async (id: string, dto: Partial<ISubscriptionPlan>) => {
    await updatePlan(id, dto);
    setEditPlan(null);
  };

  const handleCancel = async (entry: IStoreWithSubscriptionStatus) => {
    const sub = entry.latestSubscription;
    if (!sub) return;
    if (!window.confirm(`¿Suspender la suscripción de "${entry.store.name}"?`)) return;
    await cancelSubscription(sub.id);
  };

  const confirmToggleStoreActive = async (entry: IStoreWithSubscriptionStatus) => {
    setToggleTarget(null);
    const next = !entry.store.isActive;
    setTogglingStoreId(entry.store.id);
    try {
      await StoresRepository.updateStore(entry.store.id, { isActive: next });
      await loadDashboard();
    } catch {
      // error will surface via dashboard reload failure
    } finally {
      setTogglingStoreId(null);
    }
  };

  const buildWhatsappUrl = (entry: IStoreWithSubscriptionStatus) => {
    const num = entry.store.whatsappNumber?.replace(/\D/g, '') ?? '';
    const text = encodeURIComponent(
      `Hola ${entry.store.name}, te contactamos para recordarte que tu suscripción en la plataforma está próxima a vencer. Por favor, comunícate con nosotros para renovarla. ¡Gracias!`,
    );
    return `https://wa.me/${num}?text=${text}`;
  };

  return (
    <div className='space-y-6 animate-fade-up'>
      {/* ── Header ── */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-lg sm:px-10'>
        <div className='pointer-events-none absolute inset-0 opacity-10' aria-hidden='true' />
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Monetización</p>
        <h1 className='mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl'>Suscripciones</h1>
        <p className='mt-2 text-sm text-white/70'>
          Gestiona los planes, pagos y acceso de cada tienda en la plataforma.
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
            value={String(overview?.activeSubscriptions ?? 0)}
            icon='bx-check-circle'
            accent='text-emerald-500'
          />
          <MetricCard
            label='Vencidas'
            value={String(overview?.expiredSubscriptions ?? 0)}
            icon='bx-time-five'
            accent='text-red-500'
          />
          <MetricCard
            label='Sin pago'
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
            label='MRR'
            value={formatCurrencyCOP(revenue?.mrr ?? 0)}
            icon='bx-trending-up'
            accent='text-primary'
          />
          <MetricCard
            label='ARR'
            value={formatCurrencyCOP(revenue?.arr ?? 0)}
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
                    Vence
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Plan activo
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filteredStores.map((entry) => {
                  const days = daysUntil(entry.store.subscriptionExpiresAt);
                  const planName = entry.latestSubscription?.plan?.name ?? '—';
                  const isInactive = !entry.store.isActive;
                  return (
                    <tr key={entry.store.id} className={`transition ${isInactive ? 'bg-slate-100/60 opacity-60' : 'hover:bg-slate-50/50'}`}>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium text-slate-800'>{entry.store.name}</p>
                          {isInactive ? (
                            <span className='inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600'>
                              DESACTIVADA
                            </span>
                          ) : null}
                        </div>
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
                          {fmtDate(entry.store.subscriptionExpiresAt)}
                        </span>
                        {days !== null && days >= 0 && days <= 14 ? (
                          <span className='ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700'>
                            {days === 0 ? 'Hoy' : `${days}d`}
                          </span>
                        ) : null}
                      </td>
                      <td className='px-6 py-4 text-slate-600'>{planName}</td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            onClick={() => setRegisterTarget(entry)}
                            className='rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20'
                          >
                            Registrar pago
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
                          {entry.status === 'ACTIVE' && entry.latestSubscription ? (
                            <button
                              type='button'
                              onClick={() => void handleCancel(entry)}
                              disabled={submitting}
                              className='rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50'
                            >
                              Suspender
                            </button>
                          ) : null}
                          <button
                            type='button'
                            onClick={() => setToggleTarget(entry)}
                            disabled={togglingStoreId === entry.store.id}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                              entry.store.isActive
                                ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {togglingStoreId === entry.store.id ? '...' : entry.store.isActive ? 'Desactivar' : 'Activar'}
                          </button>
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

      {/* ── Plans section ── */}
      <div className='rounded-3xl border border-slate-200 bg-white shadow-sm'>
        <div className='border-b border-slate-100 px-6 py-4'>
          <h2 className='text-base font-semibold text-slate-800'>Planes de suscripción</h2>
        </div>

        {loading ? (
          <div className='grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-32 skeleton rounded-2xl' />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className='flex flex-col items-center py-12 text-center'>
            <i className='bx bx-credit-card mb-3 text-5xl text-slate-300' aria-hidden='true' />
            <p className='font-semibold text-slate-500'>No hay planes configurados</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3'>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 ${
                  plan.isActive
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    <p className='font-bold text-slate-800'>{plan.name}</p>
                    {plan.description ? (
                      <p className='mt-0.5 text-xs text-slate-500'>{plan.description}</p>
                    ) : null}
                  </div>
                  {!plan.isActive ? (
                    <span className='flex-shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500'>
                      Inactivo
                    </span>
                  ) : null}
                </div>
                <p className='mt-3 text-xl font-extrabold text-primary'>
                  {formatCurrencyCOP(plan.priceMonthly)}
                </p>
                <p className='text-xs text-slate-400'>{plan.durationDays} días de acceso</p>
                <button
                  type='button'
                  onClick={() => setEditPlan(plan)}
                  className='mt-4 w-full rounded-xl border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {registerTarget ? (
        <RegisterPaymentModal
          store={registerTarget}
          plans={plans}
          submitting={submitting}
          onClose={() => setRegisterTarget(null)}
          onSubmit={handleRegisterPayment}
        />
      ) : null}

      {editPlan ? (
        <EditPlanModal
          plan={editPlan}
          submitting={submitting}
          onClose={() => setEditPlan(null)}
          onSubmit={handleUpdatePlan}
        />
      ) : null}

      {toggleTarget
        ? createPortal(
            <div
              className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm'
              onClick={() => setToggleTarget(null)}
            >
              <div
                className='w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl'
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${toggleTarget.store.isActive ? 'bg-red-100' : 'bg-emerald-100'}`}>
                  <i className={`bx text-2xl ${toggleTarget.store.isActive ? 'bx-power-off text-red-500' : 'bx-check-circle text-emerald-600'}`} aria-hidden='true' />
                </div>
                <h2 className='text-lg font-bold text-slate-800'>
                  {toggleTarget.store.isActive ? 'Desactivar tienda' : 'Activar tienda'}
                </h2>
                <p className='mt-2 text-sm text-slate-500'>
                  {toggleTarget.store.isActive ? (
                    <>La tienda <span className='font-semibold text-slate-700'>"{toggleTarget.store.name}"</span> dejará de ser visible en el marketplace inmediatamente.</>
                  ) : (
                    <>La tienda <span className='font-semibold text-slate-700'>"{toggleTarget.store.name}"</span> volverá a ser visible en el marketplace.</>
                  )}
                </p>
                <div className='mt-6 flex flex-col gap-2'>
                  <button
                    type='button'
                    onClick={() => void confirmToggleStoreActive(toggleTarget)}
                    className={`w-full rounded-2xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 ${toggleTarget.store.isActive ? 'bg-red-500' : 'bg-emerald-500'}`}
                  >
                    {toggleTarget.store.isActive ? 'Sí, desactivar' : 'Sí, activar'}
                  </button>
                  <button
                    type='button'
                    onClick={() => setToggleTarget(null)}
                    className='w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default SubscriptionsPage;
