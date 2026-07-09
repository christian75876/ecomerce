import { usePosManagement } from '@/application/useCases/pos/usePosManagement';
import { PosManagementView } from '@/presentation/ui/organisms/pos/PosManagementView';

const PosPage = () => {
  const posManagement = usePosManagement();

  return (
    <PosManagementView
      products={posManagement.products}
      customers={posManagement.customers}
      cart={posManagement.cart}
      sales={posManagement.sales}
      search={posManagement.search}
      selectedCustomerId={posManagement.selectedCustomerId}
      paymentMethod={posManagement.paymentMethod}
      loading={posManagement.loading}
      submitting={posManagement.submitting}
      error={posManagement.error}
      total={posManagement.total}
      onSearchChange={posManagement.setSearch}
      onCustomerChange={posManagement.setSelectedCustomerId}
      onPaymentMethodChange={posManagement.setPaymentMethod}
      onAddToCart={posManagement.addToCart}
      onUpdateQuantity={posManagement.updateQuantity}
      onConfirmSale={posManagement.confirmSale}
    />
  );
};

export default PosPage;
