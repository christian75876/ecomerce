import Button from '../../atoms/button/SimpleButton';
import Image from '../../atoms/image/SimpleImage';
import Typography from '../../atoms/typography/SimpleTypography';

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
    <>
      <Image
        src={product.imageUrl}
        alt={product.name}
        className='max-h-[480px] w-full rounded-[2rem] border border-neutral-gray/20 bg-white'
      />
      {product.category ? (
        <Typography variant='p' className='mt-6 text-sm uppercase tracking-[0.25em] text-primary'>
          {product.category}
        </Typography>
      ) : null}
      <Typography variant="h2" className='mt-3 text-3xl font-bold'>
        {product.name}
      </Typography>
      <Typography variant="h3" className='mt-6'>
        Precio venta
      </Typography>
      <Button fullWidth className="mt-1 mb-4" variant="primary-opacity">
        <Typography variant="p">${product.price}</Typography>
      </Button>
      <Typography variant="h3">Descripción del producto</Typography>
      <Typography variant="p" className="text-justify text-neutral-dark/75">
        {product.description}
      </Typography>
    </>
  );
};

export default ProductInformation;
