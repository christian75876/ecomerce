import Box from '../../atoms/box/SimpleBox';
import Button from '../../atoms/button/SimpleButton';
import Icon from '../../atoms/icon/SimpleIcon';
import Typography from '../../atoms/typography/SimpleTypography';

const ProductActions = () => {
  return (
    <Box>
      <Typography variant='p'>Precio de reventa</Typography>
      <Button
        title='Descargar Historial'
        size='sm'
        fullWidth
        variant='outlinePrimary'
        rightIcon={<Icon name='bx-download' />}
      >
        $1.500
      </Button>
    </Box>
  );
};

export default ProductActions;
