import {
  ICreateCategoryRequest,
  IUpdateCategoryRequest,
} from '@/application/dtos/categories/request/CategoryRequest';
import {
  ICategoriesResp,
  ICategoryCollectionResp,
  ICategoryCollectionsResp,
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

  static async getCollections(): Promise<ICategoryCollectionsResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<ICategoryCollectionsResp>('/categories/collections'),
    );
  }

  static async getCollection(slug: string): Promise<ICategoryCollectionResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<ICategoryCollectionResp>(`/categories/collections/${encodeURIComponent(slug)}`),
    );
  }

  // Panel de gestión (seller/admin): a diferencia de getCategories (catálogo
  // público), el backend SIEMPRE restringe a las tiendas del usuario
  // autenticado (más las categorías globales) — necesario para que un
  // seller no vea/edite categorías de otras tiendas.
  static async getMyCategories(active?: boolean): Promise<ICategoriesResp> {
    const query = typeof active === 'boolean' ? `?active=${active}` : '';

    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ICategoriesResp>(`/categories/mine${query}`),
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
