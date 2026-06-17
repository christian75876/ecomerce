import { useCallback, useEffect, useState } from 'react';
import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';
import { useAdminSubscriptionDashboard } from '@/application/useCases/subscriptions/useAdminSubscriptionDashboard';
import type { ISubscriptionPlan } from '@/application/dtos/subscriptions/response/SubscriptionResponse';
import type { IAdminStore, StoreSubscriptionStatus } from '@/application/dtos/stores/response/StoreResponse';
import { SubscriptionsRepository } from '@/infrastructure/repositories/api/subscriptions/SubscriptionsRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// ── Status badge ──────────────────────────────────────────────────────────────
const SUB_STATUS: Record<StoreSubscriptionStatus, { label: string; cls: string }> = {
  ACTIVE:  { label: 'Al día',        cls: 'bg-emerald-100 text-emerald-700' },
  EXPIRED: { label: 'Vencida',       cls: 'bg-red-100 text-red-600' },
  NEVER:   { label: 'Sin pago',      cls: 'bg-slate-100 text-slate-500' },
};

// ── Plan Card ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, onEdit }: { plan: ISubscriptionPlan; onEdit: (p: ISubscriptionPlan) => void }) => (
  <Box className='flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-white p-5'>
    <Box className='flex items-start justify-between gap-2'>
      <Box>
        <Typography className='font-bold text-neutral-dark'>{plan.name}</Typography>
        {plan.description ? (
          <Typography className='mt-0.5 text-xs text-slate-500'>{plan.description}</Typography>
        ) : null}
      </Box>
      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
        {plan.isActive ? 'Activo' : 'Inactivo'}
      </span>
    </Box>
    <Box className='flex items-end gap-1'>
      <Typography className='text-2xl font-bold text-primary'>{fmt(Number(plan.priceMonthly))}</Typography>
      <Typography className='mb-0.5 text-xs text-slate-500'>/ {plan.durationDays} días</Typography>
    </Box>
    <button
      onClick={() => onEdit(plan)}
      className='mt-auto rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50'
    >
      Editar plan
    </button>
  </Box>
);

// ── Plan Form Modal ───────────────────────────────────────────────────────────
const PlanFormModal = ({ plan, onClose, onSaved }: { plan: Partial<ISubscriptionPlan> | null; onClose: () => void; onSaved: () => void }) => {
  const isEdit = !!(plan?.id);
  const [form, setForm] = useState({
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    priceMonthly: plan?.priceMonthly ? String(plan.priceMonthly) : '',
    durationDays: plan?.durationDays ? String(plan.durationDays) : '30',
    isActive: plan?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form.name.trim() || !form.priceMonthly) { setError('Nombre y precio son obligatorios'); return; }
    setSaving(true); setError(null);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() || undefined, priceMonthly: Number(form.priceMonthly), durationDays: Number(form.durationDays), isActive: form.isActive };
      if (isEdit && plan?.id) { await SubscriptionsRepository.updatePlan(plan.id, payload); }
      else { await SubscriptionsRepository.createPlan(payload); }
      onSaved(); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'Error al guardar'); }
    finally { setSaving(false); }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm'>
      <Box className='w-full max-w-md rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-2xl'>
        <Box className='mb-5 flex items-center justify-between'>
          <Typography variant='h3' className='text-lg font-bold'>{isEdit ? 'Editar plan' : 'Nuevo plan'}</Typography>
          <button onClick={onClose} className='flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100'><i className='bx bx-x text-xl' /></button>
        </Box>
        <Box className='space-y-4'>
          <Box>
            <label className='mb-1 block text-xs font-semibold text-slate-600'>Nombre</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none' placeholder='Básico, Estándar, Premium…' />
          </Box>
          <Box>
            <label className='mb-1 block text-xs font-semibold text-slate-600'>Descripción</label>
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none' placeholder='Descripción breve…' />
          </Box>
          <Box className='grid grid-cols-2 gap-3'>
            <Box>
              <label className='mb-1 block text-xs font-semibold text-slate-600'>Precio mensual</label>
              <input type='number' min='0' value={form.priceMonthly} onChange={(e) => setForm((p) => ({ ...p, priceMonthly: e.target.value }))} className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none' placeholder='50000' />
            </Box>
            <Box>
              <label className='mb-1 block text-xs font-semibold text-slate-600'>Duración (días)</label>
              <input type='number' min='1' value={form.durationDays} onChange={(e) => setForm((p) => ({ ...p, durationDays: e.target.value }))} className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none' />
            </Box>
          </Box>
          <Box className='flex items-center gap-3'>
            <input type='checkbox' id='isActive' checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className='h-4 w-4 rounded accent-primary' />
            <label htmlFor='isActive' className='text-sm font-medium text-slate-700'>Plan activo</label>
          </Box>
          {error ? <Box className='rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600'>{error}</Box> : null}
          <Box className='flex gap-3 pt-2'>
            <button onClick={onClose} className='flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50'>Cancelar</button>
            <button onClick={save} disabled={saving} className='flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60'>{saving ? 'Guardando…' : 'Guardar'}</button>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

// ── Stores Table ──────────────────────────────────────────────────────────────
const STORES_PER_PAGE = 15;

const StoresTable = () => {
  const [stores, setStores] = useState<IAdminStore[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await StoresRepository.getAdminStores({ page: p, limit: STORES_PER_PAGE, search: search || undefined, status: status || undefined });
      setStores(res.data.items);
      setPage(res.data.pagination.currentPage);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.totalItems);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { void load(1); }, [load]);

  const toggle = async (store: IAdminStore, field: 'isActive' | 'isPremiumAdvertiser') => {
    setToggling(store.id + field);
    try {
      await StoresRepository.updateStore(store.id, { [field]: !store[field] });
      await load(page);
    } finally {
      setToggling(null);
    }
  };

  return (
    <Box className='space-y-4'>
      {/* Filters */}
      <Box className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscar tienda…'
          className='flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary/40 focus:outline-none'
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className='rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary/40 focus:outline-none'
        >
          <option value=''>Todas</option>
          <option value='active'>Activas</option>
          <option value='inactive'>Bloqueadas</option>
        </select>
        <Typography className='whitespace-nowrap text-xs text-slate-400'>{totalItems} tiendas</Typography>
      </Box>

      {/* Table */}
      <Box className='overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead className='border-b border-slate-200 bg-slate-50'>
              <tr>
                <th className='px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Tienda</th>
                <th className='px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Suscripción</th>
                <th className='px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Vence</th>
                <th className='px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500'>Estado</th>
                <th className='px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500'>Publicidad</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {loading ? (
                <tr><td colSpan={5} className='px-5 py-10 text-center text-sm text-slate-400'>Cargando…</td></tr>
              ) : stores.length === 0 ? (
                <tr><td colSpan={5} className='px-5 py-10 text-center text-sm text-slate-400'>No hay tiendas</td></tr>
              ) : stores.map((store) => {
                const sub = SUB_STATUS[store.subscriptionStatus];
                const isTogglingActive = toggling === store.id + 'isActive';
                const isTogglingPremium = toggling === store.id + 'isPremiumAdvertiser';
                return (
                  <tr key={store.id} className={`transition-colors hover:bg-slate-50 ${!store.isActive ? 'opacity-60' : ''}`}>
                    <td className='px-5 py-3.5'>
                      <Box className='flex items-center gap-3'>
                        {store.logoUrl ? (
                          <img src={store.logoUrl} alt='' className='h-8 w-8 rounded-lg object-cover' />
                        ) : (
                          <Box className='flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400'>
                            <i className='bx bx-store text-base' />
                          </Box>
                        )}
                        <Box>
                          <Typography className='font-semibold text-neutral-dark'>{store.name}</Typography>
                          <Typography className='text-xs text-slate-400'>{store.slug}</Typography>
                        </Box>
                      </Box>
                    </td>
                    <td className='px-5 py-3.5'>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${sub.cls}`}>
                        {sub.label}
                      </span>
                    </td>
                    <td className='px-5 py-3.5 text-xs text-slate-500'>
                      {store.subscriptionExpiresAt
                        ? new Date(store.subscriptionExpiresAt).toLocaleDateString('es-CO')
                        : '—'}
                    </td>
                    <td className='px-5 py-3.5 text-center'>
                      <button
                        onClick={() => toggle(store, 'isActive')}
                        disabled={isTogglingActive}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                          store.isActive
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-600'
                            : 'bg-red-100 text-red-600 hover:bg-emerald-100 hover:text-emerald-700'
                        }`}
                      >
                        {isTogglingActive ? (
                          <i className='bx bx-loader-alt animate-spin text-sm' />
                        ) : (
                          <i className={`bx ${store.isActive ? 'bx-check-circle' : 'bx-block'} text-sm`} />
                        )}
                        {store.isActive ? 'Activa' : 'Bloqueada'}
                      </button>
                    </td>
                    <td className='px-5 py-3.5 text-center'>
                      <button
                        onClick={() => toggle(store, 'isPremiumAdvertiser')}
                        disabled={isTogglingPremium || !store.isActive}
                        title={!store.isActive ? 'La tienda está bloqueada' : undefined}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-40 ${
                          store.isPremiumAdvertiser
                            ? 'bg-amber-100 text-amber-700 hover:bg-slate-100 hover:text-slate-500'
                            : 'bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-700'
                        }`}
                      >
                        {isTogglingPremium ? (
                          <i className='bx bx-loader-alt animate-spin text-sm' />
                        ) : (
                          <i className={`bx ${store.isPremiumAdvertiser ? 'bxs-star' : 'bx-star'} text-sm`} />
                        )}
                        {store.isPremiumAdvertiser ? 'Publicidad' : 'Sin publicidad'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <Box className='flex items-center justify-between border-t border-slate-200 px-5 py-3'>
            <Typography className='text-xs text-slate-400'>Página {page} de {totalPages}</Typography>
            <Box className='flex gap-2'>
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1 || loading}
                className='flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40'
              >
                <i className='bx bx-chevron-left text-base' />
              </button>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= totalPages || loading}
                className='flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40'
              >
                <i className='bx bx-chevron-right text-base' />
              </button>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
type Tab = 'stores' | 'plans';

const SubscriptionsPage = () => {
  const { plans, dashboard, load } = useAdminSubscriptionDashboard();
  const [tab, setTab] = useState<Tab>('stores');
  const [editingPlan, setEditingPlan] = useState<Partial<ISubscriptionPlan> | null | false>(false);

  return (
    <Box className='space-y-6'>
      {/* Header */}
      <Box className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <Box>
          <Typography variant='h1' className='text-3xl font-bold text-neutral-dark md:text-4xl'>
            Tiendas y suscripciones
          </Typography>
          <Typography className='mt-1.5 text-neutral-dark/60'>
            Gestiona el acceso, publicidad y planes de las tiendas.
          </Typography>
        </Box>
        {tab === 'plans' ? (
          <button
            onClick={() => setEditingPlan({})}
            className='flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90'
          >
            <i className='bx bx-plus text-base' /> Nuevo plan
          </button>
        ) : null}
      </Box>

      {/* Stats */}
      {dashboard ? (
        <Box className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {[
            { label: 'Total tiendas',    value: dashboard.overview.totalStores,          color: 'text-neutral-dark' },
            { label: 'Al día',           value: dashboard.overview.activeSubscriptions,  color: 'text-emerald-600' },
            { label: 'Vencidas',         value: dashboard.overview.expiredSubscriptions, color: 'text-red-500' },
            { label: 'Sin suscripción',  value: dashboard.overview.neverPaid,            color: 'text-slate-400' },
          ].map((s) => (
            <Box key={s.label} className='rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4 text-center'>
              <Typography className={`text-2xl font-bold ${s.color}`}>{s.value}</Typography>
              <Typography className='mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500'>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      ) : null}

      {/* Tabs */}
      <Box className='flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit'>
        {([['stores', 'bx-store', 'Tiendas'], ['plans', 'bx-credit-card', 'Planes']] as const).map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={`bx ${icon} text-base`} />
            {label}
          </button>
        ))}
      </Box>

      {/* Tab content */}
      {tab === 'stores' ? <StoresTable /> : (
        <Box>
          <Typography variant='h3' className='mb-4 font-bold text-neutral-dark'>Planes configurados</Typography>
          {plans.length === 0 ? (
            <Box className='flex min-h-[180px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50'>
              <Typography className='text-sm text-slate-400'>No hay planes configurados aún</Typography>
            </Box>
          ) : (
            <Box className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onEdit={(p) => setEditingPlan(p)} />
              ))}
            </Box>
          )}
        </Box>
      )}

      {editingPlan !== false ? (
        <PlanFormModal plan={editingPlan} onClose={() => setEditingPlan(false)} onSaved={load} />
      ) : null}
    </Box>
  );
};

export default SubscriptionsPage;
