import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import HomeSection from './HomeSection';

interface HomeProductRailProps {
  title: string;
  subtitle: string;
  products: IProduct[];
  loading: boolean;
  emptyMessage: string;
  onAddToCart: (productId: string) => void;
  mobileCarousel?: boolean;
}

const HomeProductRail = ({
  title,
  subtitle,
  products,
  loading,
  emptyMessage,
  onAddToCart,
  mobileCarousel = true,
}: HomeProductRailProps) => {
  return (
    <HomeSection title={title} subtitle={subtitle}>
      <ProductBody
        products={products}
        loading={loading}
        emptyMessage={emptyMessage}
        mobileCarousel={mobileCarousel}
        onAddToCart={onAddToCart}
      />
    </HomeSection>
  );
};

export default HomeProductRail;
