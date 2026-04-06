import Box from '../../atoms/box/SimpleBox';
import Button from '../../atoms/button/SimpleButton';
import Card from '../../atoms/card/SimpleCard';
import Icon from '../../atoms/icon/SimpleIcon';
import Image from '../../atoms/image/SimpleImage';
import Link from '../../atoms/link/Simplelink';
import { ROUTES } from '@/shared/constants/routes';
import Typography from '../../atoms/typography/SimpleTypography';

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  description?: string;
  id: string;
  storeName?: string;
  storeSlug?: string;
  onAddToCart: () => void;
}

const ProductCard = ({
  image,
  name,
  price,
  description,
  onAddToCart,
  id,
  storeName,
  storeSlug,
}: ProductCardProps) => {
  return (
    <Card className='flex h-full flex-col overflow-hidden !p-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
      <Box className='relative h-52 w-full'>
        <Link to={`/product/${id}`}>
          <Image
            src={image}
            alt={name}
            className='h-full w-full object-cover'
          />
        </Link>
      </Box>

      <Box className='flex flex-1 flex-col p-5'>
        <h3 className='truncate text-xl font-semibold text-primary'>
          {name}
        </h3>
        {storeName && storeSlug ? (
          <Link
            to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', storeSlug)}
            className='mt-2 inline-flex text-sm font-medium text-neutral-dark/70'
          >
            <Typography className='text-sm text-neutral-dark/70'>
              Tienda: {storeName}
            </Typography>
          </Link>
        ) : null}
        {description ? (
          <p className='mt-2 line-clamp-2 text-sm text-neutral-dark/65'>
            {description}
          </p>
        ) : null}
        <Box className='mt-5 flex items-end justify-between gap-4'>
          <Box className='flex flex-col justify-center'>
            <p className='mb-1 text-sm text-gray-600'>Precio x unidad</p>
            <span className='text-lg font-bold text-gray-900'>${price}</span>
          </Box>
          <Button
            variant='primary'
            size='sm'
            onClick={onAddToCart}
            leftIcon={<Icon name='bx-plus-circle' className='text-sm' />}
          >
            Agregar
          </Button>
        </Box>
        <Link to={ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', id)} className='mt-4 text-sm font-medium text-primary'>
          Ver detalle
        </Link>
      </Box>
    </Card>
  );
};

export default ProductCard;
