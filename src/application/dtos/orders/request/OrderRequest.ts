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
  deliveryMethod?: 'DELIVERY' | 'PICKUP';
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryDepartment?: string;
  deliveryNotes?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  couponCode?: string;
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

export interface ISubmitPaymentRequest {
  paymentMethodType?: string;
  paymentReference?: string;
  evidenceImage?: File | null;
}
