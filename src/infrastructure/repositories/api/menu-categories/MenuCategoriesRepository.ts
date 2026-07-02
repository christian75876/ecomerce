import { authenticatedClientHTTP, publicClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';
import {
  IMenuCategoriesResp,
  IMenuCategoryResp,
} from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import {
  ICreateMenuCategoryRequest,
  IUpdateMenuCategoryRequest,
} from '@/application/dtos/menu-categories/request/MenuCategoryRequest';
import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export class MenuCategoriesRepository {
  static async getByStore(storeId: string): Promise<IMenuCategoriesResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IMenuCategoriesResp>(`/menu-categories?storeId=${storeId}`),
    );
  }

  static async create(payload: ICreateMenuCategoryRequest): Promise<IMenuCategoryResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IMenuCategoryResp>('/menu-categories', payload),
    );
  }

  static async update(id: string, payload: IUpdateMenuCategoryRequest): Promise<IMenuCategoryResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IMenuCategoryResp>(`/menu-categories/${id}`, payload),
    );
  }

  static async remove(id: string): Promise<IApiResponse<{ removed: boolean }>> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.delete<IApiResponse<{ removed: boolean }>>(`/menu-categories/${id}`),
    );
  }
}
