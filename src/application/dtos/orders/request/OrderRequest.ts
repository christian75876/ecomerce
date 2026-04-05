export interface ICreateOrderRequest {
  customerId?: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface IUpdateOrderStatusRequest {
  status:
    | 'PENDING'
    | 'PAID'
    | 'PREPARING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';
}
