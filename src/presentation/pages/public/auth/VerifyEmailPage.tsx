import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVerifyEmail } from '@/application/useCases/auth/useVerifyEmail';
import { ROUTES } from '@/shared/constants/routes';

type VerifyStatus = 'loading' | 'success' | 'error';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, isLoading, error } = useVerifyEmail();
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const hasRequestedRef = useRef(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);

  useEffect(() => {
    let mounted = true;

    const runVerification = async () => {
      if (hasRequestedRef.current) return;
      hasRequestedRef.current = true;

      if (!token) {
        if (mounted) setStatus('error');
        return;
      }

      const response = await verifyEmail(token);
      if (!mounted) return;
      if (response) {
        setStatus('success');
        return;
      }
      setStatus('error');
    };

    void runVerification();

    return () => {
      mounted = false;
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [token, verifyEmail]);

  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
    }, 1200);

    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [navigate, status]);

  return (
    <div className='min-h-screen bg-neutral-black text-neutral-white flex items-center justify-center px-6'>
      <div className='w-full max-w-xl rounded-2xl border border-neutral-gray/30 bg-neutral-black/70 p-8 text-center'>
        {status === 'loading' && (
          <>
            <h1 className='text-2xl font-semibold mb-3'>Verificando correo</h1>
            <p className=''>Estamos validando tu token de verificación.</p>
            {isLoading && (
              <p className='mt-4 text-sm text-neutral-gray'>Un momento...</p>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className='text-2xl font-semibold mb-3'>Correo verificado</h1>
            <p className='text-neutral-gray mb-6'>
              Tu cuenta ya está activa. Redirigiendo a iniciar sesión...
            </p>
            <button
              className='rounded-lg bg-primary px-5 py-2 text-neutral-white hover:opacity-90 transition'
              onClick={() => navigate(ROUTES.PUBLIC.LOGIN, { replace: true })}
            >
              Ir ahora
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className='text-2xl font-semibold mb-3'>
              No se pudo verificar
            </h1>
            <p className='text-neutral-gray mb-2'>
              El token es inválido, expiró o faltó en la URL.
            </p>
            {error && <p className='text-sm text-red-400 mb-6'>{error}</p>}
            <button
              className='rounded-lg bg-primary px-5 py-2 text-neutral-white hover:opacity-90 transition'
              onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
            >
              Volver a iniciar sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
