import Button from '../../atoms/button/SimpleButton';
import Icon from '../../atoms/icon/SimpleIcon';
import Typography from '../../atoms/typography/SimpleTypography';
import Box from '../../atoms/box/SimpleBox';

interface ProductActionsProps {
  price: number;
  onPrimaryAction?: () => void;
}

const ProductActions = ({ price, onPrimaryAction }: ProductActionsProps) => {
  return (
    <Box className='rounded-[1.5rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
      <Typography variant='p' className='text-sm text-neutral-dark/65'>
        Precio del producto
      </Typography>
      <Button
        title='Agregar al carrito'
        size='md'
        fullWidth
        variant='outlinePrimary'
        className='mt-3'
        rightIcon={<Icon name='bx-cart-add' />}
        onClick={onPrimaryAction}
      >
        ${price.toFixed(2)}
      </Button>
    </Box>
  );
};

export default ProductActions;
