import Box from '../../atoms/box/SimpleBox';
import Button from '../../atoms/button/SimpleButton';
import Card from '../../atoms/card/SimpleCard';
import Icon from '../../atoms/icon/SimpleIcon';
import Image from '../../atoms/image/SimpleImage';
import Link from '../../atoms/link/Simplelink';
import { ROUTES } from '@/shared/constants/routes';
import Typography from '../../atoms/typography/SimpleTypography';
import { motion } from 'framer-motion';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  description?: string;
  id: string;
  storeName?: string;
  storeSlug?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
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
  isFavorite = false,
  onToggleFavorite,
}: ProductCardProps) => {
  return (
    <Card className='group flex h-full flex-col overflow-hidden !p-0'>
      <Box className='relative h-56 w-full overflow-hidden'>
        <Link to={`/product/${id}`}>
          <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.25 }}>
            <Image
              src={image}
              alt={name}
              className='h-full w-full object-cover'
            />
          </motion.div>
        </Link>
        {storeName ? (
          <span className='absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-dark shadow-sm'>
            {storeName}
          </span>
        ) : null}
      </Box>

      <Box className='flex flex-1 flex-col p-5'>
        <h3 className='truncate text-xl font-semibold text-neutral-dark'>
          {name}
        </h3>
        {storeName && storeSlug ? (
          <Link
            to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', storeSlug)}
            className='mt-2 inline-flex text-sm font-medium text-secondary'
          >
            <Typography className='text-sm text-secondary'>
              Ver tienda
            </Typography>
          </Link>
        ) : null}
        {description ? (
          <p className='mt-3 line-clamp-3 text-sm leading-6 text-neutral-dark/65'>
            {description}
          </p>
        ) : null}
        <Box className='mt-6 flex items-end justify-between gap-4'>
          <Box className='flex flex-col justify-center'>
            <p className='mb-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-dark/45'>
              Precio
            </p>
            <span className='text-2xl font-bold text-neutral-dark'>
              {formatCurrencyCOP(price)}
            </span>
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
        {onToggleFavorite ? (
          <Button
            variant={isFavorite ? 'secondary' : 'outlinePrimary'}
            size='sm'
            className='mt-3'
            onClick={onToggleFavorite}
            leftIcon={
              <Icon
                name={isFavorite ? 'bxs-heart' : 'bx-heart'}
                className='text-sm'
              />
            }
          >
            {isFavorite ? 'Guardado' : 'Favorito'}
          </Button>
        ) : null}
        <Link to={ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', id)} className='mt-4 text-sm font-semibold text-primary'>
          Ver detalle
        </Link>
      </Box>
    </Card>
  );
};

export default ProductCard;
