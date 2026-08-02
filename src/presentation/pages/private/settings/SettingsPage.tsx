import { useEffect, useState } from 'react';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import { canAccessAdminPanel, getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { AppConfigRepository, type IAppConfig } from '@/infrastructure/repositories/api/app-config/AppConfigRepository';

const SettingsPage = () => {
  const isAdmin = getAuthenticatedRole() === 'admin';
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { apiKey: string; phone: string }>>({});
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, string>>({});
  const [appConfig, setAppConfig] = useState<IAppConfig | null>(null);
  const [blockMsg, setBlockMsg] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      AppConfigRepository.getConfig()
        .then((cfg) => { setAppConfig(cfg); setBlockMsg(cfg.blockedMessage ?? ''); })
        .catch(() => {});
    }
  }, [isAdmin]);

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

  useEffect(() => {
    if (!canAccessAdminPanel()) return;
    const fetch = isAdmin
      ? StoresRepository.getStores()
      : StoresRepository.getMyStores();

    fetch
      .then((res) => {
        setStores(res.data);
        const d: Record<string, { apiKey: string; phone: string }> = {};
        const p: Record<string, string> = {};
        res.data.forEach((s) => {
          d[s.id] = { apiKey: s.wppApiKey ?? '', phone: s.whatsappNumber ?? '' };
          p[s.id] = s.paymentInstructions ?? '';
        });
        setDrafts(d);
        setPaymentDrafts(p);
      })
      .catch(() => SnackbarUtilities.error('No se pudieron cargar las tiendas'))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const toggleWpp = async (store: IStore) => {
    setSaving(store.id);
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
      setSaving(null);
    }
  };

  const savePaymentInstructions = async (store: IStore) => {
    setSaving(store.id + '_pay');
    try {
      const updated = await StoresRepository.updateStore(store.id, {
        paymentInstructions: paymentDrafts[store.id]?.trim() || null,
      });
      setStores((prev) => prev.map((s) => (s.id === store.id ? updated.data : s)));
      SnackbarUtilities.success('Instrucciones de pago guardadas', 'bottom', 'right');
    } catch {
      SnackbarUtilities.error('No se pudo guardar');
    } finally {
      setSaving(null);
    }
  };

  const saveContact = async (store: IStore) => {
    setSaving(store.id + '_save');
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
      setSaving(null);
    }
  };

  return (
    <div className='space-y-6 animate-fade-up'>
      {/* Header */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-lg sm:px-10'>
        <div className='pointer-events-none absolute inset-0 opacity-10' aria-hidden='true' />
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Configuración</p>
        <h1 className='mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl'>Ajustes</h1>
        <p className='mt-2 text-sm text-white/70'>
          {isAdmin ? 'Gestiona las notificaciones de todas las tiendas.' : 'Configura las notificaciones de tu tienda.'}
        </p>
      </div>

      {/* ── App Access Control (admin only) ── */}
      {isAdmin && appConfig ? (
        <div className={`rounded-3xl border p-6 shadow-sm ${appConfig.isAccessBlocked ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
          <div className='mb-5 flex items-center gap-3'>
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${appConfig.isAccessBlocked ? 'bg-red-100' : 'bg-slate-100'}`}>
              <i className={`bx ${appConfig.isAccessBlocked ? 'bx-lock' : 'bx-lock-open'} text-xl ${appConfig.isAccessBlocked ? 'text-red-600' : 'text-slate-500'}`} aria-hidden='true' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-slate-800'>Control de acceso a la app</h2>
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
                onChange={(e) => setBlockMsg(e.target.value)}
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
                <i className={`bx ${appConfig.isAccessBlocked ? 'bx-lock-open' : 'bx-lock'} text-base`} />
              )}
              {appConfig.isAccessBlocked ? 'Desbloquear app' : 'Bloquear acceso a la app'}
            </button>
          </div>
        </div>
      ) : null}

      {/* WhatsApp panel */}
      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-[#25D366]/10'>
            <i className='bx bxl-whatsapp text-xl text-[#25D366]' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-base font-semibold text-slate-800'>Notificaciones por WhatsApp</h2>
            <p className='text-xs text-slate-500'>Recibe un mensaje en tu WhatsApp cuando llegue un nuevo pedido.</p>
          </div>
        </div>

        {/* Instrucciones CallMeBot */}
        <details className='mb-5 rounded-2xl border border-amber-200 bg-amber-50'>
          <summary className='cursor-pointer px-4 py-3 text-sm font-semibold text-amber-800 select-none'>
            ¿Cómo obtener tu API Key? <span className='font-normal'>(ver instrucciones)</span>
          </summary>
          <ol className='px-4 pb-4 pt-1 text-xs text-amber-700 list-decimal space-y-1.5 pl-8'>
            <li>Abre WhatsApp y busca el número <strong>+34 644 59 72 87</strong> (CallMeBot).</li>
            <li>Envía exactamente este mensaje: <strong>«I allow callmebot to send me messages»</strong></li>
            <li>En pocos segundos recibirás tu <strong>API Key</strong> por WhatsApp.</li>
            <li>Copia esa key, pégala abajo junto a tu número y presiona <strong>Guardar</strong>.</li>
          </ol>
        </details>

        {loading ? (
          <div className='space-y-4'>
            {[1, 2].map((i) => <div key={i} className='h-28 skeleton rounded-2xl' />)}
          </div>
        ) : stores.length === 0 ? (
          <div className='flex flex-col items-center py-12 text-center'>
            <i className='bx bx-store mb-3 text-4xl text-slate-300' aria-hidden='true' />
            <p className='font-semibold text-slate-500'>No tienes tiendas asignadas</p>
            <p className='mt-1 text-xs text-slate-400'>Pide al administrador que te asigne una tienda.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {stores.map((store) => (
              <div key={store.id} className='rounded-2xl border border-slate-200 p-5 space-y-4'>
                {/* Store header + toggle */}
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    {store.logoUrl ? (
                      <img src={store.logoUrl} alt={store.name} className='h-9 w-9 rounded-xl object-cover' />
                    ) : (
                      <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10'>
                        <i className='bx bx-store text-base text-primary' aria-hidden='true' />
                      </div>
                    )}
                    <p className='text-sm font-semibold text-slate-800'>{store.name}</p>
                  </div>

                  <button
                    type='button'
                    onClick={() => void toggleWpp(store)}
                    disabled={saving === store.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                      store.wppNotificationsEnabled ? 'bg-[#25D366]' : 'bg-slate-200'
                    }`}
                    aria-label={store.wppNotificationsEnabled ? 'Desactivar WA' : 'Activar WA'}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      store.wppNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Phone + API Key — visible cuando está activado */}
                {store.wppNotificationsEnabled ? (
                  <div className='space-y-2'>
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                      <div>
                        <label className='mb-1 block text-xs font-medium text-slate-500'>Número de WhatsApp</label>
                        <input
                          type='tel'
                          placeholder='57300xxxxxxx'
                          value={drafts[store.id]?.phone ?? ''}
                          onChange={(e) => setDrafts((d) => ({ ...d, [store.id]: { ...d[store.id], phone: e.target.value } }))}
                          className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[#25D366]/40 focus:ring-2 focus:ring-[#25D366]/10'
                        />
                      </div>
                      <div>
                        <label className='mb-1 block text-xs font-medium text-slate-500'>API Key de CallMeBot</label>
                        <input
                          type='text'
                          placeholder='La key que te envió CallMeBot'
                          value={drafts[store.id]?.apiKey ?? ''}
                          onChange={(e) => setDrafts((d) => ({ ...d, [store.id]: { ...d[store.id], apiKey: e.target.value } }))}
                          className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[#25D366]/40 focus:ring-2 focus:ring-[#25D366]/10'
                        />
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={() => void saveContact(store)}
                      disabled={saving === store.id + '_save'}
                      className='flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
                    >
                      <i className='bx bx-check text-base' aria-hidden='true' />
                      {saving === store.id + '_save' ? 'Guardando...' : 'Guardar configuración'}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Payment instructions panel */}
      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100'>
            <i className='bx bx-transfer-alt text-xl text-emerald-600' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-base font-semibold text-slate-800'>Instrucciones de pago</h2>
            <p className='text-xs text-slate-500'>
              El cliente verá este texto luego de crear su pedido para saber cómo transferirte.
            </p>
          </div>
        </div>

        {loading ? (
          <div className='space-y-4'>
            {[1, 2].map((i) => <div key={i} className='h-20 skeleton rounded-2xl' />)}
          </div>
        ) : stores.length === 0 ? null : (
          <div className='space-y-4'>
            {stores.map((store) => (
              <div key={store.id} className='rounded-2xl border border-slate-200 p-5 space-y-3'>
                <div className='flex items-center gap-3'>
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={store.name} className='h-8 w-8 rounded-xl object-cover' />
                  ) : (
                    <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10'>
                      <i className='bx bx-store text-sm text-primary' aria-hidden='true' />
                    </div>
                  )}
                  <p className='text-sm font-semibold text-slate-800'>{store.name}</p>
                </div>
                <div>
                  <label className='mb-1.5 block text-xs font-medium text-slate-500'>
                    Datos de transferencia (Nequi, banco, etc.)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={'Ej:\nNequi: 300 123 4567 · Juan Pérez\nBancolombia cuenta ahorros: 123-456789-00'}
                    value={paymentDrafts[store.id] ?? ''}
                    onChange={(e) => setPaymentDrafts((d) => ({ ...d, [store.id]: e.target.value }))}
                    className='w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100'
                  />
                </div>
                <button
                  type='button'
                  onClick={() => void savePaymentInstructions(store)}
                  disabled={saving === store.id + '_pay'}
                  className='flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50'
                >
                  <i className='bx bx-check text-base' aria-hidden='true' />
                  {saving === store.id + '_pay' ? 'Guardando...' : 'Guardar instrucciones'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
