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
      <Box className='surface-panel rounded-[1.8rem] px-6 py-10 text-center'>
        <Typography>Cargando dashboard analítico...</Typography>
      </Box>
    );
  }

  if (error || !summary) {
    return (
      <Box className='rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-600'>
        {error || 'No fue posible cargar el dashboard'}
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
