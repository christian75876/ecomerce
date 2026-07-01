import { IApiResponse } from '@/application/dtos/common/HttpResponse';

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
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  } | null;
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product?: {
      id: string;
      name: string;
      sku: string;
    } | null;
  }>;
}

export interface IOrdersPaginated {
  items: IOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type IOrdersResp = IApiResponse<IOrdersPaginated>;
export type IOrderResp = IApiResponse<IOrder>;
