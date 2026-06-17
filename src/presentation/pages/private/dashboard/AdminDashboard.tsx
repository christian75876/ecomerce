import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';
import { useAdminSubscriptionDashboard } from '@/application/useCases/subscriptions/useAdminSubscriptionDashboard';
import type { IStoreWithSubscriptionStatus } from '@/application/dtos/subscriptions/response/SubscriptionResponse';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return fmt(n);
};

const STATUS_CONFIG = {
  ACTIVE:  { label: 'Activa',           bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  EXPIRED: { label: 'Vencida',          bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
  NEVER:   { label: 'Sin suscripción',  bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400'   },
} as const;

const PIE_COLORS = ['#10b981', '#ef4444', '#94a3b8'];

// ── Sub-components ────────────────────────────────────────────────────────────
const KpiCard = ({
  label, value, sub, icon, accent = false,
}: { label: string; value: string; sub?: string; icon: string; accent?: boolean }) => (
  <Box className={`flex flex-col gap-3 rounded-[1.35rem] border p-5 ${accent ? 'border-primary/30 bg-primary/5' : 'border-slate-200 bg-white'}`}>
    <Box className='flex items-center justify-between'>
      <Typography className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{label}</Typography>
      <Box className={`flex h-8 w-8 items-center justify-center rounded-xl ${accent ? 'bg-primary/10' : 'bg-slate-100'}`}>
        <i className={`bx ${icon} text-base ${accent ? 'text-primary' : 'text-slate-500'}`} />
      </Box>
    </Box>
    <Typography className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-neutral-dark'}`}>{value}</Typography>
    {sub ? <Typography className='text-xs text-slate-500'>{sub}</Typography> : null}
  </Box>
);

const StatusBadge = ({ status }: { status: 'ACTIVE' | 'EXPIRED' | 'NEVER' }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ── Register Payment Modal ────────────────────────────────────────────────────
const RegisterPaymentModal = ({
  form, plans, stores, error, submitting, onChange, onSubmit, onClose,
}: {
  form: ReturnType<typeof useAdminSubscriptionDashboard>['registerForm'];
  plans: ReturnType<typeof useAdminSubscriptionDashboard>['plans'];
  stores: IStoreWithSubscriptionStatus[];
  error: string | null;
  submitting: boolean;
  onChange: (k: string, v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm'>
    <Box className='w-full max-w-md rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-2xl'>
      <Box className='mb-5 flex items-center justify-between'>
        <Typography variant='h3' className='text-lg font-bold text-neutral-dark'>Registrar pago</Typography>
        <button onClick={onClose} className='flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600'>
          <i className='bx bx-x text-xl' />
        </button>
      </Box>

      <Box className='space-y-4'>
        {/* Store */}
        <Box>
          <label className='mb-1 block text-xs font-semibold text-slate-600'>Tienda</label>
          <select
            value={form.storeId}
            onChange={(e) => onChange('storeId', e.target.value)}
            className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20'
          >
            <option value=''>Seleccionar tienda…</option>
            {stores.map((item) => (
              <option key={item.store.id} value={item.store.id}>{item.store.name}</option>
            ))}
          </select>
        </Box>

        {/* Plan */}
        <Box>
          <label className='mb-1 block text-xs font-semibold text-slate-600'>Plan</label>
          <select
            value={form.planId}
            onChange={(e) => onChange('planId', e.target.value)}
            className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20'
          >
            <option value=''>Seleccionar plan…</option>
            {plans.filter((p) => p.isActive).map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {fmt(Number(p.priceMonthly))}/mes</option>
            ))}
          </select>
        </Box>

        {/* Dates */}
        <Box className='grid grid-cols-2 gap-3'>
          <Box>
            <label className='mb-1 block text-xs font-semibold text-slate-600'>Inicio</label>
            <input
              type='date' value={form.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
              className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20'
            />
          </Box>
          <Box>
            <label className='mb-1 block text-xs font-semibold text-slate-600'>Vence</label>
            <input
              type='date' value={form.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
              className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20'
            />
          </Box>
        </Box>

        {/* Amount + Method */}
        <Box className='grid grid-cols-2 gap-3'>
          <Box>
            <label className='mb-1 block text-xs font-semibold text-slate-600'>Monto pagado</label>
            <input
              type='number' min='0' value={form.paidAmount}
              onChange={(e) => onChange('paidAmount', e.target.value)}
              placeholder='0'
              className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20'
            />
          </Box>
          <Box>
            <label className='mb-1 block text-xs font-semibold text-slate-600'>Método</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => onChange('paymentMethod', e.target.value)}
              className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20'
            >
              <option value='CASH'>Efectivo</option>
              <option value='TRANSFER'>Transferencia</option>
              <option value='OTHER'>Otro</option>
            </select>
          </Box>
        </Box>

        {/* Notes */}
        <Box>
          <label className='mb-1 block text-xs font-semibold text-slate-600'>Notas (opcional)</label>
          <input
            type='text' value={form.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder='Referencia, número de transferencia…'
            className='w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20'
          />
        </Box>

        {error ? (
          <Box className='rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600'>{error}</Box>
        ) : null}

        <Box className='flex gap-3 pt-2'>
          <button
            onClick={onClose}
            className='flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50'
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className='flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60'
          >
            {submitting ? 'Guardando…' : 'Registrar pago'}
          </button>
        </Box>
      </Box>
    </Box>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const {
    dashboard, plans, loading, error,
    submitting, showRegisterModal, registerForm, registerError,
    storeSearch, statusFilter, filteredStores,
    openRegisterModal, closeRegisterModal,
    updateRegisterForm, submitRegisterPayment,
    setStoreSearch, setStatusFilter,
  } = useAdminSubscriptionDashboard();

  const [activeTab, setActiveTab] = useState<'stores' | 'payments'>('stores');

  if (loading) {
    return (
      <Box className='flex min-h-[60vh] flex-col items-center justify-center gap-5'>
        <div className='relative h-14 w-14'>
          <div className='absolute inset-0 rounded-full border-4 border-primary/15' />
          <div className='absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent' />
        </div>
        <Typography className='text-neutral-dark/60'>Cargando plataforma…</Typography>
      </Box>
    );
  }

  if (error || !dashboard) {
    return (
      <Box className='flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-[1.8rem] border border-red-200 bg-red-50 px-8 py-10 text-center'>
        <Typography variant='h3' className='text-red-700'>{error ?? 'Error al cargar'}</Typography>
        <Typography className='text-sm text-red-500'>Verifica la conexión e intenta de nuevo.</Typography>
      </Box>
    );
  }

  const { overview, revenue, revenueByMonth, recentPayments, storesWithStatus } = dashboard;
  const growth = revenue.growthVsLastMonth;

  // Pie chart data
  const pieData = [
    { name: 'Activas', value: overview.activeSubscriptions },
    { name: 'Vencidas', value: overview.expiredSubscriptions },
    { name: 'Sin suscripción', value: overview.neverPaid },
  ].filter((d) => d.value > 0);

  const exportCsv = () => {
    const rows = [
      ['Tienda', 'Estado', 'Plan', 'Vence', 'Último pago'],
      ...storesWithStatus.map((item) => [
        item.store.name,
        STATUS_CONFIG[item.status].label,
        item.latestSubscription?.plan?.name ?? '—',
        item.store.subscriptionExpiresAt
          ? new Date(item.store.subscriptionExpiresAt).toLocaleDateString('es-CO')
          : '—',
        item.latestSubscription ? fmt(Number(item.latestSubscription.paidAmount)) : '—',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suscripciones-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box className='space-y-6'>
      {/* Header */}
      <Box className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <Box>
          <Typography variant='h1' className='text-3xl font-bold text-neutral-dark md:text-4xl'>
            Panel de plataforma
          </Typography>
          <Typography className='mt-1.5 text-neutral-dark/60'>
            Gestión de suscripciones, ingresos recurrentes y estado de tiendas.
          </Typography>
        </Box>
        <Box className='flex gap-2'>
          <button
            onClick={exportCsv}
            className='flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50'
          >
            <i className='bx bx-export text-base' /> Exportar CSV
          </button>
          <button
            onClick={() => openRegisterModal()}
            className='flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary/90'
          >
            <i className='bx bx-plus text-base' /> Registrar pago
          </button>
        </Box>
      </Box>

      {/* KPI Row */}
      <Box className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <KpiCard
          label='MRR'
          value={fmtShort(revenue.mrr)}
          sub={`ARR ${fmtShort(revenue.arr)}`}
          icon='bx-trending-up'
          accent
        />
        <KpiCard
          label='Este mes'
          value={fmtShort(revenue.thisMonthCollected)}
          sub={growth !== 0
            ? `${growth > 0 ? '+' : ''}${growth}% vs mes anterior`
            : 'Sin cambio vs mes anterior'}
          icon='bx-calendar-check'
        />
        <KpiCard
          label='Suscripciones activas'
          value={String(overview.activeSubscriptions)}
          sub={`${overview.premiumAdvertisers} premium`}
          icon='bx-check-shield'
        />
        <KpiCard
          label='Pendientes de pago'
          value={String(overview.expiredSubscriptions + overview.neverPaid)}
          sub={`${overview.expiringIn14Days} vencen en 14 días`}
          icon='bx-error-circle'
        />
      </Box>

      {/* Secondary KPI row */}
      <Box className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <Box className='rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4 text-center'>
          <Typography className='text-2xl font-bold text-neutral-dark'>{overview.totalStores}</Typography>
          <Typography className='mt-0.5 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Tiendas total</Typography>
        </Box>
        <Box className='rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4 text-center'>
          <Typography className='text-2xl font-bold text-emerald-600'>{overview.activeSubscriptions}</Typography>
          <Typography className='mt-0.5 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Activas</Typography>
        </Box>
        <Box className='rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4 text-center'>
          <Typography className='text-2xl font-bold text-red-500'>{overview.expiredSubscriptions}</Typography>
          <Typography className='mt-0.5 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Vencidas</Typography>
        </Box>
        <Box className='rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4 text-center'>
          <Typography className='text-2xl font-bold text-slate-400'>{overview.neverPaid}</Typography>
          <Typography className='mt-0.5 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Sin suscripción</Typography>
        </Box>
      </Box>

      {/* Charts row */}
      <Box className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        {/* Revenue bar chart */}
        <Box className='xl:col-span-2 rounded-[1.5rem] border border-slate-200 bg-white p-5'>
          <Typography variant='h3' className='mb-1 font-bold text-neutral-dark'>Ingresos por mes</Typography>
          <Typography className='mb-4 text-sm text-slate-500'>Pagos registrados en los últimos 12 meses</Typography>
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={revenueByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
              <XAxis dataKey='label' tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => fmtShort(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [fmt(value), 'Ingresos']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Bar dataKey='amount' fill='#f97316' radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Pie distribution */}
        <Box className='rounded-[1.5rem] border border-slate-200 bg-white p-5'>
          <Typography variant='h3' className='mb-1 font-bold text-neutral-dark'>Distribución</Typography>
          <Typography className='mb-4 text-sm text-slate-500'>Estado actual de todas las tiendas</Typography>
          {pieData.length > 0 ? (
            <ResponsiveContainer width='100%' height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx='50%' cy='50%'
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey='value'
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Legend iconType='circle' iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box className='flex h-48 items-center justify-center text-slate-400'>
              <Typography className='text-sm'>Sin datos</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Tabs: Stores / Recent payments */}
      <Box className='rounded-[1.5rem] border border-slate-200 bg-white'>
        {/* Tab header */}
        <Box className='flex items-center justify-between border-b border-slate-100 px-5 py-4'>
          <Box className='flex gap-1 rounded-xl bg-slate-100 p-1'>
            {(['stores', 'payments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                  activeTab === tab ? 'bg-white text-neutral-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'stores' ? `Tiendas (${overview.totalStores})` : `Pagos recientes (${recentPayments.length})`}
              </button>
            ))}
          </Box>

          {activeTab === 'stores' ? (
            <Box className='flex items-center gap-2'>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className='rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none'
              >
                <option value='ALL'>Todos los estados</option>
                <option value='ACTIVE'>Activas</option>
                <option value='EXPIRED'>Vencidas</option>
                <option value='NEVER'>Sin suscripción</option>
              </select>
              <input
                type='text'
                placeholder='Buscar tienda…'
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                className='rounded-full border border-slate-200 px-3 py-1.5 text-xs focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20'
              />
            </Box>
          ) : null}
        </Box>

        {/* Tab: Stores */}
        {activeTab === 'stores' ? (
          <Box className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/50'>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Tienda</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Estado</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Plan</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Vence</th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>Último pago</th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-5 py-10 text-center text-sm text-slate-400'>
                      No hay tiendas que coincidan con el filtro
                    </td>
                  </tr>
                ) : filteredStores.map((item) => {
                  const expiresAt = item.store.subscriptionExpiresAt
                    ? new Date(item.store.subscriptionExpiresAt)
                    : null;
                  const isExpiringSoon =
                    expiresAt && item.status === 'ACTIVE' &&
                    expiresAt.getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000;

                  return (
                    <tr key={item.store.id} className='border-b border-slate-50 hover:bg-slate-50/60 transition-colors'>
                      <td className='px-5 py-3.5'>
                        <Box className='flex items-center gap-3'>
                          {item.store.logoUrl ? (
                            <img src={item.store.logoUrl} alt='' className='h-8 w-8 rounded-xl object-cover' />
                          ) : (
                            <Box className='flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400'>
                              <i className='bx bx-store text-sm' />
                            </Box>
                          )}
                          <Box>
                            <Typography className='text-sm font-semibold text-neutral-dark'>{item.store.name}</Typography>
                            <Typography className='text-xs text-slate-400 capitalize'>{item.store.storeType?.toLowerCase() ?? 'tienda'}</Typography>
                          </Box>
                        </Box>
                      </td>
                      <td className='px-4 py-3.5'>
                        <Box className='flex items-center gap-1.5'>
                          <StatusBadge status={item.status} />
                          {isExpiringSoon ? (
                            <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700'>Pronto a vencer</span>
                          ) : null}
                        </Box>
                      </td>
                      <td className='px-4 py-3.5 text-sm text-slate-600'>
                        {item.latestSubscription?.plan?.name ?? <span className='text-slate-400'>—</span>}
                      </td>
                      <td className='px-4 py-3.5 text-sm text-slate-600'>
                        {expiresAt ? (
                          <span className={item.status === 'EXPIRED' ? 'text-red-500 font-semibold' : ''}>
                            {expiresAt.toLocaleDateString('es-CO')}
                          </span>
                        ) : <span className='text-slate-400'>—</span>}
                      </td>
                      <td className='px-4 py-3.5 text-right text-sm font-semibold text-neutral-dark'>
                        {item.latestSubscription
                          ? fmt(Number(item.latestSubscription.paidAmount))
                          : <span className='font-normal text-slate-400'>—</span>}
                      </td>
                      <td className='px-4 py-3.5 text-right'>
                        <button
                          onClick={() => openRegisterModal(item.store.id)}
                          className='rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors'
                        >
                          {item.status === 'ACTIVE' ? 'Renovar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        ) : null}

        {/* Tab: Recent Payments */}
        {activeTab === 'payments' ? (
          <Box className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/50'>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Tienda</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Plan</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Período</th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Método</th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>Monto</th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-5 py-10 text-center text-sm text-slate-400'>
                      No hay pagos registrados aún
                    </td>
                  </tr>
                ) : recentPayments.map((payment) => (
                  <tr key={payment.id} className='border-b border-slate-50 hover:bg-slate-50/60 transition-colors'>
                    <td className='px-5 py-3.5'>
                      <Typography className='font-semibold text-neutral-dark'>{payment.store?.name ?? '—'}</Typography>
                    </td>
                    <td className='px-4 py-3.5 text-slate-600'>{payment.plan?.name ?? '—'}</td>
                    <td className='px-4 py-3.5 text-slate-500 text-xs'>
                      {new Date(payment.startDate).toLocaleDateString('es-CO')} → {new Date(payment.endDate).toLocaleDateString('es-CO')}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>
                        {payment.paymentMethod === 'CASH' ? 'Efectivo' : payment.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Otro'}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-right font-bold text-neutral-dark'>{fmt(Number(payment.paidAmount))}</td>
                    <td className='px-4 py-3.5 text-right text-xs text-slate-500'>
                      {new Date(payment.createdAt).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : null}
      </Box>

      {/* Register Payment Modal */}
      {showRegisterModal ? (
        <RegisterPaymentModal
          form={registerForm}
          plans={plans}
          stores={storesWithStatus}
          error={registerError}
          submitting={submitting}
          onChange={updateRegisterForm}
          onSubmit={submitRegisterPayment}
          onClose={closeRegisterModal}
        />
      ) : null}
    </Box>
  );
};

export default AdminDashboard;
