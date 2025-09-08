import DashboardStatCard from '@molecules/dashboard/DashboardStatCard';
import Box from '@atoms/box/SimpleBox';

const DashboardStats = () => {
  //TODO: Fetch Stats for backend
  const stats = [
    {
      icon: 'bx-cube',
      title: 'Envíos Totales',
      value: 19329,
      trendIcon: 'bx-trending-up',
      trendColor: 'text-gray-500'
    },
    {
      icon: 'bx-send',
      title: 'Paquetes entregados',
      value: 7000,
      trendIcon: 'bx-trending-down',
      trendColor: 'text-red-500'
    },
    { icon: 'bx-package', title: 'En tránsito', value: 12000 },
    { icon: 'bx-time', title: 'Paquetes pendientes', value: 345 }
  ];

  return (
    <Box className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full'>
      {stats.map((stat, index) => (
        <DashboardStatCard
          key={index}
          icon={stat.icon}
          title={stat.title}
          trendColor={stat.trendColor}
          trendIcon={stat.trendIcon}
          value={stat.value}
        />
      ))}
    </Box>
  );
};

export default DashboardStats;
