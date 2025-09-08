// Componente ProductInformation

import Button from "../../atoms/button/SimpleButton";
import Image from "../../atoms/image/SimpleImage";
import Typography from "../../atoms/typography/SimpleTypography";

interface ProductInformationProps {
  product: {
    price: string;
    description: string;
    imageUrl: string;
  };
}

const ProductInformation = ({ product }: ProductInformationProps) => {
  return (
    <>
      <Image
        src={product.imageUrl}
        alt={`Imagen del producto`}
      />
      <Typography variant="h2">Precio venta</Typography>
      <Button fullWidth className="mt-1 mb-4" variant="primary-opacity">
        <Typography variant="p">${product.price}</Typography>
      </Button>
      <Typography variant="h3">Descripción del producto</Typography>
      <Typography variant="p" className="text-justify">
        {product.description}
      </Typography>
    </>
  );
};

export default ProductInformation;