import { ICreateInventoryMovementRequest } from '@/application/dtos/inventory/request/InventoryRequest';
import {
  IInventoryMovementResp,
  IInventoryMovementsResp,
  IInventoryResp,
} from '@/application/dtos/inventory/response/InventoryResponse';
import {
  authenticatedClientHTTP,
  publicClientHTTP,
} from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class InventoryRepository {
  static async getInventory(): Promise<IInventoryResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IInventoryResp>('/inventory'),
    );
  }

  static async getMovements(productId?: string): Promise<IInventoryMovementsResp> {
    const suffix = productId ? `?productId=${productId}` : '';

    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IInventoryMovementsResp>(`/inventory/movements${suffix}`),
    );
  }

  static async createMovement(
    payload: ICreateInventoryMovementRequest,
  ): Promise<IInventoryMovementResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IInventoryMovementResp>(
        '/inventory/movements',
        payload,
      ),
    );
  }
}
