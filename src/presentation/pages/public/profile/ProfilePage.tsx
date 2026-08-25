import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PhoneInputCO from '@/presentation/ui/molecules/common/PhoneInputCO';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { AppConfigRepository, type IAppConfig } from '@/infrastructure/repositories/api/app-config/AppConfigRepository';
import type { IAuthenticatedUser, IAuthMeResp } from '@/application/dtos/auth/login/response/LoginResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { canAccessAdminPanel, isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';
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

  // ── Tiendas del usuario (notificaciones WA + instrucciones de pago) ──
  const isAdmin = user?.role === 'admin';
  const canManageStores = isAuthenticated() && canAccessAdminPanel();
  const [stores, setStores] = useState<IStore[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storeSaving, setStoreSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { apiKey: string; phone: string }>>({});
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, string>>({});

  // ── Control de acceso a la app (solo admin) ──
  const [appConfig, setAppConfig] = useState<IAppConfig | null>(null);
  const [blockMsg, setBlockMsg] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      try {
        const res: IAuthMeResp = await AuthRepository.getAuthenticatedUser();
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
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    void loadUser();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!canManageStores || !user) return;
    const loadStores = async () => {
      try {
        const res = await (isAdmin ? StoresRepository.getStores() : StoresRepository.getMyStores());
        setStores(res.data);
        const d: Record<string, { apiKey: string; phone: string }> = {};
        const p: Record<string, string> = {};
        res.data.forEach((s) => {
          d[s.id] = { apiKey: s.wppApiKey ?? '', phone: s.whatsappNumber ?? '' };
          p[s.id] = s.paymentInstructions ?? '';
        });
        setDrafts(d);
        setPaymentDrafts(p);
      } catch {
        SnackbarUtilities.error('No se pudieron cargar las tiendas');
      } finally {
        setStoresLoading(false);
      }
    };
    void loadStores();
  }, [canManageStores, isAdmin, user]);

  useEffect(() => {
    if (!isAdmin) return;
    const loadConfig = async () => {
      try {
        const cfg = await AppConfigRepository.getConfig();
        setAppConfig(cfg);
        setBlockMsg(cfg.blockedMessage ?? '');
      } catch {
        // non-fatal — admin block toggle just won't show current state
      }
    };
    void loadConfig();
  }, [isAdmin]);

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

  const toggleAppBlock = async () => {
    if (!appConfig) return;
    setSavingConfig(true);
    try {
      const updated = await AppConfigRepository.updateConfig({
        isAccessBlocked: !appConfig.isAccessBlocked,
        blockedMessage: blockMsg.trim() || null,
      });
      setAppConfig(updated);
      SnackbarUtilities.success(
        updated.isAccessBlocked ? 'App bloqueada — usuarios no pueden entrar' : 'App desbloqueada',
        'bottom', 'right',
      );
    } catch {
      SnackbarUtilities.error('No se pudo actualizar la configuración');
    } finally {
      setSavingConfig(false);
    }
  };

  const toggleWpp = async (store: IStore) => {
    setStoreSaving(store.id);
    try {
      const updated = await StoresRepository.updateStoreNotifications(store.id, {
        wppNotificationsEnabled: !store.wppNotificationsEnabled,
      });
      setStores((prev) => prev.map((s) => (s.id === store.id ? updated.data : s)));
      SnackbarUtilities.success(
        !store.wppNotificationsEnabled ? 'Notificaciones WA activadas' : 'Notificaciones WA desactivadas',
        'bottom', 'right',
      );
    } catch {
      SnackbarUtilities.error('No se pudo actualizar');
    } finally {
      setStoreSaving(null);
    }
  };

  const savePaymentInstructions = async (store: IStore) => {
    setStoreSaving(store.id + '_pay');
    try {
      const updated = await StoresRepository.updateStore(store.id, {
        paymentInstructions: paymentDrafts[store.id]?.trim() || null,
      });
      setStores((prev) => prev.map((s) => (s.id === store.id ? updated.data : s)));
      SnackbarUtilities.success('Instrucciones de pago guardadas', 'bottom', 'right');
    } catch {
      SnackbarUtilities.error('No se pudo guardar');
    } finally {
      setStoreSaving(null);
    }
  };

  const saveContact = async (store: IStore) => {
    setStoreSaving(store.id + '_save');
    try {
      const d = drafts[store.id];
      const updated = await StoresRepository.updateStoreNotifications(store.id, {
        wppApiKey: d.apiKey.trim() || undefined,
        whatsappNumber: d.phone.trim() || undefined,
      });
      setStores((prev) => prev.map((s) => (s.id === store.id ? updated.data : s)));
      SnackbarUtilities.success('Configuración guardada', 'bottom', 'right');
    } catch {
      SnackbarUtilities.error('No se pudo guardar');
    } finally {
      setStoreSaving(null);
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
          Administra tus datos personales, notificaciones y configuración de tu
          tienda.
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
        <>
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
                <span
                  className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${roleColor(user.role)}`}
                >
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
                  Tu cuenta de administrador no tiene un perfil de cliente
                  asociado. Los campos de nombre y teléfono no están
                  disponibles.
                </div>
              ) : (
                <form
                  onSubmit={e => {
                    void handleSubmit(e);
                  }}
                  className='space-y-5'
                >
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
                    <p className='text-[11px] text-slate-400'>
                      El correo no se puede cambiar desde aquí.
                    </p>
                  </div>

                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                      Teléfono
                    </label>
                    <PhoneInputCO
                      name='phone'
                      value={form.phone}
                      onChange={v =>
                        handleChange({
                          target: { name: 'phone', value: v }
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between border-t border-slate-100 pt-5'>
                    <button
                      type='button'
                      onClick={() => {
                        setForm({
                          firstName: user.customer?.firstName ?? '',
                          lastName: user.customer?.lastName ?? '',
                          phone: user.customer?.phone ?? ''
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

          {/* ── App Access Control (admin only) ── */}
          {isAdmin && appConfig ? (
            <div
              className={`rounded-[1.75rem] border p-6 shadow-sm ${appConfig.isAccessBlocked ? 'border-red-300 bg-red-50' : 'border-neutral-gray/20 bg-white'}`}
            >
              <div className='mb-5 flex items-center gap-3'>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${appConfig.isAccessBlocked ? 'bg-red-100' : 'bg-slate-100'}`}
                >
                  <i
                    className={`bx ${appConfig.isAccessBlocked ? 'bx-lock' : 'bx-lock-open'} text-xl ${appConfig.isAccessBlocked ? 'text-red-600' : 'text-slate-500'}`}
                    aria-hidden='true'
                  />
                </div>
                <div>
                  <h2 className='text-base font-semibold text-slate-800'>
                    Control de acceso a la app
                  </h2>
                  <p className='text-xs text-slate-500'>
                    {appConfig.isAccessBlocked
                      ? '⚠ La app está BLOQUEADA — los usuarios no pueden entrar (solo admins).'
                      : 'La app está abierta al público normalmente.'}
                  </p>
                </div>
              </div>

              <div className='space-y-3'>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Mensaje para el usuario (opcional)
                  </label>
                  <input
                    type='text'
                    value={blockMsg}
                    onChange={e => setBlockMsg(e.target.value)}
                    placeholder='Ej: Estamos en mantenimiento. Volvemos en 30 minutos.'
                    maxLength={300}
                    className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                  />
                </div>

                <button
                  type='button'
                  onClick={() => void toggleAppBlock()}
                  disabled={savingConfig}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50 ${
                    appConfig.isAccessBlocked
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {savingConfig ? (
                    <i className='bx bx-loader-alt animate-spin text-base' />
                  ) : (
                    <i
                      className={`bx ${appConfig.isAccessBlocked ? 'bx-lock-open' : 'bx-lock'} text-base`}
                    />
                  )}
                  {appConfig.isAccessBlocked
                    ? 'Desbloquear app'
                    : 'Bloquear acceso a la app'}
                </button>
              </div>
            </div>
          ) : null}

          {canManageStores ? (
            <>
              {/* WhatsApp panel */}
              <div className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
                <div className='mb-6 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-[#25D366]/10'>
                    <i
                      className='bx bxl-whatsapp text-xl text-[#25D366]'
                      aria-hidden='true'
                    />
                  </div>
                  <div>
                    <h2 className='text-base font-semibold text-slate-800'>
                      Notificaciones por WhatsApp
                    </h2>
                    <p className='text-xs text-slate-500'>
                      Recibe un mensaje en tu WhatsApp cuando llegue un nuevo
                      pedido.
                    </p>
                  </div>
                </div>

                {/* Instrucciones CallMeBot */}
                <details className='mb-5 rounded-2xl border border-amber-200 bg-amber-50'>
                  <summary className='cursor-pointer px-4 py-3 text-sm font-semibold text-amber-800 select-none'>
                    ¿Cómo obtener tu API Key?{' '}
                    <span className='font-normal'>(ver instrucciones)</span>
                  </summary>
                  <ol className='px-4 pb-4 pt-1 text-xs text-amber-700 list-decimal space-y-1.5 pl-8'>
                    <li>
                      Abre WhatsApp y busca el número{' '}
                      <strong>+34 623 91 22 04</strong> (CallMeBot).
                    </li>
                    <li>
                      Envía exactamente este mensaje:{' '}
                      <strong>«I allow callmebot to send me messages»</strong>
                    </li>
                    <li>
                      En pocos segundos recibirás tu <strong>API Key</strong>{' '}
                      por WhatsApp.
                    </li>
                    <li>
                      Copia esa key, pégala abajo junto a tu número y presiona{' '}
                      <strong>Guardar</strong>.
                    </li>
                  </ol>
                </details>

                {storesLoading ? (
                  <div className='space-y-4'>
                    {[1, 2].map(i => (
                      <div key={i} className='h-28 skeleton rounded-2xl' />
                    ))}
                  </div>
                ) : stores.length === 0 ? (
                  <div className='flex flex-col items-center py-12 text-center'>
                    <i
                      className='bx bx-store mb-3 text-4xl text-slate-300'
                      aria-hidden='true'
                    />
                    <p className='font-semibold text-slate-500'>
                      No tienes tiendas asignadas
                    </p>
                    <p className='mt-1 text-xs text-slate-400'>
                      Pide al administrador que te asigne una tienda.
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {stores.map(store => (
                      <div
                        key={store.id}
                        className='rounded-2xl border border-slate-200 p-5 space-y-4'
                      >
                        {/* Store header + toggle */}
                        <div className='flex items-center justify-between gap-4'>
                          <div className='flex items-center gap-3'>
                            {store.logoUrl ? (
                              <img
                                src={store.logoUrl}
                                alt={store.name}
                                className='h-9 w-9 rounded-xl object-cover'
                              />
                            ) : (
                              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10'>
                                <i
                                  className='bx bx-store text-base text-primary'
                                  aria-hidden='true'
                                />
                              </div>
                            )}
                            <p className='text-sm font-semibold text-slate-800'>
                              {store.name}
                            </p>
                          </div>

                          <button
                            type='button'
                            onClick={() => void toggleWpp(store)}
                            disabled={storeSaving === store.id}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                              store.wppNotificationsEnabled
                                ? 'bg-[#25D366]'
                                : 'bg-slate-200'
                            }`}
                            aria-label={
                              store.wppNotificationsEnabled
                                ? 'Desactivar WA'
                                : 'Activar WA'
                            }
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                                store.wppNotificationsEnabled
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Phone + API Key — visible cuando está activado */}
                        {store.wppNotificationsEnabled ? (
                          <div className='space-y-2'>
                            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                              <div>
                                <label className='mb-1 block text-xs font-medium text-slate-500'>
                                  Número de WhatsApp
                                </label>
                                <input
                                  type='tel'
                                  placeholder='57300xxxxxxx'
                                  value={drafts[store.id]?.phone ?? ''}
                                  onChange={e =>
                                    setDrafts(d => ({
                                      ...d,
                                      [store.id]: {
                                        ...d[store.id],
                                        phone: e.target.value
                                      }
                                    }))
                                  }
                                  className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[#25D366]/40 focus:ring-2 focus:ring-[#25D366]/10'
                                />
                              </div>
                              <div>
                                <label className='mb-1 block text-xs font-medium text-slate-500'>
                                  API Key de CallMeBot
                                </label>
                                <input
                                  type='text'
                                  placeholder='La key que te envió CallMeBot'
                                  value={drafts[store.id]?.apiKey ?? ''}
                                  onChange={e =>
                                    setDrafts(d => ({
                                      ...d,
                                      [store.id]: {
                                        ...d[store.id],
                                        apiKey: e.target.value
                                      }
                                    }))
                                  }
                                  className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[#25D366]/40 focus:ring-2 focus:ring-[#25D366]/10'
                                />
                              </div>
                            </div>
                            <button
                              type='button'
                              onClick={() => void saveContact(store)}
                              disabled={storeSaving === store.id + '_save'}
                              className='flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
                            >
                              <i
                                className='bx bx-check text-base'
                                aria-hidden='true'
                              />
                              {storeSaving === store.id + '_save'
                                ? 'Guardando...'
                                : 'Guardar configuración'}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment instructions panel */}
              <div className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
                <div className='mb-6 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100'>
                    <i
                      className='bx bx-transfer-alt text-xl text-emerald-600'
                      aria-hidden='true'
                    />
                  </div>
                  <div>
                    <h2 className='text-base font-semibold text-slate-800'>
                      Instrucciones de pago
                    </h2>
                    <p className='text-xs text-slate-500'>
                      El cliente verá este texto luego de crear su pedido para
                      saber cómo transferirte.
                    </p>
                  </div>
                </div>

                {storesLoading ? (
                  <div className='space-y-4'>
                    {[1, 2].map(i => (
                      <div key={i} className='h-20 skeleton rounded-2xl' />
                    ))}
                  </div>
                ) : stores.length === 0 ? null : (
                  <div className='space-y-4'>
                    {stores.map(store => (
                      <div
                        key={store.id}
                        className='rounded-2xl border border-slate-200 p-5 space-y-3'
                      >
                        <div className='flex items-center gap-3'>
                          {store.logoUrl ? (
                            <img
                              src={store.logoUrl}
                              alt={store.name}
                              className='h-8 w-8 rounded-xl object-cover'
                            />
                          ) : (
                            <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10'>
                              <i
                                className='bx bx-store text-sm text-primary'
                                aria-hidden='true'
                              />
                            </div>
                          )}
                          <p className='text-sm font-semibold text-slate-800'>
                            {store.name}
                          </p>
                        </div>
                        <div>
                          <label className='mb-1.5 block text-xs font-medium text-slate-500'>
                            Datos de transferencia (Nequi, banco, etc.)
                          </label>
                          <textarea
                            rows={3}
                            placeholder={
                              'Ej:\nNequi: 300 123 4567 · Juan Pérez\nBancolombia cuenta ahorros: 123-456789-00'
                            }
                            value={paymentDrafts[store.id] ?? ''}
                            onChange={e =>
                              setPaymentDrafts(d => ({
                                ...d,
                                [store.id]: e.target.value
                              }))
                            }
                            className='w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-500 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100'
                          />
                        </div>
                        <button
                          type='button'
                          onClick={() => void savePaymentInstructions(store)}
                          disabled={storeSaving === store.id + '_pay'}
                          className='flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50'
                        >
                          <i
                            className='bx bx-check text-base'
                            aria-hidden='true'
                          />
                          {storeSaving === store.id + '_pay'
                            ? 'Guardando...'
                            : 'Guardar instrucciones'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </>
      )}
    </Box>
  );
};

export default ProfilePage;
