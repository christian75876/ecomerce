import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { ROUTES } from '@/shared/constants/routes';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import Button from '@/presentation/ui/atoms/button/SimpleButton';

type RecoveryStep = 'email' | 'code' | 'password';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10';

const isStrongPassword = (value: string) =>
  value.length >= 8 &&
  /[a-z]/.test(value) &&
  /[A-Z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

const RecoverPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const requestRecoveryCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await AuthRepository.requestPasswordRecovery(normalizedEmail);
      setEmail(normalizedEmail);
      setDevCode(response.data.otp_code ?? null);
      setStep('code');
      setSuccess('Si la cuenta existe, enviamos un código al correo registrado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible enviar el código.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void requestRecoveryCode();
  };

  const handleCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await AuthRepository.verifyRecoveryOtp({ email, code });
      setStep('password');
      setSuccess('Código verificado. Define tu nueva contraseña.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'El código no es válido.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isStrongPassword(newPassword)) {
      setError('Usa mínimo 8 caracteres con mayúscula, minúscula, número y símbolo.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await AuthRepository.resetPassword({ email, code, newPassword });
      SnackbarUtilities.success(
        'Contraseña actualizada. Ingresa con tu nueva contraseña.',
        'top',
        'center',
      );
      navigate(ROUTES.PUBLIC.LOGIN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar la contraseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10'>
      <div className='relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/8'>
        <div className='mb-7 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <img src='/icons/icon-96x96.png' alt='Hot Commerce' className='h-9 w-9 rounded-xl' />
            <span className='text-base font-extrabold text-slate-900'>
              Hot Commerce
            </span>
          </div>
          <Link
            to={ROUTES.PUBLIC.LOGIN}
            className='text-xs font-semibold text-slate-400 transition hover:text-primary'
          >
            Ingresar
          </Link>
        </div>

        <div>
          <p className='text-xs font-semibold uppercase text-primary'>
            Recuperar acceso
          </p>
          <h1 className='mt-2 text-2xl font-extrabold text-slate-900'>
            Restablece tu contraseña
          </h1>
          <p className='mt-2 text-sm leading-relaxed text-slate-500'>
            Te enviaremos un código de seguridad para confirmar tu cuenta.
          </p>
        </div>

        {error ? (
          <div className='mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700'>
            <i className='bx bx-error-circle mt-0.5 flex-shrink-0 text-base' aria-hidden='true' />
            {error}
          </div>
        ) : null}

        {success ? (
          <div className='mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700'>
            <i className='bx bx-check-circle mt-0.5 flex-shrink-0 text-base' aria-hidden='true' />
            <span>
              {success}
              {devCode ? (
                <strong className='mt-1 block font-semibold'>Código temporal: {devCode}</strong>
              ) : null}
            </span>
          </div>
        ) : null}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className='mt-7 space-y-4'>
            <div>
              <label className='mb-1.5 block text-xs font-semibold text-slate-600'>
                Correo electrónico
              </label>
              <input
                required
                type='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder='correo@empresa.com'
                className={inputClassName}
              />
            </div>

            <Button type='submit' variant='primary' fullWidth size='lg' loading={submitting}>
              Enviar código
            </Button>
          </form>
        ) : null}

        {step === 'code' ? (
          <form onSubmit={handleCodeSubmit} className='mt-7 space-y-4'>
            <div>
              <label className='mb-1.5 block text-xs font-semibold text-slate-600'>
                Código de 6 dígitos
              </label>
              <input
                required
                inputMode='numeric'
                autoComplete='one-time-code'
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder='000000'
                className={`${inputClassName} text-center text-lg font-bold`}
              />
            </div>

            <Button type='submit' variant='primary' fullWidth size='lg' loading={submitting}>
              Verificar código
            </Button>

            <button
              type='button'
              onClick={() => void requestRecoveryCode()}
              disabled={submitting}
              className='w-full text-center text-xs font-semibold text-slate-400 transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-50'
            >
              Reenviar código
            </button>
          </form>
        ) : null}

        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className='mt-7 space-y-4'>
            <div>
              <label className='mb-1.5 block text-xs font-semibold text-slate-600'>
                Nueva contraseña
              </label>
              <input
                required
                type='password'
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder='Mínimo 8 caracteres'
                className={inputClassName}
              />
            </div>

            <div>
              <label className='mb-1.5 block text-xs font-semibold text-slate-600'>
                Confirmar contraseña
              </label>
              <input
                required
                type='password'
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder='Repite tu contraseña'
                className={inputClassName}
              />
            </div>

            <Button type='submit' variant='primary' fullWidth size='lg' loading={submitting}>
              Actualizar contraseña
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
};

export default RecoverPasswordPage;
