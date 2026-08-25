import { IApiResponse, IFlatPaginatedData } from '@/application/dtos/common/HttpResponse';

export interface IOrder {
  id: string;
  customerId: string;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
  updatedAt: string;
  deliveryMethod: 'DELIVERY' | 'PICKUP' | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryDepartment: string | null;
  deliveryNotes: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  couponCode: string | null;
  discountAmount: number;
  paymentMethodType: string | null;
  paymentReference: string | null;
  paymentEvidenceImagePath: string | null;
  paymentStatus: 'NONE' | 'SUBMITTED' | 'CONFIRMED';
  paymentConfirmedAt: string | null;
  paymentConfirmedByUserId: number | null;
  storePaymentInstructions?: string | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product: {
      id: string;
      name: string;
      sku: string;
      imageUrl: string | null;
    };
  }>;
}

export type IOrdersResp = IApiResponse<IFlatPaginatedData<IOrder>>;
export type IOrderResp = IApiResponse<IOrder>;
/** GET /orders/mine returns a bare array, unlike the paginated GET /orders. */
export type IMyOrdersResp = IApiResponse<IOrder[]>;
