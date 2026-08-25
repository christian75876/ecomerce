import Box from '@atoms/box/SimpleBox';
import {
  IDashboardAnalytics,
} from '@/application/dtos/dashboard/response/DashboardResponse';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

interface KpiMetric {
  title: string;
  value: string;
  detail: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  shadowColor: string;
}

const DashboardKpiGrid = ({ summary }: { summary: IDashboardAnalytics }) => {
  const metrics: KpiMetric[] = [
    {
      title: 'Ventas del período',
      value: formatCurrency(summary.kpis.salesThisPeriod),
      detail: `${summary.kpis.totalTransactions} transacciones`,
      icon: 'bx-trending-up',
      iconColor: '#ff6b35',
      iconBg: 'rgba(255,107,53,0.10)',
      shadowColor: 'rgba(255,107,53,0.12)',
    },
    {
      title: 'Ticket promedio',
      value: formatCurrency(summary.kpis.averageTicket),
      detail: `POS ${formatCurrency(summary.kpis.posRevenue)} · Online ${formatCurrency(summary.kpis.onlineRevenue)}`,
      icon: 'bx-receipt',
      iconColor: '#e93e7d',
      iconBg: 'rgba(233,62,125,0.10)',
      shadowColor: 'rgba(233,62,125,0.12)',
    },
    {
      title: 'Inventario',
      value: `${summary.kpis.stockUnits} uds.`,
      detail: `${summary.kpis.lowStockProducts} críticos · ${summary.kpis.outOfStockProducts} sin stock`,
      icon: 'bx-box',
      iconColor: '#d97706',
      iconBg: 'rgba(217,119,6,0.10)',
      shadowColor: 'rgba(217,119,6,0.10)',
    },
    {
      title: 'Pedidos pendientes',
      value: summary.kpis.pendingOrders.toString(),
      detail: `${summary.kpis.openCashSessions} cajas abiertas`,
      icon: 'bx-package',
      iconColor: '#ea580c',
      iconBg: 'rgba(234,88,12,0.10)',
      shadowColor: 'rgba(234,88,12,0.10)',
    },
    {
      title: 'Cartera clientes',
      value: formatCurrency(summary.kpis.customerDebt),
      detail: `${summary.receivables.customersWithDebt} clientes con saldo`,
      icon: 'bx-group',
      iconColor: '#16a34a',
      iconBg: 'rgba(22,163,74,0.10)',
      shadowColor: 'rgba(22,163,74,0.10)',
    },
    {
      title: 'Cuentas por pagar',
      value: formatCurrency(summary.kpis.supplierDebt),
      detail: `${summary.payables.suppliersWithDebt} proveedores con saldo`,
      icon: 'bx-credit-card',
      iconColor: '#e11d48',
      iconBg: 'rgba(225,29,72,0.10)',
      shadowColor: 'rgba(225,29,72,0.10)',
    },
    {
      title: 'Productos activos',
      value: summary.kpis.totalProducts.toString(),
      detail: `${summary.kpis.noRotationProducts} sin rotación`,
      icon: 'bx-shopping-bag',
      iconColor: '#0284c7',
      iconBg: 'rgba(2,132,199,0.10)',
      shadowColor: 'rgba(2,132,199,0.10)',
    },
    {
      title: 'Compras de abastecimiento',
      value: summary.purchasesOverview.totalPurchases.toString(),
      detail: formatCurrency(summary.purchasesOverview.purchaseVolume),
      icon: 'bx-transfer',
      iconColor: '#0d9488',
      iconBg: 'rgba(13,148,136,0.10)',
      shadowColor: 'rgba(13,148,136,0.10)',
    },
  ];

  return (
    <Box className='grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4'>
      {metrics.map((metric) => (
        <Box
          key={metric.title}
          className='rounded-2xl bg-white p-5 transition-all duration-200 hover:-translate-y-0.5'
          style={{
            border: '1px solid rgba(15,23,42,0.07)',
            boxShadow: `0 1px 3px rgba(15,23,42,0.04), 0 4px 16px ${metric.shadowColor}`,
          }}
        >
          <div
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'
            style={{ backgroundColor: metric.iconBg }}
          >
            <i className={`bx ${metric.icon} text-xl`} style={{ color: metric.iconColor }} aria-hidden='true' />
          </div>
          <p className='mt-4 text-2xl font-bold tracking-tight text-neutral-dark'>
            {metric.value}
          </p>
          <p className='mt-0.5 text-[13px] font-medium text-neutral-dark/70'>
            {metric.title}
          </p>
          <p className='mt-1.5 text-xs text-neutral-dark/40'>
            {metric.detail}
          </p>
        </Box>
      ))}
    </Box>
  );
};

export default DashboardKpiGrid;
