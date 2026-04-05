import OrderTimelineCard from '@molecules/dashboard/OrderTimelineCard';

const orderStatusSteps = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'];

const DashboardLatestOrder = ({
  latestOrders,
}: {
  latestOrders: Array<{
    id: string;
    status: string;
    total: number;
    customerName: string;
  }>;
}) => {
  if (latestOrders.length === 0) {
    return null;
  }

  const lastOrder = latestOrders[0];
  const currentIndex = orderStatusSteps.indexOf(lastOrder.status);

  return (
    <OrderTimelineCard
      orderId={`#${lastOrder.id.slice(0, 8)}`}
      statusList={orderStatusSteps.map((status, index) => ({
        label: status,
        status:
          index < currentIndex
            ? 'completed'
            : index === currentIndex
              ? 'current'
              : 'pending',
      }))}
    />
  );
};

export default DashboardLatestOrder;
