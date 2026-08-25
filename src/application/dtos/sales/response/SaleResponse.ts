import { IApiResponse, IFlatPaginatedData } from '@/application/dtos/common/HttpResponse';

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
  store?: {
    id: string;
    name: string;
  } | null;
  // Guest customer
  guestName?: string | null;
  guestPhone?: string | null;
  guestDocType?: string | null;
  guestDoc?: string | null;
  // Delivery
  deliveryType?: 'LOCAL' | 'SHIPPING' | null;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  deliveryNotes?: string | null;
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

export interface ISalesHistoryResponse {
  items: ISale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ISalesResp = IApiResponse<IFlatPaginatedData<ISale>>;
export type ISaleResp = IApiResponse<ISale>;
export type ISalesHistoryResp = IApiResponse<ISalesHistoryResponse>;
