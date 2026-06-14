import Box from '../../atoms/box/SimpleBox';
import Image from '../../atoms/image/SimpleImage';
import Typography from '../../atoms/typography/SimpleTypography';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

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
}

const ProductInformation = ({ product }: ProductInformationProps) => {
  const numPrice = Number(product.price);
  const hasDiscount = product.compareAtPrice != null && Number(product.compareAtPrice) > numPrice;
  const discountPct = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - numPrice) / Number(product.compareAtPrice)) * 100)
    : 0;
  const isOutOfStock = product.availableQuantity === 0;
  const isLowStock = product.availableQuantity !== undefined && product.availableQuantity > 0 && product.availableQuantity <= 5;

  return (
    <Box className='space-y-5'>
      <Image
        src={product.imageUrl}
        alt={product.name}
        className='max-h-[560px] w-full rounded-[2rem] border border-neutral-gray/20 bg-white object-cover shadow-[0_24px_60px_rgba(15,23,42,0.1)]'
      />
      {product.category ? (
        <Typography variant='p' className='text-sm uppercase tracking-[0.25em] text-primary'>
          {product.category}
        </Typography>
      ) : null}
      <Typography variant="h2" className='text-4xl font-bold text-balance'>
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
      <Typography variant="h3">Descripción del producto</Typography>
      <Typography variant="p" className="max-w-3xl text-justify text-neutral-dark/75">
        {product.description}
      </Typography>
    </Box>
  );
};

export default ProductInformation;
