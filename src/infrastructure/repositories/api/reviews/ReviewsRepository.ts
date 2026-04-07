import { ICreateReviewRequest } from '@/application/dtos/reviews/request/ReviewRequest';
import {
  IProductReviewsResp,
  IReviewEligibilityResp,
  IReviewResp,
} from '@/application/dtos/reviews/response/ReviewResponse';
import {
  authenticatedClientHTTP,
  multiPartClientHTTP,
  publicClientHTTP,
} from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class ReviewsRepository {
  static async getProductReviews(
    productId: string,
  ): Promise<IProductReviewsResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IProductReviewsResp>(`/products/${productId}/reviews`),
    );
  }

  static async createReview(
    productId: string,
    payload: ICreateReviewRequest,
  ): Promise<IReviewResp> {
    const formData = new FormData();
    formData.append('rating', String(payload.rating));
    formData.append('comment', payload.comment);

    payload.images?.forEach((file) => {
      formData.append('images', file);
    });

    return ErrorHandler.handleApiErrors(() =>
      multiPartClientHTTP.post<IReviewResp>(
        `/products/${productId}/reviews`,
        formData,
      ),
    );
  }

  static async getMyReviewEligibility(
    productId: string,
  ): Promise<IReviewEligibilityResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IReviewEligibilityResp>(
        `/products/${productId}/reviews/me`,
      ),
    );
  }
}
