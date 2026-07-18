import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';
import type {
  IAdvertisingDashboardResp,
  IStoreAdvertisementsResp,
  IStoreAdvertisementResp,
} from '@/application/dtos/advertising/AdvertisingResponse';

export interface IRegisterAdvertisementDto {
  storeId: string;
  startDate: string;
  endDate: string;
  paidAmount: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'OTHER';
  notes?: string;
}

export class AdvertisingRepository {
  static async getDashboard(): Promise<IAdvertisingDashboardResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IAdvertisingDashboardResp>('/advertising/admin-dashboard'),
    );
  }

  static async getStoreAdvertisements(storeId: string): Promise<IStoreAdvertisementsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IStoreAdvertisementsResp>(`/advertising/stores/${storeId}`),
    );
  }

  static async registerAdvertisement(dto: IRegisterAdvertisementDto): Promise<IStoreAdvertisementResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IStoreAdvertisementResp>('/advertising', dto),
    );
  }

  static async cancelAdvertisement(id: string): Promise<IStoreAdvertisementResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IStoreAdvertisementResp>(`/advertising/${id}/cancel`, {}),
    );
  }
}
