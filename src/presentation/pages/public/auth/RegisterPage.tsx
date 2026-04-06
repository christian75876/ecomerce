import { useRegister } from '@/application/useCases/auth/useRegister';
import AuthFormRegister from '@/presentation/ui/molecules/auth/AuthFormRegister';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

const RegisterPage = () => {
  const { handleRegister, isloadingRegister, error } = useRegister();

  return (
    <Box className='min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,69,0,0.14),_transparent_32%),linear-gradient(135deg,_#fff7f2_0%,_#ffffff_45%,_#eef6ff_100%)] px-4 py-10'>
      <Box className='mx-auto w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_rgba(34,34,34,0.12)] backdrop-blur'>
        <Typography variant='span' className='text-sm font-semibold uppercase tracking-[0.3em] text-primary'>
          Registro
        </Typography>
        <Typography variant='h1' className='mt-4 text-4xl font-bold text-neutral-dark'>
          Crea tu cuenta
        </Typography>
        <Typography className='mt-3 text-base text-neutral-dark/70'>
          Regístrate como comprador o vendedor. Los vendedores acceden al panel de tienda y los compradores exploran el catálogo y hacen pedidos.
        </Typography>
        {error ? (
          <Box className='mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
            {error}
          </Box>
        ) : null}
        <Box className='mt-8'>
          <AuthFormRegister onSubmit={handleRegister} isLoading={isloadingRegister} />
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
