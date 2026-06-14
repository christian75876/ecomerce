import { IAsyncOption } from '@/application/dtos/common/AsyncOption';
import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import {
  PurchaseEditForm,
  PurchaseItemForm,
  PurchasePaymentForm,
} from '../purchase.types';

export const toDateTimeLocal = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const offset = parsed.getTimezoneOffset();
  const local = new Date(parsed.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
};

export const toIsoDateTimeString = (value: string) =>
  new Date(value).toISOString();

export const normalizePurchaseItems = (items: PurchaseItemForm[]) =>
  items
    .filter((item) => item.productId && item.quantity && item.unitCost)
    .map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitCost: Number(item.unitCost),
      expiresAt: item.expiresAt || undefined,
      batchCode: item.batchCode.trim() || undefined,
    }));

export const createPurchasePaymentPayload = (
  paymentForm: PurchasePaymentForm,
) => ({
  amount: Number(paymentForm.amount),
  paymentMethod: paymentForm.paymentMethod,
  note: paymentForm.note.trim() || undefined,
  reference: paymentForm.reference.trim() || undefined,
  paidAt: paymentForm.paidAt
    ? new Date(paymentForm.paidAt).toISOString()
    : undefined,
  receiptImage: paymentForm.receiptImage,
});

export const createPurchaseEditPayload = (editForm: PurchaseEditForm) => ({
  purchaseDate: toIsoDateTimeString(editForm.purchaseDate),
  note: editForm.note.trim() || undefined,
});

export const mapSupplierToAsyncOption = (supplier: ISupplier): IAsyncOption => ({
  id: supplier.id,
  label: supplier.name,
  secondary: supplier.document ?? null,
  helper: supplier.email ?? supplier.phone ?? 'Sin contacto',
});

export const mapPurchaseProductToAsyncOption = (
  purchase: {
    id: string;
    name: string;
    sku: string;
    isPerishable?: boolean;
    showStock?: boolean;
    storeId?: string | null;
    store?: { name: string } | null;
  },
): IAsyncOption => ({
  id: purchase.id,
  label: purchase.name,
  secondary: purchase.sku,
  helper: purchase.store?.name ?? 'Sin tienda',
  isPerishable: purchase.isPerishable,
  showStock: purchase.showStock,
  storeId: purchase.storeId,
});

export const createHydratedPaymentForm = (
  purchase: IPurchase,
): PurchasePaymentForm => ({
  amount: purchase.balance > 0 ? String(purchase.balance) : '',
  paymentMethod: 'CASH',
  note: '',
  reference: '',
  paidAt: '',
  receiptImage: null,
});

export const createHydratedEditForm = (purchase: IPurchase): PurchaseEditForm => ({
  purchaseDate: toDateTimeLocal(purchase.purchaseDate),
  note: purchase.note ?? '',
});
