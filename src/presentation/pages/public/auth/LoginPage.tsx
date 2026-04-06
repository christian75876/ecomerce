import { useLogin } from '@/application/useCases/auth/useLogin';
import { useRegisterCustomer } from '@/application/useCases/auth/useRegisterCustomer';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { loginSchema } from '@/domain/validations/auth/LoginValidation';
import FormField from '@/presentation/ui/molecules/forms/FormField';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import CustomerRegisterForm from '@/presentation/ui/molecules/auth/CustomerRegisterForm';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { useState } from 'react';

const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { handleLogin, isloading, error } = useLogin();
  const {
    handleRegisterCustomer,
    isLoading: isCustomerRegisterLoading,
    error: customerRegisterError,
  } = useRegisterCustomer();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useFormValidation(loginSchema, isloading, {
    email: '',
    password: '',
  });

  return (
    <Box className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,69,0,0.14),_transparent_32%),linear-gradient(135deg,_#fff7f2_0%,_#ffffff_45%,_#eef6ff_100%)] px-4 py-10">
      <Box className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(34,34,34,0.12)] backdrop-blur">
        <Box className="hidden w-[46%] flex-col justify-between bg-[linear-gradient(160deg,_rgba(255,69,0,0.95)_0%,_rgba(194,54,0,0.92)_45%,_rgba(0,119,255,0.88)_100%)] p-10 text-white lg:flex">
          <Box>
            <Typography variant="span" className="text-sm uppercase tracking-[0.35em] text-white/75">
              Hot Commerce
            </Typography>
            <Typography variant="h1" className="mt-6 max-w-sm text-5xl font-bold leading-tight text-white">
              Opera tienda, catálogo y ventas desde un solo panel.
            </Typography>
          </Box>
          <Box className="grid gap-4 text-sm text-white/90">
            <Box className="rounded-2xl border border-white/20 bg-white/10 p-4">
              Auth, inventario, POS y pedidos online sobre una misma base.
            </Box>
            <Box className="rounded-2xl border border-white/20 bg-white/10 p-4">
              Esta primera iteración deja el acceso interno estable para seguir con categorías y productos.
            </Box>
          </Box>
        </Box>

        <Box className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <Box className="w-full max-w-md">
            <Typography variant="span" className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Acceso a la plataforma
            </Typography>
            <Typography variant="h2" className="mt-4 text-4xl font-bold text-neutral-dark">
              {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
            </Typography>
            <Typography className="mt-3 text-base text-neutral-dark/70">
              {mode === 'login'
                ? 'Compradores y vendedores entran desde aquí. Los compradores van al catálogo y los vendedores al panel.'
                : 'Crea una cuenta de comprador en segundos. Si vas a vender en la plataforma, usa el registro de tienda.'}
            </Typography>
            <Box className='mt-8 inline-flex rounded-full bg-neutral-dark/5 p-1'>
              <button
                type='button'
                onClick={() => setMode('login')}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-primary text-white' : 'text-neutral-dark/70'}`}
              >
                Ingresar
              </button>
              <button
                type='button'
                onClick={() => setMode('register')}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-primary text-white' : 'text-neutral-dark/70'}`}
              >
                Registrarse
              </button>
            </Box>

            {mode === 'login' ? (
              <form onSubmit={handleSubmit(handleLogin)} className="mt-10 space-y-5">
                <FormField
                  name="email"
                  label="Correo"
                  control={control}
                  type="email"
                  placeholder="correo@empresa.com"
                  showLabel
                  boxClassName="w-full"
                />
                <FormField
                  name="password"
                  label="Contraseña"
                  control={control}
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  showLabel
                  boxClassName="w-full"
                />

                {error ? (
                  <Box className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </Box>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={!isValid || isloading}
                  className="mt-2 min-h-12"
                >
                  {isloading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </form>
            ) : (
              <Box className='mt-10'>
                <CustomerRegisterForm
                  onSubmit={handleRegisterCustomer}
                  isLoading={isCustomerRegisterLoading}
                  error={customerRegisterError}
                />
                <Box className='mt-6 rounded-2xl border border-neutral-dark/10 bg-neutral-dark/5 px-4 py-4 text-sm text-neutral-dark/70'>
                  ¿Quieres vender en la plataforma? Usa el registro interno para comerciantes.
                  <Box className='mt-3'>
                    <Link to={ROUTES.PUBLIC.REGISTER} className='font-semibold text-primary'>
                      Ir al registro de vendedor
                    </Link>
                  </Box>
                </Box>
              </Box>
            )}
            <Typography className='mt-6 text-sm text-neutral-dark/60'>
              También puedes abrir el registro dedicado en{' '}
              <Link to={ROUTES.PUBLIC.REGISTER} className='font-semibold text-primary'>
                esta página
              </Link>.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
