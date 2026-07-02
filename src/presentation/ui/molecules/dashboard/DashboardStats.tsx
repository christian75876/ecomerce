import DashboardStatCard from '@molecules/dashboard/DashboardStatCard';
import Box from '@atoms/box/SimpleBox';
import { IDashboardAnalytics } from '@/application/dtos/dashboard/response/DashboardResponse';

const DashboardStats = ({ summary }: { summary: IDashboardAnalytics }) => {
  const stats = [
    {
      icon: 'bx-cube',
      title: 'Productos totales',
      value: summary.kpis.totalProducts,
    },
    {
      icon: 'bx-error-circle',
      title: 'Stock bajo',
      value: summary.kpis.lowStockProducts,
      trendIcon: 'bx-trending-down',
      trendColor: 'text-red-500',
    },
    {
      icon: 'bx-dollar-circle',
      title: 'Ventas del día',
      value: Math.round(summary.kpis.salesToday),
    },
    { icon: 'bx-time', title: 'Pedidos pendientes', value: summary.kpis.pendingOrders }
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
