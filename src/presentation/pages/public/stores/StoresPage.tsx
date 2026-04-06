import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import Link from '@/presentation/ui/atoms/link/Simplelink';
import { usePublicStores } from '@/application/useCases/stores/usePublicStores';
import { ROUTES } from '@/shared/constants/routes';

const StoresPage = () => {
  const { stores, loading, error } = usePublicStores();

  return (
    <Box className='space-y-8'>
      <Box className='rounded-[2rem] bg-[linear-gradient(135deg,_#fef2f2_0%,_#ffffff_50%,_#eef6ff_100%)] px-6 py-10 shadow-sm'>
        <Typography variant='h1' className='text-4xl font-bold text-neutral-dark'>
          Tiendas activas
        </Typography>
        <Typography className='mt-3 max-w-2xl text-neutral-dark/70'>
          Explora los comercios disponibles y navega sus productos.
        </Typography>
      </Box>

      {loading ? <Typography>Cargando tiendas...</Typography> : null}
      {error ? (
        <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
          {error}
        </Box>
      ) : null}

      <Box className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {stores.map((store) => (
          <Box key={store.id} className='rounded-3xl border border-neutral-dark/10 bg-white p-6 shadow-sm'>
            <Typography variant='h2' className='text-2xl font-semibold text-neutral-dark'>
              {store.name}
            </Typography>
            <Typography className='mt-2 text-sm text-neutral-dark/65'>
              {store.description || 'Sin descripción disponible.'}
            </Typography>
            <Link
              to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
              className='mt-4 inline-flex text-sm font-semibold text-primary'
            >
              Ver tienda
            </Link>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default StoresPage;
