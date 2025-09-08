import Box from '../../atoms/box/SimpleBox';
import Button from '../../atoms/button/SimpleButton';
import Card from '../../atoms/card/SimpleCard';
import Icon from '../../atoms/icon/SimpleIcon';
import Image from '../../atoms/image/SimpleImage';
import Link from '../../atoms/link/Simplelink';

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  id: string;
  onAddToCart: () => void;
}

const ProductCard = ({
  image,
  name,
  price,
  onAddToCart,
  id
}: ProductCardProps) => {
  return (
    <Card className='flex !p-0 shadow-lg rounded-lg hover:shadow-xl transition-all duration-300'>
      
      <Box className='relative w-1/3 h-full mb-4 mr-4'>
        <Link to={`/product/${id}`}>
          <Image
            src={image}
            alt={name}
            className='rounded-lg h-full object-cover'
          />
        </Link>
      </Box>

      <Box className='flex flex-col flex-grow p-2 overflow-hidden'>
        <h3 className='text-xl font-semibold text-primary mt-4 truncate'>
          {name}
        </h3>
        <Box className='flex flex-row flex-grow'>
          <Box className='flex flex-col justify-center'>
            <p className='text-sm text-gray-600 mb-1'>Precio x unidad</p>
            <span className='text-lg font-bold text-gray-900'>${price}</span>
          </Box>
          <Box className='flex justify-between items-center'>
            <Button
              variant='primary'
              className='ml-3 mr-2 mt-0'
              size='sm'
              onClick={onAddToCart}
              leftIcon={<Icon name='bx-plus-circle' className='text-sm' />}
            >
              Agregar
            </Button>
          </Box>
        </Box>
      </Box>

    </Card>
  );
};

export default ProductCard;
