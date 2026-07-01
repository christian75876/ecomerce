import {
  ORDER_STATUSES,
  useOrdersManagement,
} from '@/application/useCases/orders/useOrdersManagement';
import { OrdersManagementView } from '@/presentation/ui/organisms/orders/OrdersManagementView';
import { useAdminStoreFilterContext } from '@/shared/context/AdminStoreFilterContext';

const OrdersPage = () => {
  const { selectedStoreId } = useAdminStoreFilterContext();
  const ordersManagement = useOrdersManagement(selectedStoreId);

  return (
    <OrdersManagementView
      customers={ordersManagement.customers}
      products={ordersManagement.products}
      orders={ordersManagement.orders}
      ordersPage={ordersManagement.ordersPage}
      ordersTotalPages={ordersManagement.ordersTotalPages}
      statusFilter={ordersManagement.statusFilter}
      searchFilter={ordersManagement.searchFilter}
      onOrdersPageChange={ordersManagement.goToOrdersPage}
      onStatusFilterChange={ordersManagement.setStatusFilter}
      onSearchFilterChange={ordersManagement.setSearchFilter}
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
