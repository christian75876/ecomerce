import { usePurchasesManagement } from '@/application/useCases/purchases/usePurchasesManagement';
import { PurchasesManagementView } from '@/presentation/ui/organisms/purchases/PurchasesManagementView';

const PurchasesPage = () => {
  const purchasesManagement = usePurchasesManagement();

  return (
    <PurchasesManagementView
      purchases={purchasesManagement.purchases}
      suppliers={purchasesManagement.suppliers}
      stores={purchasesManagement.stores}
      categories={purchasesManagement.categories}
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
      isSupplierModalOpen={purchasesManagement.isSupplierModalOpen}
      isProductModalOpen={purchasesManagement.isProductModalOpen}
      supplierForm={purchasesManagement.supplierForm}
      productForm={purchasesManagement.productForm}
      supplierSubmitting={purchasesManagement.supplierSubmitting}
      productSubmitting={purchasesManagement.productSubmitting}
      modalError={purchasesManagement.modalError}
      selectedPurchase={purchasesManagement.selectedPurchase}
      isPurchaseDetailModalOpen={purchasesManagement.isPurchaseDetailModalOpen}
      detailLoading={purchasesManagement.detailLoading}
      detailSubmitting={purchasesManagement.detailSubmitting}
      detailError={purchasesManagement.detailError}
      paymentForm={purchasesManagement.paymentForm}
      editForm={purchasesManagement.editForm}
      cancelForm={purchasesManagement.cancelForm}
      filters={purchasesManagement.filters}
      currentPage={purchasesManagement.currentPage}
      totalPages={purchasesManagement.totalPages}
      totalItems={purchasesManagement.totalItems}
      itemsPerPage={purchasesManagement.itemsPerPage}
      onSupplierChange={purchasesManagement.setSupplierId}
      onStoreChange={purchasesManagement.setStoreId}
      onPurchaseDateChange={purchasesManagement.setPurchaseDate}
      onPaidAmountChange={purchasesManagement.setPaidAmount}
      onNoteChange={purchasesManagement.setNote}
      onItemChange={purchasesManagement.updateItem}
      onAddItem={purchasesManagement.addItem}
      onRemoveItem={purchasesManagement.removeItem}
      onSubmit={purchasesManagement.submitForm}
      onOpenSupplierModal={purchasesManagement.openSupplierModal}
      onCloseSupplierModal={purchasesManagement.closeSupplierModal}
      onOpenProductModal={purchasesManagement.openProductModal}
      onCloseProductModal={purchasesManagement.closeProductModal}
      onSupplierFormChange={purchasesManagement.updateSupplierForm}
      onProductFormChange={purchasesManagement.updateProductForm}
      onPaymentFormChange={purchasesManagement.updatePaymentForm}
      onEditFormChange={purchasesManagement.updateEditForm}
      onCancelFormChange={purchasesManagement.updateCancelForm}
      onFilterChange={purchasesManagement.updateFilters}
      onCreateSupplier={purchasesManagement.createSupplierInline}
      onCreateProduct={purchasesManagement.createProductInline}
      onOpenPurchaseDetail={purchasesManagement.openPurchaseDetailModal}
      onClosePurchaseDetail={purchasesManagement.closePurchaseDetailModal}
      onSubmitPurchasePayment={purchasesManagement.submitPurchasePayment}
      onSubmitPurchaseEdit={purchasesManagement.submitPurchaseEdit}
      onSubmitPurchaseCancel={purchasesManagement.submitPurchaseCancel}
      onApplyFilters={purchasesManagement.applyFilters}
      onClearFilters={purchasesManagement.clearFilters}
      onChangePage={purchasesManagement.changePage}
    />
  );
};

export default PurchasesPage;
