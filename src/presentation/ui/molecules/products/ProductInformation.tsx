import { useState } from 'react';
import Box from '../../atoms/box/SimpleBox';
import Typography from '../../atoms/typography/SimpleTypography';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface GalleryImage {
  id: string;
  imageUrl: string;
}

interface ProductInformationProps {
  product: {
    name: string;
    price: string;
    compareAtPrice?: number | null;
    availableQuantity?: number;
    showStock?: boolean;
    description: string;
    imageUrl: string;
    category?: string;
  };
  gallery?: GalleryImage[];
}

const ProductInformation = ({ product, gallery = [] }: ProductInformationProps) => {
  const allImages = [
    product.imageUrl,
    ...gallery.map((g) => g.imageUrl),
  ].filter(Boolean) as string[];

  const [currentIdx, setCurrentIdx] = useState(0);

  const prev = () => setCurrentIdx((i) => (i - 1 + allImages.length) % allImages.length);
  const next = () => setCurrentIdx((i) => (i + 1) % allImages.length);

  const numPrice = Number(product.price);
  const hasDiscount = product.compareAtPrice != null && Number(product.compareAtPrice) > numPrice;
  const discountPct = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - numPrice) / Number(product.compareAtPrice)) * 100)
    : 0;
  const isOutOfStock = product.availableQuantity === 0;
  const isLowStock =
    product.availableQuantity !== undefined &&
    product.availableQuantity > 0 &&
    product.availableQuantity <= 5;

  return (
    <Box className='space-y-5'>
      {/* ── Carousel ── */}
      <Box className='relative overflow-hidden rounded-[2rem] border border-neutral-gray/20 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.1)]'>
        {/* Main image */}
        <Box className='relative aspect-square sm:aspect-[4/3]'>
          <img
            src={allImages[currentIdx]}
            alt={`${product.name} — imagen ${currentIdx + 1}`}
            className='h-full w-full object-contain'
          />

          {/* Discount badge */}
          {hasDiscount ? (
            <span className='absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow'>
              -{discountPct}% OFF
            </span>
          ) : null}
        </Box>

        {/* Prev / Next arrows */}
        {allImages.length > 1 ? (
          <>
            <button
              type='button'
              onClick={prev}
              aria-label='Imagen anterior'
              className='absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition hover:bg-white'
            >
              <i className='bx bx-chevron-left text-xl text-neutral-dark' aria-hidden='true' />
            </button>
            <button
              type='button'
              onClick={next}
              aria-label='Imagen siguiente'
              className='absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition hover:bg-white'
            >
              <i className='bx bx-chevron-right text-xl text-neutral-dark' aria-hidden='true' />
            </button>
          </>
        ) : null}

        {/* Dot indicators */}
        {allImages.length > 1 ? (
          <Box className='absolute bottom-3 left-0 right-0 flex justify-center gap-1.5'>
            {allImages.map((_, i) => (
              <button
                key={i}
                type='button'
                onClick={() => setCurrentIdx(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === currentIdx ? 'w-5 bg-primary' : 'w-2 bg-white/70'
                }`}
              />
            ))}
          </Box>
        ) : null}
      </Box>

      {/* Thumbnail strip */}
      {allImages.length > 1 ? (
        <Box className='flex gap-2 overflow-x-auto pb-1'>
          {allImages.map((src, i) => (
            <button
              key={i}
              type='button'
              onClick={() => setCurrentIdx(i)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === currentIdx
                  ? 'border-primary shadow-sm'
                  : 'border-neutral-gray/20 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={src} alt={`Miniatura ${i + 1}`} className='h-full w-full object-cover' />
            </button>
          ))}
        </Box>
      ) : null}

      {product.category ? (
        <Typography variant='p' className='text-sm uppercase tracking-[0.25em] text-primary'>
          {product.category}
        </Typography>
      ) : null}

      <Typography variant='h2' className='text-4xl font-bold text-balance'>
        {product.name}
      </Typography>

      {isOutOfStock ? (
        <Box className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-500'>
          <span className='h-2 w-2 rounded-full bg-slate-400' />
          Agotado
        </Box>
      ) : isLowStock && product.showStock ? (
        <Box className='inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-600'>
          <span className='h-2 w-2 rounded-full bg-orange-400' />
          ¡Solo quedan {product.availableQuantity} unidades!
        </Box>
      ) : null}

      <Box className='rounded-[1.5rem] border border-primary/10 bg-primary/5 px-5 py-4'>
        <Typography variant='span' className='text-xs uppercase tracking-[0.24em] text-primary/80'>
          Precio de venta
        </Typography>
        <Box className='mt-2 flex items-end gap-3'>
          <Typography variant='h2' className='text-3xl font-bold'>
            {formatCurrencyCOP(product.price)}
          </Typography>
          {hasDiscount ? (
            <Box className='flex flex-col'>
              <span className='text-base font-medium text-neutral-dark/40 line-through'>
                {formatCurrencyCOP(product.compareAtPrice!)}
              </span>
            </Box>
          ) : null}
        </Box>
      </Box>

      <Typography variant='h3'>Descripción del producto</Typography>
      <Typography variant='p' className='max-w-3xl text-justify text-neutral-dark/75'>
        {product.description}
      </Typography>
    </Box>
  );
};

export default ProductInformation;
