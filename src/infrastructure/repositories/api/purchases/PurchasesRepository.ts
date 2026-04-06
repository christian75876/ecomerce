import { ICreatePurchaseRequest } from '@/application/dtos/purchases/request/PurchaseRequest';
import {
  IPurchaseResp,
  IPurchasesResp,
} from '@/application/dtos/purchases/response/PurchaseResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class PurchasesRepository {
  static async getPurchases(): Promise<IPurchasesResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IPurchasesResp>('/purchases'),
    );
  }

  static async createPurchase(
    payload: ICreatePurchaseRequest,
  ): Promise<IPurchaseResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IPurchaseResp>('/purchases', payload),
    );
  }
}
