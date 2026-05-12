import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IAsyncOption } from '@/application/dtos/common/AsyncOption';
import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import {
  InlineProductForm,
  InlineSupplierForm,
  PurchaseCancelForm,
  PurchaseEditForm,
  PurchaseItemForm,
  PurchaseListFilters,
  PurchasePaymentForm,
} from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import FeatureScreen from '@/presentation/ui/templates/feature/FeatureScreen';
import FeatureScreenHeader from '@/presentation/ui/templates/feature/FeatureScreenHeader';
import CreateProductModal from './CreateProductModal';
import PurchaseDetailModal from './PurchaseDetailModal';
import CreateSupplierModal from './CreateSupplierModal';
import PurchaseRegistrationForm from './PurchaseRegistrationForm';
import PurchasesListPanel from './PurchasesListPanel';

interface PurchasesManagementViewProps {
  purchases: IPurchase[];
  suppliers: ISupplier[];
  stores: IStore[];
  categories: ICategory[];
  supplierId: string;
  selectedSupplierOption: IAsyncOption | null;
  storeId: string;
  purchaseDate: string;
  paidAmount: string;
  note: string;
  items: PurchaseItemForm[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  isSupplierModalOpen: boolean;
  isProductModalOpen: boolean;
  supplierForm: InlineSupplierForm;
  productForm: InlineProductForm;
  supplierSubmitting: boolean;
  productSubmitting: boolean;
  modalError: string | null;
  selectedPurchase: IPurchase | null;
  isPurchaseDetailModalOpen: boolean;
  detailLoading: boolean;
  detailSubmitting: boolean;
  detailError: string | null;
  paymentForm: PurchasePaymentForm;
  editForm: PurchaseEditForm;
  cancelForm: PurchaseCancelForm;
  filters: PurchaseListFilters;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onSupplierSelect: (option: IAsyncOption | null) => void;
  onStoreChange: (value: string) => void;
  onPurchaseDateChange: (value: string) => void;
  onPaidAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onItemChange: <K extends keyof PurchaseItemForm>(
    index: number,
    key: K,
    value: PurchaseItemForm[K]
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => Promise<boolean>;
  onOpenSupplierModal: () => void;
  onCloseSupplierModal: () => void;
  onOpenProductModal: (index: number) => void;
  onCloseProductModal: () => void;
  onSupplierFormChange: (key: keyof InlineSupplierForm, value: string) => void;
  onProductFormChange: <K extends keyof InlineProductForm>(
    key: K,
    value: InlineProductForm[K]
  ) => void;
  onPaymentFormChange: <K extends keyof PurchasePaymentForm>(
    key: K,
    value: PurchasePaymentForm[K]
  ) => void;
  onEditFormChange: (key: keyof PurchaseEditForm, value: string) => void;
  onCancelFormChange: (key: keyof PurchaseCancelForm, value: string) => void;
  onFilterChange: (key: keyof PurchaseListFilters, value: string) => void;
  onCreateSupplier: () => Promise<boolean>;
  onCreateProduct: () => Promise<boolean>;
  loadSupplierOptions: (params: {
    search: string;
    page: number;
  }) => Promise<{
    items: IAsyncOption[];
    currentPage: number;
    totalPages: number;
  }>;
  loadProductOptions: (params: {
    search: string;
    page: number;
  }) => Promise<{
    items: IAsyncOption[];
    currentPage: number;
    totalPages: number;
  }>;
  onProductSelect: (index: number, option: IAsyncOption | null) => void;
  onOpenPurchaseDetail: (purchaseId: string) => void;
  onClosePurchaseDetail: () => void;
  onSubmitPurchasePayment: () => Promise<boolean>;
  onSubmitPurchaseEdit: () => Promise<boolean>;
  onSubmitPurchaseCancel: () => Promise<boolean>;
  onApplyFilters: () => Promise<void>;
  onClearFilters: () => Promise<void>;
  onChangePage: (page: number) => Promise<void>;
}

export const PurchasesManagementView = ({
  purchases,
  suppliers,
  stores,
  categories,
  supplierId,
  selectedSupplierOption,
  storeId,
  purchaseDate,
  paidAmount,
  note,
  items,
  loading,
  submitting,
  error,
  isSupplierModalOpen,
  isProductModalOpen,
  supplierForm,
  productForm,
  supplierSubmitting,
  productSubmitting,
  modalError,
  selectedPurchase,
  isPurchaseDetailModalOpen,
  detailLoading,
  detailSubmitting,
  detailError,
  paymentForm,
  editForm,
  cancelForm,
  filters,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onSupplierSelect,
  onStoreChange,
  onPurchaseDateChange,
  onPaidAmountChange,
  onNoteChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  onOpenSupplierModal,
  onCloseSupplierModal,
  onOpenProductModal,
  onCloseProductModal,
  onSupplierFormChange,
  onProductFormChange,
  onPaymentFormChange,
  onEditFormChange,
  onCancelFormChange,
  onFilterChange,
  onCreateSupplier,
  onCreateProduct,
  loadSupplierOptions,
  loadProductOptions,
  onProductSelect,
  onOpenPurchaseDetail,
  onClosePurchaseDetail,
  onSubmitPurchasePayment,
  onSubmitPurchaseEdit,
  onSubmitPurchaseCancel,
  onApplyFilters,
  onClearFilters,
  onChangePage,
}: PurchasesManagementViewProps) => {
  return (
    <FeatureScreen>
      <FeatureScreenHeader
        title='Compras'
        description='Registra abastecimientos a proveedor, crea proveedor o producto inline y aumenta el stock con trazabilidad.'
      />

      <Box className='grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]'>
        <PurchaseRegistrationForm
          stores={stores}
          supplierId={supplierId}
          selectedSupplierOption={selectedSupplierOption}
          storeId={storeId}
          purchaseDate={purchaseDate}
          paidAmount={paidAmount}
          note={note}
          items={items}
          submitting={submitting}
          error={error}
          onSupplierSelect={onSupplierSelect}
          onStoreChange={onStoreChange}
          onPurchaseDateChange={onPurchaseDateChange}
          onPaidAmountChange={onPaidAmountChange}
          onNoteChange={onNoteChange}
          onItemChange={onItemChange}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onSubmit={onSubmit}
          onOpenSupplierModal={onOpenSupplierModal}
          onOpenProductModal={onOpenProductModal}
          loadSupplierOptions={loadSupplierOptions}
          loadProductOptions={loadProductOptions}
          onProductSelect={onProductSelect}
        />

        <PurchasesListPanel
          purchases={purchases}
          suppliers={suppliers}
          loading={loading}
          filters={filters}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onOpenDetail={onOpenPurchaseDetail}
          onFilterChange={onFilterChange}
          onApplyFilters={onApplyFilters}
          onClearFilters={onClearFilters}
          onChangePage={onChangePage}
        />
      </Box>

      {isSupplierModalOpen ? (
        <CreateSupplierModal
          supplierForm={supplierForm}
          submitting={supplierSubmitting}
          error={modalError}
          onClose={onCloseSupplierModal}
          onSupplierFormChange={onSupplierFormChange}
          onCreateSupplier={onCreateSupplier}
        />
      ) : null}

      {isProductModalOpen ? (
        <CreateProductModal
          categories={categories}
          productForm={productForm}
          submitting={productSubmitting}
          error={modalError}
          onClose={onCloseProductModal}
          onProductFormChange={onProductFormChange}
          onCreateProduct={onCreateProduct}
        />
      ) : null}

      <PurchaseDetailModal
        purchase={selectedPurchase}
        isOpen={isPurchaseDetailModalOpen}
        loading={detailLoading}
        submitting={detailSubmitting}
        error={detailError}
        paymentForm={paymentForm}
        editForm={editForm}
        cancelForm={cancelForm}
        onClose={onClosePurchaseDetail}
        onPaymentFormChange={onPaymentFormChange}
        onEditFormChange={onEditFormChange}
        onCancelFormChange={onCancelFormChange}
        onSubmitPayment={onSubmitPurchasePayment}
        onSubmitEdit={onSubmitPurchaseEdit}
        onSubmitCancel={onSubmitPurchaseCancel}
      />
    </FeatureScreen>
  );
};

export default PurchasesManagementView;
