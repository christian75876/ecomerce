import { IProductResp } from '@/application/dtos/products/response/ProductResponse';
import { publicClientHTTP } from '../ClientHTTP';
import { ErrorHandler } from '../errors/ErrorHandler';
import { IProductRequest } from '@/application/dtos/products/request/ProductRequest';

export class ProductRepository {
  /**
   * @Param {string} product - The name of the product
   * @returns {Promise<Product>} - The requested product
   */

  static async getProduct(product: IProductRequest): Promise<IProductResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IProductResp>(`/products/${product.name}`)
    );
  }
}
