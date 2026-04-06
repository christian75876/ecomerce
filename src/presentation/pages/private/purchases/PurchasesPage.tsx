import { usePurchasesManagement } from '@/application/useCases/purchases/usePurchasesManagement';
import { PurchasesManagementView } from '@/presentation/ui/organisms/purchases/PurchasesManagementView';

const PurchasesPage = () => {
  const purchasesManagement = usePurchasesManagement();

  return (
    <PurchasesManagementView
      purchases={purchasesManagement.purchases}
      suppliers={purchasesManagement.suppliers}
      stores={purchasesManagement.stores}
      products={purchasesManagement.products}
      supplierId={purchasesManagement.supplierId}
      storeId={purchasesManagement.storeId}
      purchaseDate={purchasesManagement.purchaseDate}
      paidAmount={purchasesManagement.paidAmount}
      note={purchasesManagement.note}
      items={purchasesManagement.items}
      loading={purchasesManagement.loading}
      submitting={purchasesManagement.submitting}
      error={purchasesManagement.error}
      onSupplierChange={purchasesManagement.setSupplierId}
      onStoreChange={purchasesManagement.setStoreId}
      onPurchaseDateChange={purchasesManagement.setPurchaseDate}
      onPaidAmountChange={purchasesManagement.setPaidAmount}
      onNoteChange={purchasesManagement.setNote}
      onItemChange={purchasesManagement.updateItem}
      onAddItem={purchasesManagement.addItem}
      onRemoveItem={purchasesManagement.removeItem}
      onSubmit={purchasesManagement.submitForm}
    />
  );
};

export default PurchasesPage;
