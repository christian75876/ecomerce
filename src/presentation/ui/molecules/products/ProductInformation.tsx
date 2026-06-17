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
  const allImages = [{ id: 'main', imageUrl: product.imageUrl }, ...gallery];
  const [activeIdx, setActiveIdx] = useState(0);

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

  const prev = () => setActiveIdx(i => (i - 1 + allImages.length) % allImages.length);
  const next = () => setActiveIdx(i => (i + 1) % allImages.length);

  return (
    <Box className='w-full min-w-0 space-y-5'>
      {/* Carousel */}
      <Box className='relative w-full overflow-hidden rounded-[2rem] border border-neutral-gray/20 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.1)]'>
        <img
          src={allImages[activeIdx].imageUrl}
          alt={product.name}
          className='max-h-[560px] w-full max-w-full object-cover'
        />
        {allImages.length > 1 ? (
          <>
            <button
              type='button'
              onClick={prev}
              aria-label='Imagen anterior'
              className='absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white'
            >
              <i className='bx bx-chevron-left text-xl text-slate-700' aria-hidden='true' />
            </button>
            <button
              type='button'
              onClick={next}
              aria-label='Imagen siguiente'
              className='absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white'
            >
              <i className='bx bx-chevron-right text-xl text-slate-700' aria-hidden='true' />
            </button>
            {/* Dot indicators */}
            <Box className='absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5'>
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  type='button'
                  onClick={() => setActiveIdx(idx)}
                  className={`h-2 rounded-full transition-all ${idx === activeIdx ? 'w-5 bg-white' : 'w-2 bg-white/50'}`}
                />
              ))}
            </Box>
          </>
        ) : null}
      </Box>

      {/* Thumbnails */}
      {allImages.length > 1 ? (
        <Box className='flex gap-2 overflow-x-auto pb-1'>
          {allImages.map((img, idx) => (
            <button
              key={img.id}
              type='button'
              onClick={() => setActiveIdx(idx)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                idx === activeIdx
                  ? 'border-primary'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.imageUrl} alt='' className='h-full w-full object-cover' />
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
              <span className='rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600'>
                -{discountPct}% OFF
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
