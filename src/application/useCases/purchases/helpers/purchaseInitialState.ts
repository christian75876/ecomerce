import {
  InlineProductForm,
  InlineSupplierForm,
  PurchaseCancelForm,
  PurchaseEditForm,
  PurchaseItemForm,
  PurchaseListFilters,
  PurchasePaymentForm,
} from '../purchase.types';

export const createEmptyPurchaseItem = (): PurchaseItemForm => ({
  productId: '',
  quantity: '1',
  unitCost: '',
  expiresAt: '',
  batchCode: '',
  selectedProductOption: null,
});

export const emptySupplierForm: InlineSupplierForm = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

export const emptyProductForm: InlineProductForm = {
  name: '',
  description: '',
  sku: '',
  price: '',
  categoryId: '',
  imageUrl: '',
  showStock: true,
  isPerishable: false,
  trackBatches: true,
};

export const emptyPaymentForm: PurchasePaymentForm = {
  amount: '',
  paymentMethod: 'CASH',
  note: '',
  reference: '',
  paidAt: '',
  receiptImage: null,
};

export const emptyEditForm: PurchaseEditForm = {
  purchaseDate: '',
  note: '',
};

export const emptyCancelForm: PurchaseCancelForm = {
  reason: '',
};

export const emptyPurchaseFilters: PurchaseListFilters = {
  search: '',
  supplierId: '',
  dateFrom: '',
  dateTo: '',
};
