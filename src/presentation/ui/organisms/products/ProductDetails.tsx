import IconButton from '../../atoms/button/IconButton';
import Button from '../../atoms/button/SimpleButton';
import Icon from '../../atoms/icon/SimpleIcon';
import Image from '../../atoms/image/SimpleImage';
import Typography from '../../atoms/typography/SimpleTypography';
import ProductHeader from '../../molecules/products/ProductHeader';
import { useParams } from 'react-router-dom';
import ProductInformation from '../../molecules/products/ProductInformation';
import ProductActions from '../../molecules/products/ProductActions';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();

  const product = {
    name: "Producto de Ejemplo",
    price: "29.99",
    description: "Este es un producto de ejemplo. Es una molécula que sirve para fines demostrativos.",
    imageUrl: "https://www.upack.in/media/catalog/product/cache/434b5723752bfe2768a169417576f99a/u/p/upkj233p310_2.jpg",
  };

  return (
    <>
      <ProductHeader title={`Detalle del producto`} />
      <ProductInformation product={product} />
      <ProductActions/>
    </>
  );
};

export default ProductDetails;
