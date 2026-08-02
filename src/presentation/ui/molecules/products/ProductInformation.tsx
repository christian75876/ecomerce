import { useState } from 'react';
import type React from 'react';
import Box from '../../atoms/box/SimpleBox';
import Typography from '../../atoms/typography/SimpleTypography';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface GalleryImage {
  id: string;
  imageUrl: string;
}

interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: number | null;
  stock: number;
  isActive: boolean;
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
    brand?: string | null;
    tags?: string[] | null;
    unit?: string | null;
    weight?: number | null;
    width?: number | null;
    height?: number | null;
    depth?: number | null;
    variants?: ProductVariant[];
  };
  gallery?: GalleryImage[];
  footer?: React.ReactNode;
}

const ProductInformation = ({ product, gallery = [], footer }: ProductInformationProps) => {
  const allImages = [
    product.imageUrl,
    ...gallery.map((g) => g.imageUrl),
  ].filter(Boolean) as string[];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const prev = () => setCurrentIdx((i) => (i - 1 + allImages.length) % allImages.length);
  const next = () => setCurrentIdx((i) => (i + 1) % allImages.length);

  const activeVariants = (product.variants ?? []).filter((v) => v.isActive);
  const uniqueSizes = [...new Set(activeVariants.map((v) => v.size).filter(Boolean))] as string[];
  const uniqueColors = [...new Set(activeVariants.map((v) => v.color).filter(Boolean))] as string[];

  const selectedVariant = activeVariants.find(
    (v) =>
      (selectedSize ? v.size === selectedSize : true) &&
      (selectedColor ? v.color === selectedColor : true),
  ) ?? null;

  const displayedPrice = selectedVariant?.price != null
    ? String(selectedVariant.price)
    : product.price;

  const displayedStock = selectedVariant != null
    ? selectedVariant.stock
    : product.availableQuantity;

  const numPrice = Number(displayedPrice);
  const hasDiscount = product.compareAtPrice != null && Number(product.compareAtPrice) > numPrice;
  const discountPct = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - numPrice) / Number(product.compareAtPrice)) * 100)
    : 0;
  const isOutOfStock = displayedStock === 0;
  const isLowStock =
    displayedStock !== undefined &&
    displayedStock > 0 &&
    displayedStock <= 5;

  return (
    <Box className='sm:grid sm:grid-cols-2 sm:gap-10 sm:items-start'>
      {/* ── Left column: carousel + thumbnails ── */}
      <Box className='space-y-3'>
        <Box className='relative overflow-hidden rounded-[2rem] border border-neutral-gray/20 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.1)]'>
          <Box className='relative aspect-square'>
            <img
              src={allImages[currentIdx]}
              alt={`${product.name} — imagen ${currentIdx + 1}`}
              className='h-full w-full object-contain'
            />
            {hasDiscount ? (
              <span className='absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow'>
                -{discountPct}% OFF
              </span>
            ) : null}
          </Box>

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
      </Box>

      {/* ── Right column: product info + footer slot ── */}
      <Box className='mt-6 space-y-5 sm:mt-0'>
        {/* Category + Brand row */}
        <Box className='flex flex-wrap items-center gap-2'>
          {product.category ? (
            <Typography variant='p' className='text-sm uppercase tracking-[0.25em] text-primary'>
              {product.category}
            </Typography>
          ) : null}
          {product.brand ? (
            <span className='rounded-full border border-neutral-gray/30 bg-neutral-gray/10 px-3 py-0.5 text-xs font-semibold text-neutral-dark/70'>
              {product.brand}
            </span>
          ) : null}
        </Box>

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
            ¡Solo quedan {displayedStock} unidades!
          </Box>
        ) : null}

        <Box className='rounded-[1.5rem] border border-primary/10 bg-primary/5 px-5 py-4'>
          <Typography variant='span' className='text-xs uppercase tracking-[0.24em] text-primary/80'>
            Precio de venta
          </Typography>
          <Box className='mt-2 flex items-end gap-3'>
            <Typography variant='h2' className='text-3xl font-bold'>
              {formatCurrencyCOP(displayedPrice)}
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

        {/* Size selector */}
        {uniqueSizes.length > 0 ? (
          <Box>
            <p className='mb-2 text-sm font-semibold text-neutral-dark'>
              Talla{selectedSize ? <span className='ml-1 font-normal text-neutral-dark/60'>— {selectedSize}</span> : null}
            </p>
            <Box className='flex flex-wrap gap-2'>
              {uniqueSizes.map((size) => (
                <button
                  key={size}
                  type='button'
                  onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                  className={`rounded-xl border px-4 py-1.5 text-sm font-semibold transition ${
                    selectedSize === size
                      ? 'border-primary bg-primary text-white'
                      : 'border-neutral-gray/30 bg-white text-neutral-dark hover:border-primary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </Box>
          </Box>
        ) : null}

        {/* Color selector */}
        {uniqueColors.length > 0 ? (
          <Box>
            <p className='mb-2 text-sm font-semibold text-neutral-dark'>
              Color{selectedColor ? <span className='ml-1 font-normal text-neutral-dark/60'>— {selectedColor}</span> : null}
            </p>
            <Box className='flex flex-wrap gap-2'>
              {uniqueColors.map((color) => {
                const hex = activeVariants.find((v) => v.color === color)?.colorHex;
                return (
                  <button
                    key={color}
                    type='button'
                    title={color}
                    onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                      selectedColor === color
                        ? 'border-primary shadow-md scale-110'
                        : 'border-neutral-gray/30 hover:border-primary/50'
                    }`}
                    style={hex ? { background: hex } : undefined}
                    aria-label={color}
                  >
                    {!hex ? (
                      <span className='text-[10px] font-bold leading-none text-neutral-dark'>
                        {color.slice(0, 2).toUpperCase()}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </Box>
          </Box>
        ) : null}

        <Typography variant='h3'>Descripción del producto</Typography>
        <Typography variant='p' className='text-justify text-neutral-dark/75'>
          {product.description}
        </Typography>

        {/* Extra info: unit, weight, dimensions, tags */}
        {(product.unit || product.weight || product.width || product.tags?.length) ? (
          <Box className='space-y-2 rounded-2xl border border-neutral-gray/20 bg-neutral-gray/5 px-4 py-3 text-sm text-neutral-dark/70'>
            {product.unit ? (
              <p><span className='font-semibold text-neutral-dark'>Unidad:</span> {product.unit}</p>
            ) : null}
            {product.weight ? (
              <p><span className='font-semibold text-neutral-dark'>Peso:</span> {product.weight} kg</p>
            ) : null}
            {(product.width || product.height || product.depth) ? (
              <p>
                <span className='font-semibold text-neutral-dark'>Dimensiones:</span>{' '}
                {[
                  product.width ? `${product.width} cm` : null,
                  product.height ? `${product.height} cm` : null,
                  product.depth ? `${product.depth} cm` : null,
                ]
                  .filter(Boolean)
                  .join(' × ')}
              </p>
            ) : null}
            {product.tags?.length ? (
              <Box className='flex flex-wrap gap-1.5 pt-1'>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'
                  >
                    {tag}
                  </span>
                ))}
              </Box>
            ) : null}
          </Box>
        ) : null}

        {footer ? <Box className='pt-1'>{footer}</Box> : null}
      </Box>
    </Box>
  );
};

export default ProductInformation;
