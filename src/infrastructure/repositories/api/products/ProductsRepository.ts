import {
  ICreateProductRequest,
  IProductsQuery,
  IUpdateProductRequest,
} from '@/application/dtos/products/request/ProductRequest';
import {
  IMarketplaceSectionsResp,
} from '@/application/dtos/products/response/MarketplaceResponse';
import {
  IProductResp,
  IProductsResp,
} from '@/application/dtos/products/response/ProductResponse';
import { IApiResponse } from '@/application/dtos/common/HttpResponse';
import { IAsyncOptionsData } from '@/application/dtos/common/AsyncOption';
import {
  authenticatedClientHTTP,
  publicClientHTTP,
} from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class ProductRepository {
  static async getProducts(query: IProductsQuery = {}): Promise<IProductsResp> {
    const params = new URLSearchParams();

    if (query.search) {
      params.set('search', query.search);
    }

    if (query.categoryId) {
      params.set('categoryId', query.categoryId);
    }

    if (query.storeId) {
      params.set('storeId', query.storeId);
    }

    if (typeof query.active === 'boolean') {
      params.set('active', String(query.active));
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';

    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IProductsResp>(`/products${suffix}`),
    );
  }

  static async createProduct(
    payload: ICreateProductRequest,
  ): Promise<IProductResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IProductResp>('/products', payload),
    );
  }

  static async updateProduct(
    id: string,
    payload: IUpdateProductRequest,
  ): Promise<IProductResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IProductResp>(`/products/${id}`, payload),
    );
  }

  static async updateStatus(
    id: string,
    isActive: boolean,
  ): Promise<IProductResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IProductResp>(`/products/${id}/status`, {
        isActive,
      }),
    );
  }

  static async getProductById(id: string): Promise<IProductResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IProductResp>(`/products/${id}`),
    );
  }

  static async getRelatedProducts(id: string): Promise<IProductsResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IProductsResp>(`/products/${id}/related`),
    );
  }

  static async getMarketplaceSections(): Promise<IMarketplaceSectionsResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IMarketplaceSectionsResp>('/products/featured/sections'),
    );
  }

  static async getProductOptions(query: {
    search?: string;
    storeId?: string;
    page?: number;
    limit?: number;
  }): Promise<IApiResponse<IAsyncOptionsData>> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IApiResponse<IAsyncOptionsData>>(
        '/products/options',
        { params: query },
      ),
    );
  }
}
