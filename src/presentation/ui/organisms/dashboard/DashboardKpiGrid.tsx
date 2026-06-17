import Card from '@atoms/card/SimpleCard';
import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';
import {
  IDashboardAnalytics,
} from '@/application/dtos/dashboard/response/DashboardResponse';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const DashboardKpiGrid = ({ summary }: { summary: IDashboardAnalytics }) => {
  const { grossProfit, grossMargin, cogs, salesThisPeriod, totalTransactions, posRevenue, onlineRevenue, averageTicket } = summary.kpis;
  const profitColor = grossProfit >= 0 ? 'text-emerald-600' : 'text-red-500';

  const metrics = [
    {
      title: 'Ventas del período',
      value: formatCurrency(salesThisPeriod),
      detail: `${totalTransactions} transacciones`,
    },
    {
      title: 'Ganancia bruta',
      value: formatCurrency(grossProfit),
      detail: `Margen ${grossMargin}% · Costo ${formatCurrency(cogs)}`,
      highlight: profitColor,
    },
    {
      title: 'Ticket promedio',
      value: formatCurrency(averageTicket),
      detail: `POS ${formatCurrency(posRevenue)} · Online ${formatCurrency(onlineRevenue)}`,
    },
    {
      title: 'Inventario',
      value: `${summary.kpis.stockUnits} uds.`,
      detail: `${summary.kpis.lowStockProducts} críticos · ${summary.kpis.outOfStockProducts} sin stock`,
    },
    {
      title: 'Cartera clientes',
      value: formatCurrency(summary.kpis.customerDebt),
      detail: `${summary.receivables.customersWithDebt} clientes con saldo`,
    },
    {
      title: 'Cuentas por pagar',
      value: formatCurrency(summary.kpis.supplierDebt),
      detail: `${summary.payables.suppliersWithDebt} proveedores con saldo`,
    },
    {
      title: 'Productos activos',
      value: summary.kpis.totalProducts.toString(),
      detail: `${summary.kpis.noRotationProducts} sin rotación`,
    },
    {
      title: 'Compras de abastecimiento',
      value: summary.purchasesOverview.totalPurchases.toString(),
      detail: formatCurrency(summary.purchasesOverview.purchaseVolume),
    },
  ];

  return (
    <Box className='grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4'>
      {metrics.map((metric) => (
        <Card key={metric.title} className='p-5'>
          <Typography variant='span' className='text-neutral-dark/55'>
            {metric.title}
          </Typography>
          <Typography variant='h2' className={`mt-3 text-3xl ${metric.highlight ?? ''}`}>
            {metric.value}
          </Typography>
          <Typography className='mt-2 text-sm text-neutral-dark/65'>
            {metric.detail}
          </Typography>
        </Card>
      ))}
    </Box>
  );
};

export default DashboardKpiGrid;
