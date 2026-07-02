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
  comment: string;
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
