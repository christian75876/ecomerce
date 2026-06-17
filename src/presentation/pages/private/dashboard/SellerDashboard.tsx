import { useDashboardSummary } from '@/application/useCases/dashboard/useDashboardSummary';
import { useAdminStoreFilterContext } from '@/shared/context/AdminStoreFilterContext';
import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';
import DashboardFilters from '@organisms/dashboard/DashboardFilters';
import DashboardKpiGrid from '@organisms/dashboard/DashboardKpiGrid';
import {
  CategoryMixChart,
  ChannelComparisonChart,
  InventoryFlowChart,
  SalesOverviewChart,
  TopProductsChart,
} from '@organisms/dashboard/DashboardCharts';
import { StockAlertTable, ReceivablesTable, PayablesTable } from '@organisms/dashboard/DashboardTables';
import DashboardLatestOrder from '@organisms/dashboard/DashboardLatestOrder';

const SellerDashboard = () => {
  const { selectedStore } = useAdminStoreFilterContext();
  // Do not filter by storeId — sellers see all their own data regardless of store selection
  const { summary, loading, error, filters, updateFilter, resetFilters } =
    useDashboardSummary(undefined);

  const handleExport = () => {
    if (!summary) return;
    const rows = [
      ['Métrica', 'Valor'],
      ['Ventas del período', summary.kpis.salesThisPeriod],
      ['Transacciones', summary.kpis.totalTransactions],
      ['Ticket promedio', summary.kpis.averageTicket],
      ['Revenue POS', summary.kpis.posRevenue],
      ['Revenue Online', summary.kpis.onlineRevenue],
      ['Pedidos pendientes', summary.kpis.pendingOrders],
      ['Productos activos', summary.kpis.totalProducts],
      ['Stock crítico', summary.kpis.lowStockProducts],
      ['Sin stock', summary.kpis.outOfStockProducts],
      ['Cartera clientes', summary.kpis.customerDebt],
      ['Deuda proveedores', summary.kpis.supplierDebt],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${filters.startDate}-${filters.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box className='mx-auto max-w-[1440px] space-y-8 px-4 py-6 sm:px-6'>
      <Box className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
        <Box>
          <Typography variant='h1' className='text-2xl font-bold text-slate-800 sm:text-3xl'>
            Panel operacional
          </Typography>
          <Typography className='mt-1 text-sm text-slate-500'>
            Ventas, inventario, pedidos y finanzas de tu tienda
          </Typography>
        </Box>
        {selectedStore && (
          <Box className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm'>
            <i className='bx bx-store text-lg text-orange-500' />
            <span className='text-sm font-semibold text-slate-700'>{selectedStore.name}</span>
          </Box>
        )}
      </Box>

      <DashboardFilters
        filters={filters}
        stores={[]}
        onChange={updateFilter}
        onReset={resetFilters}
        onExport={handleExport}
        showStoreFilter={false}
      />

      {loading && (
        <Box className='flex items-center justify-center py-16'>
          <Typography className='text-slate-400'>Cargando datos...</Typography>
        </Box>
      )}

      {!loading && error && (
        <Box className='rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
          {error}
        </Box>
      )}

      {!loading && summary && (
        <>
          <DashboardKpiGrid summary={summary} />

          {summary.latestOrders.length > 0 && (
            <DashboardLatestOrder latestOrders={summary.latestOrders} />
          )}

          <Box className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
            <SalesOverviewChart data={summary.salesByPeriod} />
            <ChannelComparisonChart data={summary.channelComparison} />
          </Box>

          <Box className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
            <TopProductsChart data={summary.topProducts} />
            <CategoryMixChart data={summary.topCategories} />
          </Box>

          <InventoryFlowChart data={summary.inventoryFlow} />

          <Box className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
            <StockAlertTable
              title='Stock crítico'
              subtitle='Productos por debajo del umbral configurado'
              items={summary.stockAlerts.critical}
            />
            <StockAlertTable
              title='Sin stock'
              subtitle='Productos con 0 unidades disponibles'
              items={summary.stockAlerts.outOfStock}
            />
          </Box>

          <Box className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
            <ReceivablesTable items={summary.receivables.items} />
            <PayablesTable items={summary.payables.items} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default SellerDashboard;
