import { ISalesHistoryParams, ICreateSaleRequest } from '@/application/dtos/sales/request/SaleRequest';
import {
  ISaleResp,
  ISalesHistoryResp,
  ISalesResp,
} from '@/application/dtos/sales/response/SaleResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class SalesRepository {
  static async getSales(): Promise<ISalesResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ISalesResp>('/sales'),
    );
  }

  static async getSalesHistory(params: ISalesHistoryParams = {}): Promise<ISalesHistoryResp> {
    const query = new URLSearchParams();
    if (params.storeId)      query.set('storeId',       params.storeId);
    if (params.paymentMethod) query.set('paymentMethod', params.paymentMethod);
    if (params.deliveryType) query.set('deliveryType',  params.deliveryType);
    if (params.from)         query.set('from',          params.from);
    if (params.to)           query.set('to',            params.to);
    if (params.search)       query.set('search',        params.search);
    if (params.page)         query.set('page',          String(params.page));
    if (params.limit)        query.set('limit',         String(params.limit));
    const qs = query.toString();
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ISalesHistoryResp>(`/sales/unified-history${qs ? `?${qs}` : ''}`),
    );
  }

  static async getSaleById(id: string): Promise<ISaleResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ISaleResp>(`/sales/${id}`),
    );
  }

  static async createSale(payload: ICreateSaleRequest): Promise<ISaleResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ISaleResp>('/sales', payload),
    );
  }
}
