import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PhoneInputCO from '@/presentation/ui/molecules/common/PhoneInputCO';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import type { IAuthenticatedUser, IAuthMeResp } from '@/application/dtos/auth/login/response/LoginResponse';
import { isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';
import { authSession } from '@/shared/utils/authSession';
import { ROUTES } from '@/shared/constants/routes';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  seller: 'Vendedor',
  buyer: 'Comprador',
};

const roleColor = (role: string | null | undefined) => {
  if (role === 'admin') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  if (role === 'seller') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
  return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
};

const initials = (user: IAuthenticatedUser) => {
  const c = user.customer;
  if (c) {
    return `${c.firstName.charAt(0)}${c.lastName.charAt(0)}`.toUpperCase();
  }
  return user.email.substring(0, 2).toUpperCase();
};

const ProfilePage = () => {
  const [user, setUser] = useState<IAuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AuthRepository.getAuthenticatedUser().then((res: IAuthMeResp) => {
      if (cancelled) return;
      const u = res.data;
      setUser(u);
      // Sync session so navbar name is always fresh
      authSession.setUser(u);
      setForm({
        firstName: u.customer?.firstName ?? '',
        lastName: u.customer?.lastName ?? '',
        phone: u.customer?.phone ?? '',
      });
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (!isAuthenticated()) return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    try {
      const updated = await AuthRepository.updateMyProfile({
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, customer: prev.customer ? { ...prev.customer, ...updated } : null };
        authSession.setUser(next);
        return next;
      });
      setDirty(false);
      SnackbarUtilities.success('Perfil actualizado');
    } catch {
      SnackbarUtilities.error('No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className='space-y-8'>
      {/* Header */}
      <Box className='rounded-[2rem] bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_55%,_#eff6ff_100%)] px-6 py-10 shadow-sm'>
        <Typography variant='h1' className='text-3xl font-bold'>
          Mi perfil
        </Typography>
        <Typography className='mt-3 max-w-2xl text-neutral-dark/70'>
          Administra tus datos personales y accede a tu historial de compras.
        </Typography>
      </Box>

      {loading ? (
        <Box className='flex items-center justify-center py-20'>
          <i className='bx bx-loader-alt animate-spin text-3xl text-primary' />
        </Box>
      ) : !user ? (
        <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
          No se pudo cargar la información del perfil.
        </Box>
      ) : (
        <Box className='grid gap-6 lg:grid-cols-[300px_1fr]'>

          {/* ── Left: identity card ── */}
          <Box className='flex flex-col gap-4'>
            <Box className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm text-center'>
              {/* Avatar */}
              <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-extrabold text-white shadow-md'>
                {initials(user)}
              </div>
              <p className='font-semibold text-slate-800'>
                {user.customer
                  ? `${user.customer.firstName} ${user.customer.lastName}`
                  : user.email}
              </p>
              <p className='mt-0.5 text-sm text-slate-500'>{user.email}</p>
              <span className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${roleColor(user.role)}`}>
                {ROLE_LABELS[user.role ?? ''] ?? user.role ?? 'Usuario'}
              </span>

              {user.customer ? (
                <div className='mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400'>
                  <i className='bx bx-check-circle text-sm text-green-500' />
                  Cuenta verificada
                </div>
              ) : null}
            </Box>

          </Box>

          {/* ── Right: edit form ── */}
          <Box className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
            <Typography variant='h2' className='mb-6 text-xl font-semibold'>
              Datos personales
            </Typography>

            {!user.customer ? (
              <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
                <i className='bx bx-info-circle mr-1.5' />
                Tu cuenta de administrador no tiene un perfil de cliente asociado. Los campos de nombre y teléfono no están disponibles.
              </div>
            ) : (
              <form onSubmit={(e) => { void handleSubmit(e); }} className='space-y-5'>
                <div className='grid gap-5 sm:grid-cols-2'>
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                      Nombre
                    </label>
                    <input
                      type='text'
                      name='firstName'
                      value={form.firstName}
                      onChange={handleChange}
                      maxLength={120}
                      placeholder='Tu nombre'
                      className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
                    />
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                      Apellido
                    </label>
                    <input
                      type='text'
                      name='lastName'
                      value={form.lastName}
                      onChange={handleChange}
                      maxLength={120}
                      placeholder='Tu apellido'
                      className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
                    />
                  </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                    Correo electrónico
                  </label>
                  <input
                    type='email'
                    value={user.email}
                    readOnly
                    className='cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500'
                  />
                  <p className='text-[11px] text-slate-400'>El correo no se puede cambiar desde aquí.</p>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                    Teléfono
                  </label>
                  <PhoneInputCO
                    name='phone'
                    value={form.phone}
                    onChange={(v) => handleChange({ target: { name: 'phone', value: v } } as React.ChangeEvent<HTMLInputElement>)}
                  />
                </div>

                <div className='flex items-center justify-between border-t border-slate-100 pt-5'>
                  <button
                    type='button'
                    onClick={() => {
                      setForm({
                        firstName: user.customer?.firstName ?? '',
                        lastName: user.customer?.lastName ?? '',
                        phone: user.customer?.phone ?? '',
                      });
                      setDirty(false);
                    }}
                    disabled={!dirty || saving}
                    className='rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 disabled:opacity-40'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    disabled={!dirty || saving}
                    className='flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-40 active:scale-95'
                  >
                    {saving ? (
                      <i className='bx bx-loader-alt animate-spin text-base' />
                    ) : (
                      <i className='bx bx-check text-base' />
                    )}
                    Guardar cambios
                  </button>
                </div>
              </form>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProfilePage;
