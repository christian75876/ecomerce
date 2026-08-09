import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IReviewImage {
  id: string;
  url: string;
}

export interface IReview {
  id: string;
  customerId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  images: IReviewImage[];
}

export interface IProductReviewsData {
  reviews: IReview[];
  summary: {
    totalReviews: number;
    averageRating: number;
  };
}

export interface IReviewEligibility {
  canReview: boolean;
  hasPurchased: boolean;
  review: IReview | null;
}

export type IProductReviewsResp = IApiResponse<IProductReviewsData>;
export type IReviewResp = IApiResponse<IReview>;
export type IReviewEligibilityResp = IApiResponse<IReviewEligibility>;

// ── Store reviews (rates the seller/service experience on a delivered order,
// not any one product — see StoreReview on the backend) ──────────────────────

export interface IStoreReview {
  id: string;
  customerId: string;
  storeId: string;
  orderId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface IStoreReviewsData {
  reviews: IStoreReview[];
  summary: {
    totalReviews: number;
    averageRating: number;
  };
}

export interface IStoreReviewEligibility {
  canReview: boolean;
  hasDelivered: boolean;
  review: IStoreReview | null;
}

export type IStoreReviewsResp = IApiResponse<IStoreReviewsData>;
export type IStoreReviewResp = IApiResponse<IStoreReview>;
export type IStoreReviewEligibilityResp = IApiResponse<IStoreReviewEligibility>;
