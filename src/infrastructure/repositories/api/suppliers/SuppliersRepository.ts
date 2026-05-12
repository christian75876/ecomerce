import {
  ICreateSupplierRequest,
  IUpdateSupplierRequest,
} from '@/application/dtos/suppliers/request/SupplierRequest';
import {
  ISupplierResp,
  ISuppliersResp,
} from '@/application/dtos/suppliers/response/SupplierResponse';
import { IApiResponse } from '@/application/dtos/common/HttpResponse';
import { IAsyncOptionsData } from '@/application/dtos/common/AsyncOption';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class SuppliersRepository {
  static async getSuppliers(search?: string): Promise<ISuppliersResp> {
    const suffix = search ? `?search=${encodeURIComponent(search)}` : '';
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ISuppliersResp>(`/suppliers${suffix}`),
    );
  }

  static async createSupplier(
    payload: ICreateSupplierRequest,
  ): Promise<ISupplierResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ISupplierResp>('/suppliers', payload),
    );
  }

  static async updateSupplier(
    id: string,
    payload: IUpdateSupplierRequest,
  ): Promise<ISupplierResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<ISupplierResp>(`/suppliers/${id}`, payload),
    );
  }

  static async getSupplierOptions(query: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<IApiResponse<IAsyncOptionsData>> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IApiResponse<IAsyncOptionsData>>(
        '/suppliers/options',
        { params: query },
      ),
    );
  }
}
