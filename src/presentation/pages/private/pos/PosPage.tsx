import { usePosManagement } from '@/application/useCases/pos/usePosManagement';
import { PosManagementView } from '@/presentation/ui/organisms/pos/PosManagementView';

const PosPage = () => {
  const posManagement = usePosManagement();

  return (
    <PosManagementView
      products={posManagement.products}
      customers={posManagement.customers}
      stores={posManagement.stores}
      cashSessions={posManagement.cashSessions}
      cart={posManagement.cart}
      sales={posManagement.sales}
      search={posManagement.search}
      selectedStoreId={posManagement.selectedStoreId}
      selectedCustomerId={posManagement.selectedCustomerId}
      selectedCashSessionId={posManagement.selectedCashSessionId}
      paymentMethod={posManagement.paymentMethod}
      loading={posManagement.loading}
      submitting={posManagement.submitting}
      error={posManagement.error}
      total={posManagement.total}
      onSearchChange={posManagement.setSearch}
      onStoreChange={posManagement.setSelectedStoreId}
      onCustomerChange={posManagement.setSelectedCustomerId}
      onCashSessionChange={posManagement.setSelectedCashSessionId}
      onPaymentMethodChange={posManagement.setPaymentMethod}
      onAddToCart={posManagement.addToCart}
      onUpdateQuantity={posManagement.updateQuantity}
      onConfirmSale={posManagement.confirmSale}
    />
  );
};

export default PosPage;
