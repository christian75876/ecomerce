import {
  ICreateInventoryEntryRequest,
  ICreateInventoryMovementRequest,
} from '@/application/dtos/inventory/request/InventoryRequest';
import {
  IInventoryBatchResp,
  IInventoryBatchesResp,
  IInventoryMovementResp,
  IInventoryMovementsResp,
  IInventoryResp,
} from '@/application/dtos/inventory/response/InventoryResponse';
import {
  authenticatedClientHTTP,
} from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class InventoryRepository {
  static async getInventory(): Promise<IInventoryResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IInventoryResp>('/inventory'),
    );
  }

  static async getMovements(productId?: string): Promise<IInventoryMovementsResp> {
    const suffix = productId ? `?productId=${productId}` : '';

    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IInventoryMovementsResp>(`/inventory/movements${suffix}`),
    );
  }

  static async getBatches(query?: {
    productId?: string;
    storeId?: string;
    supplierId?: string;
    status?: string;
  }): Promise<IInventoryBatchesResp> {
    const params = new URLSearchParams();

    if (query?.productId) params.set('productId', query.productId);
    if (query?.storeId) params.set('storeId', query.storeId);
    if (query?.supplierId) params.set('supplierId', query.supplierId);
    if (query?.status) params.set('status', query.status);

    const suffix = params.toString() ? `?${params.toString()}` : '';

    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IInventoryBatchesResp>(`/inventory/batches${suffix}`),
    );
  }

  static async getExpiring(days = 30, storeId?: string): Promise<IInventoryBatchesResp> {
    const params = new URLSearchParams();
    params.set('days', String(days));
    if (storeId) params.set('storeId', storeId);

    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IInventoryBatchesResp>(
        `/inventory/expiring?${params.toString()}`,
      ),
    );
  }

  static async createEntry(
    payload: ICreateInventoryEntryRequest,
  ): Promise<IInventoryBatchResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IInventoryBatchResp>('/inventory/entries', payload),
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
