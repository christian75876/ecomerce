export interface ICreatePurchaseRequest {
  supplierId: string;
  storeId: string;
  purchaseDate: string;
  paidAmount?: number;
  note?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
    expiresAt?: string;
    batchCode?: string;
  }>;
}

export interface IUpdatePurchaseRequest {
  purchaseDate?: string;
  note?: string;
}

export interface IRegisterPurchasePaymentRequest {
  amount: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  note?: string;
  reference?: string;
  paidAt?: string;
  receiptImage?: File | null;
}

export interface ICancelPurchaseRequest {
  reason?: string;
}

export interface IGetPurchasesQuery {
  search?: string;
  supplierId?: string;
  storeId?: string | null;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
