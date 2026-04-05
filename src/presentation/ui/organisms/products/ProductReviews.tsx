import { useEffect, useMemo, useState } from 'react';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { useProductReviews } from '@/application/useCases/reviews/useProductReviews';
import { CustomersRepository } from '@/infrastructure/repositories/api/customers/CustomersRepository';
import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { reviewsData, loading, submitting, error, createReview } =
    useProductReviews(productId);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [form, setForm] = useState({
    customerId: '',
    rating: '5',
    comment: '',
    images: [] as File[],
  });

  useEffect(() => {
    const loadCustomers = async () => {
      const response = await CustomersRepository.getCustomers();
      setCustomers(response.data);
    };

    void loadCustomers();
  }, []);

  const reviews = reviewsData.reviews;
  const averageRating = reviewsData.summary.averageRating;

  const imagePreviewNames = useMemo(
    () => form.images.map((file) => file.name).join(', '),
    [form.images],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const wasCreated = await createReview({
      customerId: form.customerId,
      rating: Number(form.rating),
      comment: form.comment.trim(),
      images: form.images,
    });

    if (wasCreated) {
      setForm({
        customerId: '',
        rating: '5',
        comment: '',
        images: [],
      });
    }
  };

  return (
    <Box className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]'>
      <Box className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
        <Box className='flex flex-wrap items-end justify-between gap-4'>
          <Box>
            <Typography variant='h2' className='text-2xl font-semibold'>
              Reseñas
            </Typography>
            <Typography className='mt-2 text-neutral-dark/65'>
              Promedio {averageRating}/5 · {reviewsData.summary.totalReviews} reseñas
            </Typography>
          </Box>
        </Box>

        <Box className='mt-6 space-y-4'>
          {loading ? (
            <Typography>Cargando reseñas...</Typography>
          ) : reviews.length === 0 ? (
            <Typography>Aún no hay reseñas para este producto.</Typography>
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
                <Typography className='mt-3 text-neutral-dark/75'>
                  {review.comment}
                </Typography>
                {review.images.length > 0 ? (
                  <Box className='mt-4 grid grid-cols-2 gap-3 md:grid-cols-3'>
                    {review.images.map((image) => (
                      <img
                        key={image.id}
                        src={`http://127.0.0.1:3000${image.url}`}
                        alt='Reseña'
                        className='h-28 w-full rounded-xl object-cover'
                      />
                    ))}
                  </Box>
                ) : null}
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
        <Typography variant='h2' className='text-xl font-semibold'>
          Deja tu reseña
        </Typography>
        <Typography className='mt-2 text-sm text-neutral-dark/65'>
          Solo se aceptan clientes con una compra válida del producto.
        </Typography>

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <select
            value={form.customerId}
            onChange={(event) =>
              setForm((current) => ({ ...current, customerId: event.target.value }))
            }
            className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
          >
            <option value=''>Selecciona tu cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName} · {customer.email}
              </option>
            ))}
          </select>

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
            placeholder='Comparte tu experiencia con este producto'
          />

          <Input
            type='file'
            accept='.jpg,.jpeg,.png,.webp'
            multiple
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                images: Array.from(event.target.files ?? []).slice(0, 3),
              }))
            }
          />

          {imagePreviewNames ? (
            <Typography className='text-sm text-neutral-dark/65'>
              Archivos: {imagePreviewNames}
            </Typography>
          ) : null}

          {error ? (
            <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
              {error}
            </Box>
          ) : null}

          <Button
            type='submit'
            variant='primary'
            disabled={
              submitting || !form.customerId || !form.comment.trim()
            }
          >
            {submitting ? 'Enviando...' : 'Publicar reseña'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ProductReviews;
