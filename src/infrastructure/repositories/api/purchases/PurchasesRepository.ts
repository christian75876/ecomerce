import {
  ICancelPurchaseRequest,
  ICreatePurchaseRequest,
  IGetPurchasesQuery,
  IRegisterPurchasePaymentRequest,
  IUpdatePurchaseRequest,
} from '@/application/dtos/purchases/request/PurchaseRequest';
import {
  IPurchaseResp,
  IPurchasesResp,
} from '@/application/dtos/purchases/response/PurchaseResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class PurchasesRepository {
  static async getPurchases(
    query?: IGetPurchasesQuery,
  ): Promise<IPurchasesResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IPurchasesResp>('/purchases', {
        params: query,
      }),
    );
  }

  static async createPurchase(
    payload: ICreatePurchaseRequest,
  ): Promise<IPurchaseResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IPurchaseResp>('/purchases', payload),
    );
  }

  static async getPurchaseById(id: string): Promise<IPurchaseResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IPurchaseResp>(`/purchases/${id}`),
    );
  }

  static async updatePurchase(
    id: string,
    payload: IUpdatePurchaseRequest,
  ): Promise<IPurchaseResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IPurchaseResp>(`/purchases/${id}`, payload),
    );
  }

  static async registerPurchasePayment(
    id: string,
    payload: IRegisterPurchasePaymentRequest,
  ): Promise<IPurchaseResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IPurchaseResp>(
        `/purchases/${id}/payments`,
        payload,
      ),
    );
  }

  static async cancelPurchase(
    id: string,
    payload?: ICancelPurchaseRequest,
  ): Promise<IPurchaseResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IPurchaseResp>(
        `/purchases/${id}/cancel`,
        payload ?? {},
      ),
    );
  }
}
