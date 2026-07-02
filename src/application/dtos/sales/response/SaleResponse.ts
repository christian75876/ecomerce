import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface ISale {
  id: string;
  paymentMethod: 'CASH' | 'CREDIT';
  customerId: string | null;
  storeId: string | null;
  cashSessionId: string | null;
  total: number;
  createdAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
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

export type ISalesResp = IApiResponse<ISale[]>;
export type ISaleResp = IApiResponse<ISale>;
