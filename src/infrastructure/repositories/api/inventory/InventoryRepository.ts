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
  static async getInventory(page = 1, limit = 20): Promise<IInventoryResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IInventoryResp>('/inventory', { params: { page, limit } }),
    );
  }

  static async getMovements(productId?: string, page = 1, limit = 20): Promise<IInventoryMovementsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IInventoryMovementsResp>('/inventory/movements', {
        params: { ...(productId ? { productId } : {}), page, limit },
      }),
    );
  }

  static async getBatches(query?: {
    productId?: string;
    storeId?: string;
    supplierId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<IInventoryBatchesResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IInventoryBatchesResp>('/inventory/batches', {
        params: {
          ...(query?.productId ? { productId: query.productId } : {}),
          ...(query?.storeId ? { storeId: query.storeId } : {}),
          ...(query?.supplierId ? { supplierId: query.supplierId } : {}),
          ...(query?.status ? { status: query.status } : {}),
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
        },
      }),
    );
  }

  static async getExpiring(days = 30, storeId?: string, page = 1, limit = 20): Promise<IInventoryBatchesResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IInventoryBatchesResp>('/inventory/expiring', {
        params: { days, ...(storeId ? { storeId } : {}), page, limit },
      }),
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
