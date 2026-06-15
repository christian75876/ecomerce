import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export type CouponType = 'PERCENTAGE' | 'FIXED';

export interface ICoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICouponValidation {
  valid: boolean;
  coupon?: { id: string; code: string; type: CouponType; value: number };
  discountAmount?: number;
  message?: string;
}

export interface ICreateCouponRequest {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
}

export type ICouponsResp = IApiResponse<ICoupon[]>;
export type ICouponResp = IApiResponse<ICoupon>;
