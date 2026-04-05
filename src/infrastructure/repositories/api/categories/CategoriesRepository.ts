import {
  ICreateCategoryRequest,
  IUpdateCategoryRequest,
} from '@/application/dtos/categories/request/CategoryRequest';
import {
  ICategoriesResp,
  ICategoryResp,
} from '@/application/dtos/categories/response/CategoryResponse';
import {
  authenticatedClientHTTP,
  publicClientHTTP,
} from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class CategoriesRepository {
  static async getCategories(active?: boolean): Promise<ICategoriesResp> {
    const query = typeof active === 'boolean' ? `?active=${active}` : '';

    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<ICategoriesResp>(`/categories${query}`),
    );
  }

  static async createCategory(
    payload: ICreateCategoryRequest,
  ): Promise<ICategoryResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ICategoryResp>('/categories', payload),
    );
  }

  static async updateCategory(
    id: string,
    payload: IUpdateCategoryRequest,
  ): Promise<ICategoryResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<ICategoryResp>(`/categories/${id}`, payload),
    );
  }
}
