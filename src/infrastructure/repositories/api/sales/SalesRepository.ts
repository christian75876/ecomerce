import { ICreateSaleRequest } from '@/application/dtos/sales/request/SaleRequest';
import {
  ISaleResp,
  ISalesResp,
} from '@/application/dtos/sales/response/SaleResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class SalesRepository {
  static async getSales(storeId?: string | null, page = 1, limit = 20): Promise<ISalesResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ISalesResp>('/sales', {
        params: { ...(storeId ? { storeId } : {}), page, limit },
      }),
    );
  }

  static async createSale(payload: ICreateSaleRequest): Promise<ISaleResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ISaleResp>('/sales', payload),
    );
  }
}
