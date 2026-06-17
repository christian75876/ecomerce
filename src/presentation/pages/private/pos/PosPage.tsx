import { usePosManagement } from '@/application/useCases/pos/usePosManagement';
import { PosManagementView } from '@/presentation/ui/organisms/pos/PosManagementView';
import { useAdminStoreFilterContext } from '@/shared/context/AdminStoreFilterContext';

const PosPage = () => {
  const { selectedStoreId } = useAdminStoreFilterContext();
  const pos = usePosManagement(selectedStoreId);

  return (
    <PosManagementView
      products={pos.products}
      customers={pos.customers}
      cart={pos.cart}
      sales={pos.sales}
      salesPage={pos.salesPage}
      salesTotalPages={pos.salesTotalPages}
      onSalesPageChange={pos.goToSalesPage}
      search={pos.search}
      selectedCustomerId={pos.selectedCustomerId}
      paymentMethod={pos.paymentMethod}
      loading={pos.loading}
      submitting={pos.submitting}
      error={pos.error}
      total={pos.total}
      onSearchChange={pos.setSearch}
      onCustomerChange={pos.setSelectedCustomerId}
      onPaymentMethodChange={pos.setPaymentMethod}
      onAddToCart={pos.addToCart}
      onUpdateQuantity={pos.updateQuantity}
      onRemoveFromCart={pos.removeFromCart}
      onConfirmSale={pos.confirmSale}
      receiptSale={pos.receiptSale}
      onCloseReceipt={pos.clearReceiptSale}
    />
  );
};

export default PosPage;
