import Box from '@atoms/box/SimpleBox';
import Button from '@atoms/button/SimpleButton';
import Typography from '@atoms/typography/SimpleTypography';
import { useDashboardSummary } from '@/application/useCases/dashboard/useDashboardSummary';
import DashboardFilters from '@organisms/dashboard/DashboardFilters';
import DashboardKpiGrid from '@organisms/dashboard/DashboardKpiGrid';
import {
  CategoryMixChart,
  ChannelComparisonChart,
  InventoryFlowChart,
  SalesOverviewChart,
  TopProductsChart,
} from '@organisms/dashboard/DashboardCharts';
import {
  PayablesTable,
  ReceivablesTable,
  StockAlertTable,
} from '@organisms/dashboard/DashboardTables';

const AdminDashboard = () => {
  const { summary, loading, error, filters, updateFilter, resetFilters } = useDashboardSummary();

  const exportCsv = () => {
    if (!summary) {
      return;
    }

    const rows = [
      ['Sección', 'Nombre', 'Valor', 'Extra'],
      ['KPI', 'Ventas del período', summary.kpis.salesThisPeriod, ''],
      ['KPI', 'Ticket promedio', summary.kpis.averageTicket, ''],
      ['KPI', 'Productos activos', summary.kpis.totalProducts, ''],
      ['KPI', 'Cartera clientes', summary.kpis.customerDebt, ''],
      ['KPI', 'Deuda proveedores', summary.kpis.supplierDebt, ''],
      ...summary.topProducts.map((item) => [
        'Top producto',
        item.name,
        item.revenue,
        `Cantidad: ${item.quantity}`,
      ]),
      ...summary.topCategories.map((item) => [
        'Top categoría',
        item.name,
        item.revenue,
        `Cantidad: ${item.quantity}`,
      ]),
      ...summary.receivables.items.map((item) => [
        'Cartera cliente',
        item.name,
        item.balance,
        item.email,
      ]),
      ...summary.payables.items.map((item) => [
        'Deuda proveedor',
        item.name,
        item.balance,
        item.lastPurchaseAt ?? '',
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard-analytics-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box className='flex min-h-[60vh] flex-col items-center justify-center gap-5'>
        <div className='relative h-14 w-14'>
          <div className='absolute inset-0 rounded-full border-4 border-primary/15' />
          <div className='absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent' />
        </div>
        <Box className='text-center'>
          <Typography variant='h3' className='text-neutral-dark/70'>Cargando dashboard</Typography>
          <Typography className='mt-1 text-sm text-neutral-dark/45'>Consolidando métricas y analítica…</Typography>
        </Box>
      </Box>
    );
  }

  if (error || !summary) {
    return (
      <Box className='flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-[1.8rem] border border-red-200 bg-red-50 px-8 py-10 text-center'>
        <Box className='flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100'>
          <svg className='h-6 w-6 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' />
          </svg>
        </Box>
        <Box>
          <Typography variant='h3' className='text-red-700'>{error || 'Error al cargar el dashboard'}</Typography>
          <Typography className='mt-1 text-sm text-red-500'>Verifica tu conexión e intenta de nuevo.</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className='space-y-6'>
      <Box className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <Box>
          <Typography variant='h1' className='text-3xl md:text-4xl'>
            Dashboard analítico
          </Typography>
          <Typography className='mt-2 max-w-3xl text-neutral-dark/65'>
            Consolida ventas, inventario, cartera, proveedores y operación de caja con filtros globales para tomar decisiones reales.
          </Typography>
        </Box>
        <Button variant='outlinePrimary' onClick={exportCsv}>
          Exportar vista actual
        </Button>
      </Box>

      <DashboardFilters
        filters={filters}
        stores={summary.availableStores}
        onChange={updateFilter}
        onReset={resetFilters}
        onExport={exportCsv}
      />

      <DashboardKpiGrid summary={summary} />

      <Box className='grid grid-cols-1 gap-6 2xl:grid-cols-3'>
        <Box className='2xl:col-span-2'>
          <SalesOverviewChart data={summary.salesByPeriod} />
        </Box>
        <Box>
          <ChannelComparisonChart data={summary.channelComparison} />
        </Box>
      </Box>

      <Box className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
        <TopProductsChart data={summary.topProducts} />
        <CategoryMixChart data={summary.topCategories} />
      </Box>

      <InventoryFlowChart data={summary.inventoryFlow} />

      <Box className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        <StockAlertTable
          title='Stock crítico'
          subtitle='Productos que están por debajo del umbral configurado.'
          items={summary.stockAlerts.critical}
        />
        <StockAlertTable
          title='Sin stock'
          subtitle='Productos activos agotados o con saldo en cero.'
          items={summary.stockAlerts.outOfStock}
        />
        <StockAlertTable
          title='Sin rotación'
          subtitle='Productos sin ventas recientes y con inventario retenido.'
          items={summary.stockAlerts.noRotation}
        />
      </Box>

      <Box className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
        <ReceivablesTable items={summary.receivables.items} />
        <PayablesTable items={summary.payables.items} />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
