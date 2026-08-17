import {
  authenticatedClientHTTP,
  multiPartClientHTTP,
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

export interface IUpdateStoreNotificationsRequest {
  wppNotificationsEnabled?: boolean;
  wppApiKey?: string;
  whatsappNumber?: string;
}

export class StoresRepository {
  static async getMyStores(): Promise<IStoresResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IStoresResp>('/stores/mine'),
    );
  }

  static async updateStoreNotifications(
    id: string,
    payload: IUpdateStoreNotificationsRequest,
  ): Promise<IStoreResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IStoreResp>(`/stores/${id}/notifications`, payload),
    );
  }

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

  static async deleteStore(id: string): Promise<void> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.delete<void>(`/stores/${id}`),
    );
  }

  static async uploadLogo(id: string, file: File): Promise<IStoreResp> {
    const formData = new FormData();
    formData.append('image', file);
    return ErrorHandler.handleApiErrors(() =>
      multiPartClientHTTP.post<IStoreResp>(`/stores/${id}/logo`, formData),
    );
  }

  static async uploadBanner(id: string, file: File): Promise<IStoreResp> {
    const formData = new FormData();
    formData.append('image', file);
    return ErrorHandler.handleApiErrors(() =>
      multiPartClientHTTP.post<IStoreResp>(`/stores/${id}/banner`, formData),
    );
  }
}
