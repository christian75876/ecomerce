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
  }>;
}
