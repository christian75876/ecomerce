import { IAsyncOption } from '@/application/dtos/common/AsyncOption';
import { PurchasePaymentMethod } from '@/domain/models/purchases/Purchase';

export type PurchaseItemForm = {
  productId: string;
  quantity: string;
  unitCost: string;
  expiresAt: string;
  batchCode: string;
  selectedProductOption: IAsyncOption | null;
};

export type InlineSupplierForm = {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export type InlineProductForm = {
  name: string;
  description: string;
  sku: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  showStock: boolean;
  isPerishable: boolean;
  trackBatches: boolean;
};

export type PurchasePaymentForm = {
  amount: string;
  paymentMethod: PurchasePaymentMethod;
  note: string;
  reference: string;
  paidAt: string;
  receiptImage: File | null;
};

export type PurchaseEditForm = {
  purchaseDate: string;
  note: string;
};

export type PurchaseCancelForm = {
  reason: string;
};

export type PurchaseListFilters = {
  search: string;
  supplierId: string;
  dateFrom: string;
  dateTo: string;
};
