import { authenticatedClientHTTP, publicClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';
import type {
  ICouponsResp,
  ICouponResp,
  ICouponValidation,
  ICreateCouponRequest,
} from '@/application/dtos/coupons/CouponDtos';

export class CouponsRepository {
  static async getCoupons(): Promise<ICouponsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ICouponsResp>('/coupons'),
    );
  }

  static async createCoupon(payload: ICreateCouponRequest): Promise<ICouponResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ICouponResp>('/coupons', payload),
    );
  }

  static async deleteCoupon(id: string): Promise<void> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.delete(`/coupons/${id}`),
    );
  }

  static async validateCoupon(code: string, orderAmount: number): Promise<ICouponValidation> {
    const params = new URLSearchParams({ code, orderAmount: String(orderAmount) });
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<ICouponValidation>(`/coupons/validate?${params.toString()}`),
    );
  }
}
