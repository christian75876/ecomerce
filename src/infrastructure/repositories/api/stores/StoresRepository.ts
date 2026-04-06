import {
  authenticatedClientHTTP,
  publicClientHTTP,
} from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';
import {
  ICreateStoreRequest,
  IStoresQuery,
  IUpdateStoreRequest,
} from '@/application/dtos/stores/request/StoreRequest';
import {
  IStoreResp,
  IStoresResp,
} from '@/application/dtos/stores/response/StoreResponse';

export class StoresRepository {
  static async getStores(query: IStoresQuery = {}): Promise<IStoresResp> {
    const params = new URLSearchParams();

    if (typeof query.active === 'boolean') {
      params.set('active', String(query.active));
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';

    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IStoresResp>(`/stores${suffix}`),
    );
  }

  static async getStoreBySlug(slug: string): Promise<IStoreResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IStoreResp>(`/stores/slug/${slug}`),
    );
  }

  static async createStore(payload: ICreateStoreRequest): Promise<IStoreResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IStoreResp>('/stores', payload),
    );
  }

  static async updateStore(
    id: string,
    payload: IUpdateStoreRequest,
  ): Promise<IStoreResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IStoreResp>(`/stores/${id}`, payload),
    );
  }
}
