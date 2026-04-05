import {
  ORDER_STATUSES,
  useOrdersManagement,
} from '@/application/useCases/orders/useOrdersManagement';
import { OrdersManagementView } from '@/presentation/ui/organisms/orders/OrdersManagementView';

const OrdersPage = () => {
  const ordersManagement = useOrdersManagement();

  return (
    <OrdersManagementView
      customers={ordersManagement.customers}
      products={ordersManagement.products}
      orders={ordersManagement.orders}
      customerId={ordersManagement.customerId}
      newCustomer={ordersManagement.newCustomer}
      cartRows={ordersManagement.cartRows}
      loading={ordersManagement.loading}
      submitting={ordersManagement.submitting}
      error={ordersManagement.error}
      statuses={ORDER_STATUSES}
      onCustomerIdChange={ordersManagement.setCustomerId}
      onNewCustomerChange={ordersManagement.setNewCustomer}
      onCartRowChange={ordersManagement.updateCartRow}
      onAddCartRow={ordersManagement.addCartRow}
      onCreateCustomer={ordersManagement.createCustomer}
      onCreateOrder={ordersManagement.createOrder}
      onStatusChange={ordersManagement.changeOrderStatus}
    />
  );
};

export default OrdersPage;
