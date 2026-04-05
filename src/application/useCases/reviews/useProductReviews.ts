import { useEffect, useState } from 'react';
import { ReviewsRepository } from '@/infrastructure/repositories/api/reviews/ReviewsRepository';
import { ICreateReviewRequest } from '@/application/dtos/reviews/request/ReviewRequest';
import { IProductReviewsData } from '@/application/dtos/reviews/response/ReviewResponse';

const emptyReviews: IProductReviewsData = {
  reviews: [],
  summary: {
    totalReviews: 0,
    averageRating: 0,
  },
};

export const useProductReviews = (productId?: string) => {
  const [reviewsData, setReviewsData] = useState<IProductReviewsData>(emptyReviews);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
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
  };

  useEffect(() => {
    void loadReviews();
  }, [productId]);

  const createReview = async (payload: ICreateReviewRequest) => {
    if (!productId) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await ReviewsRepository.createReview(productId, payload);
      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible crear la reseña',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    reviewsData,
    loading,
    submitting,
    error,
    createReview,
  };
};
