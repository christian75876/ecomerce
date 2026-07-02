import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useLogin } from '@/application/useCases/auth/useLogin';
import { useRegisterCustomer } from '@/application/useCases/auth/useRegisterCustomer';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { loginSchema } from '@/domain/validations/auth/LoginValidation';
import { ROUTES } from '@/shared/constants/routes';

import FormField from '@/presentation/ui/molecules/forms/FormField';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import CustomerRegisterForm from '@/presentation/ui/molecules/auth/CustomerRegisterForm';

const FEATURES = [
  { icon: 'bx-store',            label: 'Gestión de tiendas y catálogo' },
  { icon: 'bx-credit-card',      label: 'POS y pedidos integrados' },
  { icon: 'bx-box',              label: 'Inventario y lotes en tiempo real' },
  { icon: 'bx-bar-chart-alt-2',  label: 'Dashboard analítico completo' },
];

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
  } = useFormValidation(loginSchema, isloading, { email: '', password: '' });

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10'>
      {/* BG blobs */}
      <div className='pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl' aria-hidden='true' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent/8 blur-3xl' aria-hidden='true' />

      <div className='relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/8'>
        <div className='flex min-h-[560px]'>

          {/* ── Left panel ── */}
          <div className='relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-darker via-primary to-secondary p-10 lg:flex lg:w-[420px]'>
            {/* grid pattern */}
            <div
              className='pointer-events-none absolute inset-0 opacity-[0.07]'
              style={{
                backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
              aria-hidden='true'
            />

            <div className='relative z-10'>
              {/* Logo */}
              <div className='flex items-center gap-2'>
                <img src='/icons/icon-96x96.png' alt='Hot Commerce' className='h-9 w-9 rounded-xl' />
                <span className='text-lg font-extrabold tracking-tight text-white'>
                  Hot Commerce
                </span>
              </div>

              <h2 className='mt-10 text-4xl font-extrabold leading-tight text-white'>
                Vende más.<br />
                Gestiona<br />
                todo.
              </h2>
              <p className='mt-4 text-sm leading-relaxed text-white/65'>
                Tienda, inventario, POS y analítica en una sola plataforma.
              </p>
            </div>

            {/* Features */}
            <div className='relative z-10 space-y-2'>
              {FEATURES.map(({ icon, label }) => (
                <div key={icon} className='flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white/90'>
                  <i className={`bx ${icon} text-base text-white/70`} aria-hidden='true' />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className='flex flex-1 flex-col justify-center px-6 py-10 sm:px-10'>
            <div className='mx-auto w-full max-w-sm'>

              {/* Logo + back — solo visible en mobile (el panel izquierdo ya los muestra en desktop) */}
              <div className='mb-6 flex items-center justify-between lg:hidden'>
                <div className='flex items-center gap-2'>
                  <img src='/icons/icon-96x96.png' alt='Hot Commerce' className='h-8 w-8 rounded-xl' />
                  <span className='text-base font-extrabold tracking-tight text-slate-900'>
                    Hot Commerce
                  </span>
                </div>
                <Link
                  to={ROUTES.PUBLIC.HOME}
                  className='flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-primary/30 hover:text-primary'
                >
                  <i className='bx bx-arrow-back text-sm' aria-hidden='true' />
                  Volver al inicio
                </Link>
              </div>

              {/* Mode toggle */}
              <div className='mb-8 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1'>
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    type='button'
                    onClick={() => setMode(m)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                      mode === m
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {m === 'login' ? 'Ingresar' : 'Registrarse'}
                  </button>
                ))}
              </div>

              <h1 className='text-2xl font-extrabold tracking-tight text-slate-900'>
                {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </h1>
              <p className='mt-1.5 text-sm text-slate-500'>
                {mode === 'login'
                  ? 'Compradores y vendedores entran desde aquí.'
                  : 'Regístrate como comprador. Para vender usa el registro de vendedor.'}
              </p>

              {/* Login form */}
              {mode === 'login' ? (
                <form onSubmit={handleSubmit(handleLogin)} className='mt-7 space-y-4'>
                  <FormField
                    name='email'
                    label='Correo electrónico'
                    control={control}
                    type='email'
                    placeholder='correo@empresa.com'
                    showLabel
                    boxClassName='w-full'
                  />
                  <FormField
                    name='password'
                    label='Contraseña'
                    control={control}
                    type='password'
                    placeholder='Tu contraseña'
                    showLabel
                    boxClassName='w-full'
                  />

                  {error ? (
                    <div className='flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700'>
                      <i className='bx bx-error-circle mt-0.5 flex-shrink-0 text-base' aria-hidden='true' />
                      {error}
                    </div>
                  ) : null}

                  <Button
                    type='submit'
                    variant='primary'
                    fullWidth
                    size='lg'
                    loading={isloading}
                    disabled={!isValid || isloading}
                    className='mt-2'
                  >
                    Ingresar
                  </Button>
                </form>
              ) : (
                <div className='mt-7'>
                  <CustomerRegisterForm
                    onSubmit={handleRegisterCustomer}
                    isLoading={isCustomerRegisterLoading}
                    error={customerRegisterError}
                  />
                  <p className='mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500'>
                    ¿Quieres vender?{' '}
                    <Link to={ROUTES.PUBLIC.REGISTER} className='font-semibold text-primary hover:underline'>
                      Registro de vendedor →
                    </Link>
                  </p>
                </div>
              )}

              {mode === 'login' ? (
                <p className='mt-6 text-center text-xs text-slate-400'>
                  ¿Tienes tienda?{' '}
                  <Link to={ROUTES.PUBLIC.REGISTER} className='font-semibold text-primary hover:underline'>
                    Regístrate como vendedor
                  </Link>
                </p>
              ) : null}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
