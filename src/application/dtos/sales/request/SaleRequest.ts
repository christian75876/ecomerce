export interface ICreateSaleRequest {
  customerId?: string;
  storeId?: string;
  cashSessionId?: string;
  paymentMethod?: 'CASH' | 'CREDIT';
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
