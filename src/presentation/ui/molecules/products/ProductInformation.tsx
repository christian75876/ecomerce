import Box from '../../atoms/box/SimpleBox';
import Image from '../../atoms/image/SimpleImage';
import Typography from '../../atoms/typography/SimpleTypography';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface ProductInformationProps {
  product: {
    name: string;
    price: string;
    description: string;
    imageUrl: string;
    category?: string;
  };
}

const ProductInformation = ({ product }: ProductInformationProps) => {
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
      <Box className='rounded-[1.5rem] border border-primary/10 bg-primary/5 px-5 py-4'>
        <Typography variant='span' className='text-xs uppercase tracking-[0.24em] text-primary/80'>
          Precio de venta
        </Typography>
        <Typography variant='h2' className='mt-2 text-3xl font-bold'>
          {formatCurrencyCOP(product.price)}
        </Typography>
      </Box>
      <Typography variant="h3">Descripción del producto</Typography>
      <Typography variant="p" className="max-w-3xl text-justify text-neutral-dark/75">
        {product.description}
      </Typography>
    </Box>
  );
};

export default ProductInformation;
