import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IOrder {
  id: string;
  customerId: string;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
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
    };
  }>;
}

export type IOrdersResp = IApiResponse<IOrder[]>;
export type IOrderResp = IApiResponse<IOrder>;
