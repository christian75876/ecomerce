import {
  IFavoriteIdsResp,
  IFavoriteProductsResp,
} from '@/application/dtos/products/response/FavoriteResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class FavoritesRepository {
  static async getFavoriteProducts(): Promise<IFavoriteProductsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IFavoriteProductsResp>('/products/favorites/me'),
    );
  }

  static async getFavoriteIds(): Promise<IFavoriteIdsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IFavoriteIdsResp>('/products/favorites/me/ids'),
    );
  }

  static async favoriteProduct(productId: string) {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post(`/products/${productId}/favorite`),
    );
  }

  static async unfavoriteProduct(productId: string) {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.delete(`/products/${productId}/favorite`),
    );
  }
}
