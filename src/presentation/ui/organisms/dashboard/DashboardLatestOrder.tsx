import OrderTimelineCard from '@molecules/dashboard/OrderTimelineCard';

const DashboardLatestOrder = () => {
  const lastOrder = {
    orderId: '#54hD-t780yb5',
    statusList: [
      { label: 'Despachado', date: 'Hace 2 min', completed: true },
      { label: 'En Camino', date: 'Hace 1 hora', completed: false },
      { label: 'Completado', date: 'Pendiente', completed: false }
    ]
  };

  return (
    <OrderTimelineCard
      orderId={lastOrder.orderId}
      statusList={lastOrder.statusList.map(item => ({
        label: item.label,
        status: item.completed ? 'completed' : 'pending'
      }))}
    />
  );
};

export default DashboardLatestOrder;
