import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export type PurchaseStatus = 'OPEN' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface IPurchasesListData {
  items: IPurchase[];
  pagination: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface IPurchase {
  id: string;
  supplierId: string;
  storeId: string;
  purchaseDate: string;
  total: number;
  paidAmount: number;
  balance: number;
  status: PurchaseStatus;
  note: string | null;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  canCancel?: boolean;
  cancellationBlockedReason?: string | null;
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
  payments: Array<{
    id: string;
    amount: number;
    note: string | null;
    paidAt: string;
    createdAt: string;
  }>;
}

export type IPurchasesResp = IApiResponse<IPurchasesListData>;
export type IPurchaseResp = IApiResponse<IPurchase>;
