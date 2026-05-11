import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
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
  products: IProduct[];
  supplierId: string;
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
  onSupplierChange: (value: string) => void;
  onStoreChange: (value: string) => void;
  onPurchaseDateChange: (value: string) => void;
  onPaidAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onItemChange: (
    index: number,
    key: keyof PurchaseItemForm,
    value: string
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
  onPaymentFormChange: (key: keyof PurchasePaymentForm, value: string) => void;
  onEditFormChange: (key: keyof PurchaseEditForm, value: string) => void;
  onCancelFormChange: (key: keyof PurchaseCancelForm, value: string) => void;
  onFilterChange: (key: keyof PurchaseListFilters, value: string) => void;
  onCreateSupplier: () => Promise<boolean>;
  onCreateProduct: () => Promise<boolean>;
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
  products,
  supplierId,
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
  onSupplierChange,
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
          suppliers={suppliers}
          stores={stores}
          products={products}
          supplierId={supplierId}
          storeId={storeId}
          purchaseDate={purchaseDate}
          paidAmount={paidAmount}
          note={note}
          items={items}
          submitting={submitting}
          error={error}
          onSupplierChange={onSupplierChange}
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
