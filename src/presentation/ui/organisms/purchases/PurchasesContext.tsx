import { createContext, useContext } from 'react';
import { usePurchasesManagement } from '@/application/useCases/purchases/usePurchasesManagement';

type PurchasesContextValue = ReturnType<typeof usePurchasesManagement>;

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

interface PurchasesProviderProps {
  children: React.ReactNode;
}

export const PurchasesProvider = ({ children }: PurchasesProviderProps) => {
  const value = usePurchasesManagement();

  return (
    <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>
  );
};

export const usePurchasesModule = () => {
  const context = useContext(PurchasesContext);

  if (!context) {
    throw new Error(
      'usePurchasesModule debe usarse dentro de PurchasesProvider',
    );
  }

  return context;
};

export const usePurchaseRegistrationSection = () => {
  const purchases = usePurchasesModule();

  return {
    stores: purchases.stores,
    supplierId: purchases.supplierId,
    selectedSupplierOption: purchases.selectedSupplierOption,
    storeId: purchases.storeId,
    purchaseDate: purchases.purchaseDate,
    paidAmount: purchases.paidAmount,
    note: purchases.note,
    items: purchases.items,
    submitting: purchases.submitting,
    error: purchases.error,
    selectSupplierOption: purchases.selectSupplierOption,
    setStoreId: purchases.setStoreId,
    setPurchaseDate: purchases.setPurchaseDate,
    setPaidAmount: purchases.setPaidAmount,
    setNote: purchases.setNote,
    updateItem: purchases.updateItem,
    addItem: purchases.addItem,
    removeItem: purchases.removeItem,
    submitForm: purchases.submitForm,
    openSupplierModal: purchases.openSupplierModal,
    openProductModal: purchases.openProductModal,
    loadSupplierOptions: purchases.loadSupplierOptions,
    loadProductOptions: purchases.loadProductOptions,
    selectProductOption: purchases.selectProductOption,
  };
};

export const usePurchaseListingSection = () => {
  const purchases = usePurchasesModule();

  return {
    purchases: purchases.purchases,
    suppliers: purchases.suppliers,
    loading: purchases.loading,
    filters: purchases.filters,
    currentPage: purchases.currentPage,
    totalPages: purchases.totalPages,
    totalItems: purchases.totalItems,
    itemsPerPage: purchases.itemsPerPage,
    openPurchaseDetailModal: purchases.openPurchaseDetailModal,
    updateFilters: purchases.updateFilters,
    applyFilters: purchases.applyFilters,
    clearFilters: purchases.clearFilters,
    changePage: purchases.changePage,
  };
};

export const usePurchaseModalSection = () => {
  const purchases = usePurchasesModule();

  return {
    categories: purchases.categories,
    supplierForm: purchases.supplierForm,
    productForm: purchases.productForm,
    supplierSubmitting: purchases.supplierSubmitting,
    productSubmitting: purchases.productSubmitting,
    modalError: purchases.modalError,
    isSupplierModalOpen: purchases.isSupplierModalOpen,
    isProductModalOpen: purchases.isProductModalOpen,
    closeSupplierModal: purchases.closeSupplierModal,
    closeProductModal: purchases.closeProductModal,
    updateSupplierForm: purchases.updateSupplierForm,
    updateProductForm: purchases.updateProductForm,
    createSupplierInline: purchases.createSupplierInline,
    createProductInline: purchases.createProductInline,
  };
};

export const usePurchaseDetailSection = () => {
  const purchases = usePurchasesModule();

  return {
    selectedPurchase: purchases.selectedPurchase,
    isPurchaseDetailModalOpen: purchases.isPurchaseDetailModalOpen,
    detailLoading: purchases.detailLoading,
    detailSubmitting: purchases.detailSubmitting,
    detailError: purchases.detailError,
    paymentForm: purchases.paymentForm,
    editForm: purchases.editForm,
    cancelForm: purchases.cancelForm,
    closePurchaseDetailModal: purchases.closePurchaseDetailModal,
    updatePaymentForm: purchases.updatePaymentForm,
    updateEditForm: purchases.updateEditForm,
    updateCancelForm: purchases.updateCancelForm,
    submitPurchasePayment: purchases.submitPurchasePayment,
    submitPurchaseEdit: purchases.submitPurchaseEdit,
    submitPurchaseCancel: purchases.submitPurchaseCancel,
  };
};
