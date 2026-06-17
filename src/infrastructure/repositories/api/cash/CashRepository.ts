import {
  ICloseCashSessionRequest,
  ICreateCashMovementRequest,
  IOpenCashSessionRequest,
} from '@/application/dtos/cash/request/CashRequest';
import {
  ICashMovementResp,
  ICashMovementsResp,
  ICashSessionResp,
  ICashSessionsResp,
} from '@/application/dtos/cash/response/CashResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class CashRepository {
  static async getSessions(storeId?: string | null): Promise<ICashSessionsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ICashSessionsResp>('/cash/sessions', { params: storeId ? { storeId } : undefined }),
    );
  }

  static async openSession(
    payload: IOpenCashSessionRequest,
  ): Promise<ICashSessionResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ICashSessionResp>('/cash/sessions', payload),
    );
  }

  static async closeSession(
    id: string,
    payload: ICloseCashSessionRequest,
  ): Promise<ICashSessionResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<ICashSessionResp>(
        `/cash/sessions/${id}/close`,
        payload,
      ),
    );
  }

  static async getSessionMovements(id: string): Promise<ICashMovementsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ICashMovementsResp>(
        `/cash/sessions/${id}/movements`,
      ),
    );
  }

  static async createMovement(
    sessionId: string,
    payload: ICreateCashMovementRequest,
  ): Promise<ICashMovementResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ICashMovementResp>(
        `/cash/sessions/${sessionId}/movements`,
        payload,
      ),
    );
  }
}
