import { useRef, useState } from 'react';
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
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportImage = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      // Loaded on demand — most admin visits never export the dashboard,
      // and html2canvas is a sizable dependency to ship on every visit.
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
        windowWidth: dashboardRef.current.scrollWidth,
        windowHeight: dashboardRef.current.scrollHeight,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${Date.now()}.png`;
      link.click();
    } finally {
      setExporting(false);
    }
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

  // Prefer the server's resolved storeId (it's authoritative for sellers,
  // who are always scoped to their own store regardless of local filters).
  const effectiveStoreId = summary.filters.storeId ?? filters.storeId;
  const selectedStore = effectiveStoreId
    ? summary.availableStores.find((s) => s.id === effectiveStoreId)
    : null;

  return (
    <Box className='space-y-6'>
      {/* Header */}
      <Box className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <Box>
          <Typography variant='h1' className='text-3xl md:text-4xl'>
            {selectedStore ? selectedStore.name : 'Todas las tiendas'}
          </Typography>
          <Typography className='mt-1 text-neutral-dark/60'>
            {selectedStore
              ? 'Métricas filtradas para esta tienda · Dashboard analítico'
              : 'Vista consolidada de todas las tiendas · Dashboard analítico'}
          </Typography>
        </Box>
        <Button variant='outlinePrimary' onClick={() => void exportImage()} disabled={exporting}>
          {exporting ? 'Generando imagen…' : 'Exportar vista actual'}
        </Button>
      </Box>

      <div ref={dashboardRef} className='space-y-6'>
        <DashboardFilters
          filters={filters}
          onChange={updateFilter}
          onReset={resetFilters}
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
      </div>
    </Box>
  );
};

export default AdminDashboard;
