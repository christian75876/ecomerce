import Box from '@atoms/box/SimpleBox';
import DashboardStats from '@molecules/dashboard/DashboardStats';
import DashboardChart from '@molecules/dashboard/DashboardChart';
import DashboardLatestOrder from '@organisms/dashboard/DashboardLatestOrder';
import DashboardHeader from '@organisms/dashboard/DashboardHeader';
import Typography from '@atoms/typography/SimpleTypography';
import { useDashboardSummary } from '@/application/useCases/dashboard/useDashboardSummary';

const AdminDashboard = () => {
  const { summary, loading, error } = useDashboardSummary();

  if (loading) {
    return <Typography>Cargando dashboard...</Typography>;
  }

  if (error || !summary) {
    return (
      <Box className='rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-600'>
        {error || 'No fue posible cargar el dashboard'}
      </Box>
    );
  }

  return (
    <>
      <DashboardHeader role={'Comerciante'} />

      <Box className='mb-7'>
        <DashboardStats summary={summary} />
      </Box>

      <Box className='grid grid-cols-1 lg:grid-cols-4 gap-6 w-full'>
        <Box className='lg:col-span-3 h-full'>
          <DashboardChart salesByDay={summary.salesByDay} />
        </Box>

        <Box className='lg:col-span-1 h-full'>
          <DashboardLatestOrder latestOrders={summary.latestOrders} />
        </Box>
      </Box>
    </>
  );
};

export default AdminDashboard;
