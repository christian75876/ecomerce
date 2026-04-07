import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IPurchase {
  id: string;
  supplierId: string;
  storeId: string;
  purchaseDate: string;
  total: number;
  paidAmount: number;
  balance: number;
  note: string | null;
  createdAt: string;
  supplier: {
    id: string;
    name: string;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitCost: number;
    lineTotal: number;
    expiresAt: string | null;
    batchCode: string | null;
    product: {
      id: string;
      name: string;
      sku: string;
      isPerishable?: boolean;
    };
  }>;
}

export type IPurchasesResp = IApiResponse<IPurchase[]>;
export type IPurchaseResp = IApiResponse<IPurchase>;
