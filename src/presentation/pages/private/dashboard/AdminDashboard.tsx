import Box from '@atoms/box/SimpleBox';
import DashboardStats from '@molecules/dashboard/DashboardStats';
import DashboardChart from '@molecules/dashboard/DashboardChart';
import DashboardLatestOrder from '@organisms/dashboard/DashboardLatestOrder';
import DashboardHeader from '@organisms/dashboard/DashboardHeader';

const AdminDashboard = () => {
  return (
    <>
      <DashboardHeader role={'Comerciante'} />

      <Box className='mb-7'>
        <DashboardStats />
      </Box>

      <Box className='grid grid-cols-1 lg:grid-cols-4 gap-6 w-full'>
        <Box className='lg:col-span-3 h-full'>
          <DashboardChart />
        </Box>

        <Box className='lg:col-span-1 h-full'>
          <DashboardLatestOrder />
        </Box>
      </Box>
    </>
  );
};

export default AdminDashboard;
