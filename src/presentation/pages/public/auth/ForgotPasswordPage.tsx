import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { ROUTES } from '@/shared/constants/routes';

type Step = 'email' | 'otp' | 'password';

const BG =
  'min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,69,0,0.14),_transparent_32%),linear-gradient(135deg,_#fff7f2_0%,_#ffffff_45%,_#eef6ff_100%)] px-4 py-4 sm:py-10';
const CARD =
  'mx-auto w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_rgba(34,34,34,0.12)] backdrop-blur';
const INPUT =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10';
const LABEL = 'mb-1.5 block text-xs font-semibold text-slate-600';
const BTN =
  'mt-2 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpString = code.join('');

  // ── Step 1: send OTP ──────────────────────────────────────────────────────

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Ingresa tu correo electrónico'); return; }
    setLoading(true);
    try {
      await AuthRepository.requestPasswordRecovery(email.trim().toLowerCase());
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el código');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ───────────────────────────────────────────────────

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpString.length < 6) { setError('Ingresa el código completo de 6 dígitos'); return; }
    setError(null);
    setLoading(true);
    try {
      await AuthRepository.verifyRecoveryOtp(email, otpString);
      setStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código incorrecto');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: set new password ─────────────────────────────────────────────

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (newPassword.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    setError(null);
    setLoading(true);
    try {
      await AuthRepository.resetPassword(email, otpString, newPassword);
      navigate(ROUTES.PUBLIC.LOGIN + '?reset=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared layout ────────────────────────────────────────────────────────

  const ErrorBox = () =>
    error ? (
      <div className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
        <i className='bx bx-error-circle mr-1.5' />
        {error}
      </div>
    ) : null;

  const BackToLogin = () => (
    <div className='mt-6 text-center'>
      <Link to={ROUTES.PUBLIC.LOGIN} className='text-sm font-medium text-slate-400 transition hover:text-primary'>
        ← Volver al inicio de sesión
      </Link>
    </div>
  );

  const StepIndicator = ({ current }: { current: 1 | 2 | 3 }) => (
    <div className='mb-6 flex items-center justify-center gap-2'>
      {([1, 2, 3] as const).map((s) => (
        <div
          key={s}
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
            s < current
              ? 'bg-green-500 text-white'
              : s === current
              ? 'bg-primary text-white'
              : 'bg-slate-200 text-slate-400'
          }`}
        >
          {s < current ? <i className='bx bx-check text-sm' /> : s}
        </div>
      ))}
    </div>
  );

  // ── Step 1 ───────────────────────────────────────────────────────────────

  if (step === 'email') {
    return (
      <div className={BG}>
        <Helmet>
          <title>Recuperar contraseña — Merku</title>
          <meta name='description' content='Recupera el acceso a tu cuenta de Merku en unos pocos pasos.' />
          <link rel='canonical' href={`${import.meta.env.VITE_APP_URL ?? ''}/forgot-password`} />
        </Helmet>
        <div className={CARD}>
          <Link
            to={ROUTES.PUBLIC.LOGIN}
            className='mb-6 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-primary/30 hover:text-primary'
          >
            <i className='bx bx-arrow-back text-sm' />
            Volver
          </Link>

          <StepIndicator current={1} />

          <div className='mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10'>
            <i className='bx bx-lock-open text-3xl text-primary' />
          </div>
          <h1 className='mt-3 text-2xl font-bold text-slate-800'>¿Olvidaste tu contraseña?</h1>
          <p className='mt-1 text-sm text-slate-500'>
            Ingresa tu correo y te enviaremos un código de verificación de 6 dígitos.
          </p>

          <ErrorBox />

          <form onSubmit={(e) => void handleSendOtp(e)} className='mt-6 space-y-4'>
            <div>
              <label className={LABEL}>Correo electrónico</label>
              <input
                required
                type='email'
                autoFocus
                placeholder='correo@ejemplo.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT}
              />
            </div>
            <button type='submit' disabled={loading} className={BTN}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>

          <BackToLogin />
        </div>
      </div>
    );
  }

  // ── Step 2 ───────────────────────────────────────────────────────────────

  if (step === 'otp') {
    return (
      <div className={BG}>
        <div className={CARD}>
          <StepIndicator current={2} />

          <div className='mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50'>
            <i className='bx bx-envelope-open text-3xl text-emerald-600' />
          </div>
          <h1 className='mt-3 text-2xl font-bold text-slate-800'>Revisa tu correo</h1>
          <p className='mt-1 text-sm text-slate-500'>
            Enviamos un código de 6 dígitos a{' '}
            <span className='font-semibold text-slate-700'>{email}</span>.
            Válido por 10 minutos.
          </p>

          <ErrorBox />

          <form onSubmit={(e) => void handleVerifyOtp(e)} className='mt-6 space-y-5'>
            <div>
              <label className={LABEL}>Código de verificación</label>
              <div className='flex justify-between gap-2' onPaste={handleOtpPaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type='text'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className='h-12 w-12 rounded-2xl border border-slate-200 bg-slate-50 text-center text-lg font-bold text-slate-800 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15'
                  />
                ))}
              </div>
            </div>

            <button
              type='submit'
              disabled={loading || otpString.length < 6}
              className={BTN}
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>

          <div className='mt-4 text-center'>
            <button
              type='button'
              onClick={() => { setStep('email'); setCode(['', '', '', '', '', '']); setError(null); }}
              className='text-sm font-medium text-slate-400 transition hover:text-primary'
            >
              ¿No recibiste el correo? Reenviar
            </button>
          </div>

          <BackToLogin />
        </div>
      </div>
    );
  }

  // ── Step 3 ───────────────────────────────────────────────────────────────

  return (
    <div className={BG}>
      <div className={CARD}>
        <StepIndicator current={3} />

        <div className='mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50'>
          <i className='bx bx-shield-quarter text-3xl text-blue-600' />
        </div>
        <h1 className='mt-3 text-2xl font-bold text-slate-800'>Nueva contraseña</h1>
        <p className='mt-1 text-sm text-slate-500'>
          Elige una contraseña segura. Debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y un símbolo.
        </p>

        <ErrorBox />

        <form onSubmit={(e) => void handleResetPassword(e)} className='mt-6 space-y-4'>
          <div>
            <label className={LABEL}>Nueva contraseña</label>
            <div className='relative'>
              <input
                required
                type={showPwd ? 'text' : 'password'}
                placeholder='Mínimo 8 caracteres'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={INPUT + ' pr-11'}
              />
              <button
                type='button'
                tabIndex={-1}
                onClick={() => setShowPwd((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
              >
                <i className={`bx ${showPwd ? 'bx-hide' : 'bx-show'} text-lg`} />
              </button>
            </div>
          </div>

          <div>
            <label className={LABEL}>Confirmar contraseña</label>
            <div className='relative'>
              <input
                required
                type={showConfirm ? 'text' : 'password'}
                placeholder='Repite tu contraseña'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={INPUT + ' pr-11'}
              />
              <button
                type='button'
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
              >
                <i className={`bx ${showConfirm ? 'bx-hide' : 'bx-show'} text-lg`} />
              </button>
            </div>
          </div>

          {newPassword.length >= 1 ? (
            <PasswordStrength password={newPassword} />
          ) : null}

          <button type='submit' disabled={loading} className={BTN}>
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>

        <BackToLogin />
      </div>
    </div>
  );
};

// ── Password strength indicator ──────────────────────────────────────────────

const checks = [
  { label: 'Al menos 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Una mayúscula',         test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Una minúscula',         test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un número',             test: (p: string) => /\d/.test(p) },
  { label: 'Un símbolo (!@#…)',      test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const PasswordStrength = ({ password }: { password: string }) => {
  const passed = checks.filter((c) => c.test(password)).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-500'];
  return (
    <div className='space-y-2'>
      <div className='flex gap-1'>
        {checks.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i < passed ? colors[passed - 1] : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <ul className='grid grid-cols-2 gap-x-2 gap-y-0.5'>
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-1 text-[11px] ${c.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
            <i className={`bx ${c.test(password) ? 'bx-check-circle' : 'bx-circle'} text-xs`} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ForgotPasswordPage;
