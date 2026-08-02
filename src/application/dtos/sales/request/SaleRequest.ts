export interface ISalesHistoryParams {
  storeId?: string;
  paymentMethod?: 'CASH' | 'CREDIT';
  deliveryType?: 'LOCAL' | 'SHIPPING' | 'NONE';
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ICreateSaleRequest {
  customerId?: string;
  storeId?: string;
  cashSessionId?: string;
  paymentMethod?: 'CASH' | 'CREDIT';
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  // Guest customer
  guestName?: string;
  guestPhone?: string;
  guestDocType?: string;
  guestDoc?: string;
  // Delivery
  deliveryType?: 'LOCAL' | 'SHIPPING';
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryNotes?: string;
}
