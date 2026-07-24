import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import PhoneInputCO from '@/presentation/ui/molecules/common/PhoneInputCO';
import { InvitationsRepository } from '@/infrastructure/repositories/api/invitations/InvitationsRepository';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { ROUTES } from '@/shared/constants/routes';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import { ADMIN_EMAIL, ADMIN_WHATSAPP } from '@/shared/config/appContact';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [validating, setValidating] = useState(!!token);
  const [inviteEmail, setInviteEmail] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    InvitationsRepository.validateToken(token)
      .then((res) => {
        setInviteEmail(res.data.email);
        setForm((f) => ({ ...f, email: res.data.email }));
      })
      .catch((err) => {
        setTokenError(err instanceof Error ? err.message : 'Invitación no válida');
      })
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await AuthRepository.registerCustomer({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        inviteToken: token ?? undefined,
      });
      SnackbarUtilities.success(res.data.message, 'top', 'center');
      navigate(ROUTES.PUBLIC.LOGIN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible registrarse');
    } finally {
      setSubmitting(false);
    }
  };

  // No token — show locked message with contact options
  if (!token) {
    const mailtoSubject = encodeURIComponent('Solicitud para ser vendedor en el marketplace');
    const mailtoBody = encodeURIComponent(
      'Hola,\n\nMe interesa crear una tienda en el marketplace.\n\nNombre: \nNegocio: \nTeléfono: \n\nQuedo atento a su respuesta.\n\nSaludos.'
    );
    const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${ADMIN_EMAIL}&su=${mailtoSubject}&body=${mailtoBody}`;
    const whatsappHref = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hola, me interesa crear una tienda en el marketplace. ¿Cómo puedo solicitar una invitación?')}`;

    return (
      <div className='min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,69,0,0.14),_transparent_32%),linear-gradient(135deg,_#fff7f2_0%,_#ffffff_45%,_#eef6ff_100%)] px-4 py-4 sm:py-10'>
        <div className='mx-auto w-full max-w-md space-y-4'>
          {/* Header card */}
          <div className='rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_rgba(34,34,34,0.12)] text-center backdrop-blur'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
              <i
                className='bx bx-store-alt text-3xl text-primary'
                aria-hidden='true'
              />
            </div>
            <h1 className='text-2xl font-bold text-slate-800'>
              ¿Quieres vender aquí?
            </h1>
            <p className='mt-3 text-sm text-slate-500'>
              El acceso de vendedores es por invitación. Contáctanos y te enviamos
              tu enlace de registro.
            </p>
          </div>

          {/* Contact options */}
          <div className={`grid gap-3 ${ADMIN_WHATSAPP ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Email */}
            {ADMIN_EMAIL ? (
              <a
                href={gmailHref}
                target='_blank'
                rel='noopener noreferrer'
                className='flex flex-col items-center gap-3 rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-[0_8px_32px_rgba(34,34,34,0.08)] backdrop-blur transition hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] hover:-translate-y-0.5'
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10'>
                  <i
                    className='bx bx-envelope text-2xl text-primary'
                    aria-hidden='true'
                  />
                </div>
                <div className='text-center'>
                  <p className='text-sm font-semibold text-slate-800'>
                    Solicitar por correo
                  </p>
                  <p className='mt-0.5 text-xs text-slate-400'>
                    Se abre tu app de email
                  </p>
                </div>
              </a>
            ) : null}

            {/* WhatsApp */}
            {ADMIN_WHATSAPP ? (
              <a
                href={whatsappHref}
                target='_blank'
                rel='noopener noreferrer'
                className='flex flex-col items-center gap-3 rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-[0_8px_32px_rgba(34,34,34,0.08)] backdrop-blur transition hover:shadow-[0_12px_40px_rgba(37,211,102,0.18)] hover:-translate-y-0.5'
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366]/10'>
                  <i
                    className='bx bxl-whatsapp text-2xl text-[#25D366]'
                    aria-hidden='true'
                  />
                </div>
                <div className='text-center'>
                  <p className='text-sm font-semibold text-slate-800'>
                    Contactar por WhatsApp
                  </p>
                  <p className='mt-0.5 text-xs text-slate-400'>Respuesta inmediata</p>
                </div>
              </a>
            ) : null}
          </div>

          {/* Spam notice */}
          <div className='flex items-start gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50/80 px-5 py-4 backdrop-blur'>
            <i className='bx bx-mail-send mt-0.5 flex-shrink-0 text-xl text-amber-500' aria-hidden='true' />
            <div>
              <p className='text-sm font-semibold text-amber-800'>¿Ya te enviaron una invitación?</p>
              <p className='mt-0.5 text-xs text-amber-700'>
                Revisa tu carpeta de <strong>Spam o Correo no deseado</strong> — a veces el email de invitación llega ahí.
                Si lo encuentras, márcalo como "No es spam" y haz clic en el enlace.
              </p>
            </div>
          </div>

          {/* Back link */}
          <div className='text-center'>
            <Link
              to={ROUTES.PUBLIC.LOGIN}
              className='text-sm font-medium text-slate-400 transition hover:text-primary'
            >
              ← Volver al inicio de sesión
            </Link>
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
      <div className='min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,69,0,0.14),_transparent_32%),linear-gradient(135deg,_#fff7f2_0%,_#ffffff_45%,_#eef6ff_100%)] px-4 py-4 sm:py-10'>
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

  // Valid token — show registration form
  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,69,0,0.14),_transparent_32%),linear-gradient(135deg,_#fff7f2_0%,_#ffffff_45%,_#eef6ff_100%)] px-4 py-4 sm:py-10'>
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
            <p className='text-xs text-emerald-600'>Fuiste invitado como <strong>vendedor</strong> en el marketplace.</p>
          </div>
        </div>

        <h1 className='text-2xl font-bold text-slate-800'>Crea tu cuenta</h1>
        <p className='mt-1 text-sm text-slate-500'>Completa tu perfil para activar tu tienda.</p>

        {error ? (
          <div className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
            {error}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)} className='mt-6 space-y-4'>
          <div>
            <label className='mb-1.5 block text-xs font-semibold text-slate-600'>Nombre completo *</label>
            <input
              required
              type='text'
              placeholder='Christian Pabón'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
            />
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

          <div>
            <label className='mb-1.5 block text-xs font-semibold text-slate-600'>Teléfono (opcional)</label>
            <PhoneInputCO
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            />
          </div>

          <div>
            <label className='mb-1.5 block text-xs font-semibold text-slate-600'>Contraseña *</label>
            <div className='relative'>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                placeholder='Mínimo 6 caracteres'
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              />
              <button
                type='button'
                onClick={() => setShowPassword((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                tabIndex={-1}
              >
                <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} text-lg`} aria-hidden='true' />
              </button>
            </div>
          </div>

          <div>
            <label className='mb-1.5 block text-xs font-semibold text-slate-600'>Confirmar contraseña *</label>
            <div className='relative'>
              <input
                required
                type={showConfirm ? 'text' : 'password'}
                placeholder='Repite tu contraseña'
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              />
              <button
                type='button'
                onClick={() => setShowConfirm((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                tabIndex={-1}
              >
                <i className={`bx ${showConfirm ? 'bx-hide' : 'bx-show'} text-lg`} aria-hidden='true' />
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={submitting}
            className='mt-2 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50'
          >
            {submitting ? 'Creando cuenta...' : 'Crear cuenta y entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
