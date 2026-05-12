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
import { multiPartClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
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
    const formData = new FormData();
    formData.append('amount', String(payload.amount));
    formData.append('paymentMethod', payload.paymentMethod);
    if (payload.note) {
      formData.append('note', payload.note);
    }
    if (payload.reference) {
      formData.append('reference', payload.reference);
    }
    if (payload.paidAt) {
      formData.append('paidAt', payload.paidAt);
    }
    if (payload.receiptImage) {
      formData.append('receiptImage', payload.receiptImage);
    }

    return ErrorHandler.handleApiErrors(() =>
      multiPartClientHTTP.post<IPurchaseResp>(
        `/purchases/${id}/payments`,
        formData,
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
