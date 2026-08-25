import {
  ICreateProductRequest,
  ICreateProductVariantRequest,
  IProductsQuery,
  IUpdateProductRequest,
  IUpdateProductVariantRequest,
} from '@/application/dtos/products/request/ProductRequest';
import {
  IMarketplaceSectionsResp,
} from '@/application/dtos/products/response/MarketplaceResponse';
import {
  IProductImageResp,
  IProductImagesResp,
  IProductResp,
  IProductsResp,
  IProductVariantResp,
  IProductVariantsResp,
  IProductVideoResp,
  IProductVideosResp,
  IRelatedProductsResp,
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

    if (query.sortBy) {
      params.set('sortBy', query.sortBy);
    }

    if (query.seed) {
      params.set('seed', query.seed);
    }

    if (query.sponsoredOnly) {
      params.set('sponsoredOnly', String(query.sponsoredOnly));
    }

    if (query.minPrice !== undefined) {
      params.set('minPrice', String(query.minPrice));
    }

    if (query.maxPrice !== undefined) {
      params.set('maxPrice', String(query.maxPrice));
    }

    if (query.onlyAvailable) {
      params.set('onlyAvailable', String(query.onlyAvailable));
    }

    if (query.limit !== undefined) {
      params.set('limit', String(query.limit));
    }

    if (query.page !== undefined) {
      params.set('page', String(query.page));
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';

    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IProductsResp>(`/products${suffix}`),
    );
  }

  static async createProduct(
    payload: ICreateProductRequest,
  ): Promise<IProductResp> {
    return ErrorHandler.handleApiErrors(
      () => authenticatedClientHTTP.post<IProductResp>('/products', payload),
      () => {},
    );
  }

  static async updateProduct(
    id: string,
    payload: IUpdateProductRequest,
  ): Promise<IProductResp> {
    return ErrorHandler.handleApiErrors(
      () => authenticatedClientHTTP.patch<IProductResp>(`/products/${id}`, payload),
      () => {},
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

  static async getRelatedProducts(id: string): Promise<IRelatedProductsResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IRelatedProductsResp>(`/products/${id}/related`),
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

  static async uploadProductImage(productId: string, file: File): Promise<IProductResp> {
    const formData = new FormData();
    formData.append('image', file);
    return ErrorHandler.handleApiErrors(
      () =>
        authenticatedClientHTTP.post<IProductResp>(`/products/${productId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      () => {},
    );
  }

  static async getProductVideos(productId: string): Promise<IProductVideosResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IProductVideosResp>(`/products/${productId}/videos`),
    );
  }

  static async addProductVideo(
    productId: string,
    videoUrl: string,
    title?: string,
  ): Promise<IProductVideoResp> {
    return ErrorHandler.handleApiErrors(
      () =>
        authenticatedClientHTTP.post<IProductVideoResp>(`/products/${productId}/videos`, {
          videoUrl,
          title,
        }),
      () => {},
    );
  }

  static async removeProductVideo(productId: string, videoId: string): Promise<void> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.delete(`/products/${productId}/videos/${videoId}`),
    );
  }

  static async getProductGallery(productId: string): Promise<IProductImagesResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IProductImagesResp>(`/products/${productId}/gallery`),
    );
  }

  static async uploadGalleryImage(productId: string, file: File): Promise<IProductImageResp> {
    const formData = new FormData();
    formData.append('image', file);
    return ErrorHandler.handleApiErrors(
      () =>
        authenticatedClientHTTP.post<IProductImageResp>(
          `/products/${productId}/gallery`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        ),
      () => {},
    );
  }

  static async removeGalleryImage(productId: string, imageId: string): Promise<void> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.delete(`/products/${productId}/gallery/${imageId}`),
    );
  }

  static async reorderGallery(productId: string, imageIds: string[]): Promise<IProductImagesResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IProductImagesResp>(
        `/products/${productId}/gallery/reorder`,
        { imageIds },
      ),
    );
  }

  // ── Variants ───────────────────────────────────────────────────────────────

  static async getVariants(productId: string): Promise<IProductVariantsResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IProductVariantsResp>(`/products/${productId}/variants`),
    );
  }

  static async createVariant(
    productId: string,
    payload: ICreateProductVariantRequest,
  ): Promise<IProductVariantResp> {
    return ErrorHandler.handleApiErrors(
      () => authenticatedClientHTTP.post<IProductVariantResp>(`/products/${productId}/variants`, payload),
      () => {},
    );
  }

  static async updateVariant(
    productId: string,
    variantId: string,
    payload: IUpdateProductVariantRequest,
  ): Promise<IProductVariantResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IProductVariantResp>(
        `/products/${productId}/variants/${variantId}`,
        payload,
      ),
    );
  }

  static async deleteVariant(productId: string, variantId: string): Promise<void> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.delete(`/products/${productId}/variants/${variantId}`),
    );
  }
}
