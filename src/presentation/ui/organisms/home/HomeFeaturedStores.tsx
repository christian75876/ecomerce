import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Link from '@/presentation/ui/atoms/link/Simplelink';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { ROUTES } from '@/shared/constants/routes';
import HomeSection from './HomeSection';

interface HomeFeaturedStoresProps {
  stores: IStore[];
}

const HomeFeaturedStores = ({ stores }: HomeFeaturedStoresProps) => {
  return (
    <HomeSection
      title='Tiendas destacadas'
      subtitle='Comercios activos para seguir explorando.'
    >
      <Box className='space-y-3'>
        {stores.map((store) => (
          <Link
            key={store.id}
            to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
            className='block rounded-2xl border border-neutral-gray/20 px-4 py-4 transition hover:border-primary/30 hover:bg-background'
          >
            <Typography className='font-semibold'>{store.name}</Typography>
            <Typography className='mt-1 text-sm text-neutral-dark/65'>
              {store.description || 'Tienda activa en el marketplace.'}
            </Typography>
          </Link>
        ))}
      </Box>
    </HomeSection>
  );
};

export default HomeFeaturedStores;
