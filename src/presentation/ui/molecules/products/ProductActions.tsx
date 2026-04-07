import Button from '../../atoms/button/SimpleButton';
import Icon from '../../atoms/icon/SimpleIcon';
import Typography from '../../atoms/typography/SimpleTypography';
import Box from '../../atoms/box/SimpleBox';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface ProductActionsProps {
  price: number;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
}

const ProductActions = ({
  price,
  onPrimaryAction,
  primaryLabel = 'Agregar al carrito',
}: ProductActionsProps) => {
  return (
    <Box className='surface-panel rounded-[1.75rem] p-6'>
      <Typography variant='span' className='text-xs uppercase tracking-[0.24em] text-neutral-dark/50'>
        Acción rápida
      </Typography>
      <Typography variant='h3' className='mt-3 text-xl'>
        Llévalo ahora
      </Typography>
      <Typography variant='p' className='mt-2 text-sm text-neutral-dark/65'>
        Compra en segundos o guárdalo para revisar más tarde.
      </Typography>
      <Button
        title='Agregar al carrito'
        size='lg'
        fullWidth
        variant='primary'
        className='mt-5'
        rightIcon={<Icon name='bx-cart-add' />}
        onClick={onPrimaryAction}
      >
        {primaryLabel} · {formatCurrencyCOP(price)}
      </Button>
    </Box>
  );
};

export default ProductActions;
