import { useCallback, useEffect, useState } from 'react';
import { ReviewsRepository } from '@/infrastructure/repositories/api/reviews/ReviewsRepository';
import { ICreateReviewRequest } from '@/application/dtos/reviews/request/ReviewRequest';
import {
  IProductReviewsData,
  IReviewEligibility,
} from '@/application/dtos/reviews/response/ReviewResponse';
import { authSession } from '@/shared/utils/authSession';

const emptyReviews: IProductReviewsData = {
  reviews: [],
  summary: {
    totalReviews: 0,
    averageRating: 0,
  },
};

export const useProductReviews = (productId?: string) => {
  const [reviewsData, setReviewsData] = useState<IProductReviewsData>(emptyReviews);
  const [eligibility, setEligibility] = useState<IReviewEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ReviewsRepository.getProductReviews(productId);
      setReviewsData(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar reseñas',
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const loadEligibility = useCallback(async () => {
    if (!productId || !authSession.getToken()) {
      setEligibility(null);
      return;
    }

    try {
      const response = await ReviewsRepository.getMyReviewEligibility(productId);
      setEligibility(response.data);
    } catch {
      setEligibility(null);
    }
  }, [productId]);

  useEffect(() => {
    void loadEligibility();
  }, [loadEligibility]);

  const createReview = async (payload: ICreateReviewRequest) => {
    if (!productId) {
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      await ReviewsRepository.createReview(productId, payload);
      await loadReviews();
      await loadEligibility();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible crear la reseña',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    reviewsData,
    eligibility,
    loading,
    submitting,
    error,
    createReview,
  };
};
