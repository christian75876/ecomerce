export type PurchaseStatus =
  | 'OPEN'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED';

export type PurchasePaymentMethod = 'CASH' | 'TRANSFER';

export interface PurchasePayment {
  id: string;
  amount: number;
  paymentMethod: PurchasePaymentMethod;
  note: string | null;
  reference?: string | null;
  receiptImagePath?: string | null;
  paidAt: string;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  expiresAt: string | null;
  batchCode: string | null;
  product: {
    id: string;
    name: string;
    sku: string;
    isPerishable?: boolean;
  };
}

export interface Purchase {
  id: string;
  supplierId: string;
  storeId: string;
  purchaseDate: string;
  total: number;
  paidAmount: number;
  balance: number;
  status: PurchaseStatus;
  note: string | null;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  canCancel?: boolean;
  cancellationBlockedReason?: string | null;
  createdAt: string;
  supplier: {
    id: string;
    name: string;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
  items: PurchaseItem[];
  payments: PurchasePayment[];
}
