import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import FormField from '@/presentation/ui/molecules/forms/FormField';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import CustomerRegisterForm from '@/presentation/ui/molecules/auth/CustomerRegisterForm';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { useRegisterCustomer } from '@/application/useCases/auth/useRegisterCustomer';
import { registerInvitedSellerSchema } from '@/domain/validations/auth/RegisterInvitedSellerValidation';
import { InvitationsRepository } from '@/infrastructure/repositories/api/invitations/InvitationsRepository';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { ROUTES } from '@/shared/constants/routes';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import { authSession } from '@/shared/utils/authSession';
import { ADMIN_WHATSAPP } from '@/shared/config/appContact';

const PAGE_BACKGROUND =
  'bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.14),_transparent_32%),linear-gradient(135deg,_#fff7f2_0%,_#ffffff_45%,_#eef6ff_100%)]';

interface InvitedSellerForm {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  password_confirm: string;
}

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [validating, setValidating] = useState(!!token);
  const [inviteEmail, setInviteEmail] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { handleRegisterCustomer, isLoading: buyerLoading, error: buyerError } = useRegisterCustomer();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useFormValidation(registerInvitedSellerSchema, submitting, {
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    password_confirm: '',
  });

  useEffect(() => {
    if (!token) return;
    const validate = async () => {
      try {
        const res = await InvitationsRepository.validateToken(token);
        setInviteEmail(res.data.email);
      } catch (err) {
        setTokenError(err instanceof Error ? err.message : 'Invitación no válida');
      } finally {
        setValidating(false);
      }
    };
    void validate();
  }, [token]);

  const onSubmitBuyer = async (data: Parameters<typeof handleRegisterCustomer>[0]) => {
    const result = await handleRegisterCustomer(data);
    if (!result) return;
    if (result.autoLogin) {
      navigate(ROUTES.PUBLIC.HOME);
      return;
    }
    SnackbarUtilities.success(result.message ?? 'Revisa tu correo para confirmar tu cuenta', 'top', 'center');
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  const onSubmitInvitedSeller = async (data: InvitedSellerForm) => {
    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones para continuar');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await AuthRepository.registerCustomer({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: inviteEmail,
        phone: data.phone.trim(),
        password: data.password,
        inviteToken: token ?? undefined,
      });
      SnackbarUtilities.success(res.data.message, 'top', 'center');

      // Invitación aceptada: el backend ya devuelve token+user (cuenta auto-verificada) —
      // entrar directo en vez de mandar a login a repetir credenciales que apenas escribió.
      if (res.data.token && res.data.user) {
        authSession.setToken(res.data.token);
        const customer = res.data.customer ?? res.data.user.customer ?? null;
        authSession.setUser({
          ...res.data.user,
          customer: customer ? { ...customer, phone: customer.phone ?? null } : null,
        });
        navigate(ROUTES.PUBLIC.HOME);
        return;
      }

      navigate(ROUTES.PUBLIC.LOGIN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible registrarse');
    } finally {
      setSubmitting(false);
    }
  };

  // No token — buyer self-registration, same form used from the login page
  if (!token) {
    return (
      <div className={`min-h-screen ${PAGE_BACKGROUND} px-4 py-4 sm:py-10`}>
        <Helmet>
          <title>Crea tu cuenta — Merku</title>
          <meta name='description' content='Regístrate gratis en Merku para comprar en tiendas y restaurantes locales.' />
          <link rel='canonical' href={`${import.meta.env.VITE_APP_URL ?? ''}/register`} />
          <meta property='og:type' content='website' />
          <meta property='og:site_name' content='Merku' />
          <meta property='og:url' content={`${import.meta.env.VITE_APP_URL ?? ''}/register`} />
          <meta property='og:title' content='Crea tu cuenta — Merku' />
          <meta property='og:description' content='Regístrate gratis en Merku para comprar en tiendas y restaurantes locales.' />
          <meta property='og:image' content={`${import.meta.env.VITE_APP_URL ?? ''}/og-image.png`} />
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:title' content='Crea tu cuenta — Merku' />
          <meta name='twitter:description' content='Regístrate gratis en Merku para comprar en tiendas y restaurantes locales.' />
        </Helmet>
        <div className='mx-auto w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_rgba(34,34,34,0.12)] backdrop-blur'>
          <div className='mb-5 flex items-center justify-between'>
            <Link
              to={ROUTES.PUBLIC.HOME}
              className='flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-primary/30 hover:text-primary'
            >
              <i className='bx bx-arrow-back text-sm' aria-hidden='true' />
              Volver
            </Link>
            <Link to={ROUTES.PUBLIC.LOGIN} className='text-xs font-medium text-slate-400 transition hover:text-primary'>
              ¿Ya tienes cuenta? Ingresar →
            </Link>
          </div>

          <h1 className='text-2xl font-bold text-slate-800'>Crea tu cuenta</h1>
          <p className='mt-1 text-sm text-slate-500'>Empieza a comprar en tiendas locales.</p>

          <div className='mt-6'>
            <CustomerRegisterForm onSubmit={onSubmitBuyer} isLoading={buyerLoading} error={buyerError} />
          </div>

          <div className='mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center'>
            <p className='text-xs text-slate-500'>
              ¿Quieres <strong>vender</strong> en Merku?{' '}
              <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target='_blank' rel='noopener noreferrer'
                className='font-semibold text-primary hover:underline'>
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Token validating
  if (validating) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    );
  }

  // Token error
  if (tokenError) {
    return (
      <div className={`min-h-screen ${PAGE_BACKGROUND} px-4 py-4 sm:py-10`}>
        <div className='mx-auto w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-10 shadow-[0_30px_80px_rgba(34,34,34,0.12)] text-center backdrop-blur'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100'>
            <i className='bx bx-error-circle text-3xl text-red-500' aria-hidden='true' />
          </div>
          <h1 className='text-2xl font-bold text-slate-800'>Invitación no válida</h1>
          <p className='mt-3 text-sm text-slate-500'>{tokenError}</p>
          <Link
            to={ROUTES.PUBLIC.LOGIN}
            className='mt-8 inline-block rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90'
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Valid token — invited seller registration, with real-time field validation
  return (
    <div className={`min-h-screen ${PAGE_BACKGROUND} px-4 py-4 sm:py-10`}>
      <div className='mx-auto w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_rgba(34,34,34,0.12)] backdrop-blur'>
        {/* Back link */}
        <div className='mb-5 flex items-center justify-between'>
          <Link
            to={ROUTES.PUBLIC.HOME}
            className='flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-primary/30 hover:text-primary'
          >
            <i className='bx bx-arrow-back text-sm' aria-hidden='true' />
            Volver al comercio
          </Link>
          <Link
            to={ROUTES.PUBLIC.LOGIN}
            className='text-xs font-medium text-slate-400 transition hover:text-primary'
          >
            ¿Ya tienes cuenta? Ingresar →
          </Link>
        </div>

        {/* Invite badge */}
        <div className='mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3'>
          <i className='bx bx-check-shield flex-shrink-0 text-xl text-emerald-600' aria-hidden='true' />
          <div>
            <p className='text-xs font-semibold text-emerald-700'>Invitación válida</p>
            <p className='text-xs text-emerald-600'>Fuiste invitado como <strong>vendedor</strong> en Merku.</p>
          </div>
        </div>

        <h1 className='text-2xl font-bold text-slate-800'>Crea tu cuenta</h1>
        <p className='mt-1 text-sm text-slate-500'>Completa tu perfil para activar tu tienda.</p>

        {error ? (
          <div className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmitInvitedSeller)} className='mt-6 space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField name='firstName' label='Nombre *' control={control} type='text' placeholder='Christian' showLabel boxClassName='w-full' />
            <FormField name='lastName' label='Apellido *' control={control} type='text' placeholder='Pabón' showLabel boxClassName='w-full' />
          </div>

          <div>
            <label className='mb-1.5 block text-xs font-semibold text-slate-600'>Correo electrónico</label>
            <input
              type='email'
              value={inviteEmail}
              readOnly
              className='w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed'
            />
            <p className='mt-1 text-xs text-slate-400'>El correo viene fijo en tu invitación.</p>
          </div>

          <FormField name='phone' label='Teléfono *' control={control} type='text' placeholder='300 123 4567' showLabel boxClassName='w-full' />

          <FormField
            name='password'
            label='Contraseña *'
            control={control}
            type='password'
            placeholder='Mínimo 6 caracteres'
            showLabel
            boxClassName='w-full'
          />
          <FormField
            name='password_confirm'
            label='Confirmar contraseña *'
            control={control}
            type='password'
            placeholder='Repite tu contraseña'
            showLabel
            boxClassName='w-full'
          />

          <label className='flex items-start gap-2 text-xs text-slate-500'>
            <input
              type='checkbox'
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className='mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30'
            />
            <span>
              Acepto los{' '}
              <Link to={ROUTES.PUBLIC.TERMS} target='_blank' className='font-semibold text-primary hover:underline'>
                términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link to={ROUTES.PUBLIC.PRIVACY} target='_blank' className='font-semibold text-primary hover:underline'>
                política de privacidad
              </Link>
            </span>
          </label>

          <Button
            type='submit'
            variant='primary'
            fullWidth
            size='lg'
            disabled={!isValid || submitting || !acceptedTerms}
            className='mt-2 min-h-12'
          >
            {submitting ? 'Creando cuenta...' : 'Crear cuenta y entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
