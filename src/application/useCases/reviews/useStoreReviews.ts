import { useCallback, useEffect, useState } from 'react';
import { ReviewsRepository } from '@/infrastructure/repositories/api/reviews/ReviewsRepository';
import { ICreateStoreReviewRequest } from '@/application/dtos/reviews/request/ReviewRequest';
import {
  IStoreReviewEligibility,
  IStoreReviewsData,
} from '@/application/dtos/reviews/response/ReviewResponse';
import { authSession } from '@/shared/utils/authSession';

const emptyReviews: IStoreReviewsData = {
  reviews: [],
  summary: {
    totalReviews: 0,
    averageRating: 0,
  },
};

export const useStoreReviews = (storeId?: string) => {
  const [reviewsData, setReviewsData] = useState<IStoreReviewsData>(emptyReviews);
  const [eligibility, setEligibility] = useState<IStoreReviewEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ReviewsRepository.getStoreReviews(storeId);
      setReviewsData(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar reseñas',
      );
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const loadEligibility = useCallback(async () => {
    if (!storeId || !authSession.getToken()) {
      setEligibility(null);
      return;
    }

    try {
      const response = await ReviewsRepository.getMyStoreReviewEligibility(storeId);
      setEligibility(response.data);
    } catch {
      setEligibility(null);
    }
  }, [storeId]);

  useEffect(() => {
    void loadEligibility();
  }, [loadEligibility]);

  const createReview = async (payload: ICreateStoreReviewRequest) => {
    if (!storeId) {
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      await ReviewsRepository.createStoreReview(storeId, payload);
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
