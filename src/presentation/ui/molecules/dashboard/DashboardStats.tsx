import DashboardStatCard from '@molecules/dashboard/DashboardStatCard';
import Box from '@atoms/box/SimpleBox';
import { IDashboardSummary } from '@/application/dtos/dashboard/response/DashboardResponse';

const DashboardStats = ({ summary }: { summary: IDashboardSummary }) => {
  const stats = [
    {
      icon: 'bx-cube',
      title: 'Productos totales',
      value: summary.totalProducts,
    },
    {
      icon: 'bx-error-circle',
      title: 'Stock bajo',
      value: summary.lowStockProducts,
      trendIcon: 'bx-trending-down',
      trendColor: 'text-red-500',
    },
    { icon: 'bx-dollar-circle', title: 'Ventas del día', value: Math.round(summary.salesToday) },
    { icon: 'bx-time', title: 'Pedidos pendientes', value: summary.pendingOrders }
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
