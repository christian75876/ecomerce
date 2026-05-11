import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import HomeSection from './HomeSection';

interface HomeProductRailProps {
  title: string;
  subtitle: string;
  products: IProduct[];
  loading: boolean;
  favoriteIds: string[];
  emptyMessage: string;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

const HomeProductRail = ({
  title,
  subtitle,
  products,
  loading,
  favoriteIds,
  emptyMessage,
  onToggleFavorite,
  onAddToCart,
}: HomeProductRailProps) => {
  return (
    <HomeSection title={title} subtitle={subtitle}>
      <ProductBody
        products={products}
        loading={loading}
        favoriteIds={favoriteIds}
        emptyMessage={emptyMessage}
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
      />
    </HomeSection>
  );
};

export default HomeProductRail;
