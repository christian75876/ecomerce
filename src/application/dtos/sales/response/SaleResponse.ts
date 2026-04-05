import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface ISale {
  id: string;
  total: number;
  createdAt: string;
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
