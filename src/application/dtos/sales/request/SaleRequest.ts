export interface ICreateSaleRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
