import { useEffect } from 'react';
import { usePurchaseCollection } from './hooks/usePurchaseCollection';
import { usePurchaseDetailFlow } from './hooks/usePurchaseDetailFlow';
import { usePurchaseReferenceData } from './hooks/usePurchaseReferenceData';
import { usePurchaseRegistrationFlow } from './hooks/usePurchaseRegistrationFlow';
import { useAdminStoreFilterContext } from '@/shared/context/AdminStoreFilterContext';

export type {
  InlineProductForm,
  InlineSupplierForm,
  PurchaseCancelForm,
  PurchaseEditForm,
  PurchaseItemForm,
  PurchaseListFilters,
  PurchasePaymentForm,
} from './purchase.types';

export const usePurchasesManagement = () => {
  const { selectedStoreId } = useAdminStoreFilterContext();
  const referenceData = usePurchaseReferenceData();
  const collection = usePurchaseCollection(10, selectedStoreId);
  const registration = usePurchaseRegistrationFlow({
    onPurchaseCreated: async () => {
      await collection.loadPurchases(1, collection.filters);
    },
    onSupplierCreated: referenceData.appendSupplier,
    onCategoryCreated: referenceData.appendCategory,
  });
  const detail = usePurchaseDetailFlow({
    onPurchaseUpdated: collection.replacePurchase,
  });

  useEffect(() => {
    void (async () => {
      await referenceData.loadReferenceData();
      await collection.loadPurchases(1, collection.filters, true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedStoreId) registration.setStoreId(selectedStoreId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreId]);

  return {
    purchases: collection.purchases,
    suppliers: referenceData.suppliers,
    stores: referenceData.stores,
    categories: referenceData.categories,
    supplierId: registration.supplierId,
    selectedSupplierOption: registration.selectedSupplierOption,
    storeId: registration.storeId,
    purchaseDate: registration.purchaseDate,
    paidAmount: registration.paidAmount,
    note: registration.note,
    items: registration.items,
    loading: referenceData.loading || collection.loading,
    submitting: registration.submitting,
    error: registration.error ?? collection.error ?? referenceData.error,
    isSupplierModalOpen: registration.isSupplierModalOpen,
    isProductModalOpen: registration.isProductModalOpen,
    supplierForm: registration.supplierForm,
    productForm: registration.productForm,
    supplierSubmitting: registration.supplierSubmitting,
    productSubmitting: registration.productSubmitting,
    modalError: registration.modalError,
    selectedPurchase: detail.selectedPurchase,
    isPurchaseDetailModalOpen: detail.isPurchaseDetailModalOpen,
    detailLoading: detail.detailLoading,
    detailSubmitting: detail.detailSubmitting,
    detailError: detail.detailError,
    paymentForm: detail.paymentForm,
    editForm: detail.editForm,
    cancelForm: detail.cancelForm,
    isRegistrationFormOpen: registration.isRegistrationFormOpen,
    openRegistrationForm: registration.openRegistrationForm,
    closeRegistrationForm: registration.closeRegistrationForm,
    setSupplierId: registration.setSupplierId,
    setStoreId: registration.setStoreId,
    setPurchaseDate: registration.setPurchaseDate,
    setPaidAmount: registration.setPaidAmount,
    setNote: registration.setNote,
    updateItem: registration.updateItem,
    selectSupplierOption: registration.selectSupplierOption,
    selectProductOption: registration.selectProductOption,
    loadSupplierOptions: registration.loadSupplierOptions,
    loadProductOptions: registration.loadProductOptions,
    addItem: registration.addItem,
    removeItem: registration.removeItem,
    submitForm: registration.submitForm,
    openSupplierModal: registration.openSupplierModal,
    openProductModal: registration.openProductModal,
    openPurchaseDetailModal: detail.openPurchaseDetailModal,
    closeSupplierModal: registration.closeSupplierModal,
    closeProductModal: registration.closeProductModal,
    closePurchaseDetailModal: detail.closePurchaseDetailModal,
    updateSupplierForm: registration.updateSupplierForm,
    updateProductForm: registration.updateProductForm,
    updatePaymentForm: detail.updatePaymentForm,
    updateEditForm: detail.updateEditForm,
    updateCancelForm: detail.updateCancelForm,
    filters: collection.filters,
    currentPage: collection.currentPage,
    totalPages: collection.totalPages,
    totalItems: collection.totalItems,
    itemsPerPage: collection.itemsPerPage,
    updateFilters: collection.updateFilters,
    applyFilters: collection.applyFilters,
    clearFilters: collection.clearFilters,
    changePage: collection.changePage,
    createSupplierInline: registration.createSupplierInline,
    createProductInline: registration.createProductInline,
    isCategoryInputOpen: registration.isCategoryInputOpen,
    newCategoryName: registration.newCategoryName,
    categoryCreating: registration.categoryCreating,
    openCategoryInput: registration.openCategoryInput,
    closeCategoryInput: registration.closeCategoryInput,
    setNewCategoryName: registration.setNewCategoryName,
    createCategoryInline: registration.createCategoryInline,
    submitPurchasePayment: detail.submitPurchasePayment,
    submitPurchaseEdit: detail.submitPurchaseEdit,
    submitPurchaseCancel: detail.submitPurchaseCancel,
  };
};
