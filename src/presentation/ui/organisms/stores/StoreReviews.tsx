import { useEffect, useState } from 'react';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { useStoreReviews } from '@/application/useCases/reviews/useStoreReviews';
import { authSession } from '@/shared/utils/authSession';

interface StoreReviewsProps {
  storeId: string;
}

const StoreReviews = ({ storeId }: StoreReviewsProps) => {
  const { reviewsData, eligibility, loading, submitting, error, createReview } =
    useStoreReviews(storeId);
  const [form, setForm] = useState({ rating: '5', comment: '' });

  const reviews = reviewsData.reviews;
  const averageRating = reviewsData.summary.averageRating;
  const authenticatedUser = authSession.getUser();
  const canSubmitReview = Boolean(authenticatedUser && eligibility?.canReview);
  const hasExistingReview = Boolean(eligibility?.review);

  useEffect(() => {
    if (!eligibility?.review) return;
    setForm({
      rating: String(eligibility.review.rating),
      comment: eligibility.review.comment ?? '',
    });
  }, [eligibility?.review]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const wasCreated = await createReview({
      rating: Number(form.rating),
      comment: form.comment.trim() || undefined,
    });

    if (wasCreated && !hasExistingReview) {
      setForm({ rating: '5', comment: '' });
    }
  };

  return (
    <Box className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]'>
      <Box className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
        <Box className='flex flex-wrap items-end justify-between gap-4'>
          <Box>
            <Typography variant='h2' className='text-2xl font-semibold'>
              Reseñas de la tienda
            </Typography>
            <Typography className='mt-2 text-neutral-dark/65'>
              Promedio {averageRating}/5 · {reviewsData.summary.totalReviews} reseña
              {reviewsData.summary.totalReviews === 1 ? '' : 's'}
            </Typography>
          </Box>
        </Box>

        <Box className='mt-6 space-y-4'>
          {loading ? (
            <Typography>Cargando reseñas...</Typography>
          ) : reviews.length === 0 ? (
            <Typography>Aún no hay reseñas para esta tienda.</Typography>
          ) : (
            reviews.map((review) => (
              <Box
                key={review.id}
                className='rounded-2xl border border-neutral-gray/20 px-5 py-4'
              >
                <Box className='flex flex-wrap items-center justify-between gap-3'>
                  <Typography className='font-semibold'>
                    {review.customer.firstName} {review.customer.lastName}
                  </Typography>
                  <Typography className='text-sm text-primary'>
                    {'★'.repeat(review.rating)}
                  </Typography>
                </Box>
                {review.comment ? (
                  <Typography className='mt-3 text-neutral-dark/75'>
                    {review.comment}
                  </Typography>
                ) : null}
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
        <Typography variant='h2' className='text-xl font-semibold'>
          {hasExistingReview ? 'Edita tu reseña' : 'Deja tu reseña'}
        </Typography>
        <Typography className='mt-2 text-sm text-neutral-dark/65'>
          Solo clientes con un pedido entregado de esta tienda pueden calificarla.
        </Typography>

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          {!authenticatedUser ? (
            <Box className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
              Inicia sesión como comprador para publicar una reseña.
            </Box>
          ) : null}

          {authenticatedUser && !eligibility?.hasDelivered ? (
            <Box className='rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>
              Solo puedes reseñar tiendas de las que hayas recibido un pedido entregado.
            </Box>
          ) : null}

          <select
            value={form.rating}
            onChange={(event) =>
              setForm((current) => ({ ...current, rating: event.target.value }))
            }
            className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={String(value)}>
                {value} estrella{value > 1 ? 's' : ''}
              </option>
            ))}
          </select>

          <textarea
            value={form.comment}
            onChange={(event) =>
              setForm((current) => ({ ...current, comment: event.target.value }))
            }
            className='min-h-28 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='Comparte tu experiencia con esta tienda (opcional)'
          />

          {error ? (
            <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
              {error}
            </Box>
          ) : null}

          <Button
            type='submit'
            variant='primary'
            disabled={submitting || !canSubmitReview}
          >
            {submitting
              ? 'Enviando...'
              : hasExistingReview
                ? 'Actualizar reseña'
                : 'Publicar reseña'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default StoreReviews;
