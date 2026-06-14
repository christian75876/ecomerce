import { useEffect, useState } from 'react';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

const SettingsPage = () => {
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    StoresRepository.getStores()
      .then((res) => {
        setStores(res.data);
        const keys: Record<string, string> = {};
        res.data.forEach((s) => { keys[s.id] = s.wppApiKey ?? ''; });
        setApiKeys(keys);
      })
      .catch(() => SnackbarUtilities.error('No se pudieron cargar las tiendas'))
      .finally(() => setLoading(false));
  }, []);

  const toggleWpp = async (store: IStore) => {
    setSaving(store.id);
    try {
      const updated = await StoresRepository.updateStore(store.id, {
        wppNotificationsEnabled: !store.wppNotificationsEnabled,
      });
      setStores((prev) => prev.map((s) => (s.id === store.id ? updated.data : s)));
      SnackbarUtilities.success(
        !store.wppNotificationsEnabled
          ? 'Notificaciones WhatsApp activadas'
          : 'Notificaciones WhatsApp desactivadas',
        'bottom', 'right',
      );
    } catch {
      SnackbarUtilities.error('No se pudo actualizar la configuración');
    } finally {
      setSaving(null);
    }
  };

  const saveApiKey = async (store: IStore) => {
    setSaving(store.id + '_key');
    try {
      const updated = await StoresRepository.updateStore(store.id, {
        wppApiKey: apiKeys[store.id]?.trim() || undefined,
      });
      setStores((prev) => prev.map((s) => (s.id === store.id ? updated.data : s)));
      SnackbarUtilities.success('API Key guardada', 'bottom', 'right');
    } catch {
      SnackbarUtilities.error('No se pudo guardar la API Key');
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
        <p className='mt-2 text-sm text-white/70'>Gestiona las notificaciones y preferencias de cada tienda.</p>
      </div>

      {/* WhatsApp notifications */}
      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-[#25D366]/10'>
            <i className='bx bxl-whatsapp text-xl text-[#25D366]' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-base font-semibold text-slate-800'>Notificaciones por WhatsApp</h2>
            <p className='text-xs text-slate-500'>Recibe un mensaje al instante cuando llegue un nuevo pedido.</p>
          </div>
        </div>

        {/* CallMeBot instructions */}
        <div className='mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
          <p className='font-semibold'>¿Cómo activar?</p>
          <ol className='mt-1 list-decimal space-y-1 pl-4 text-xs'>
            <li>Envía el mensaje <strong>«I allow callmebot to send me messages»</strong> al número de WhatsApp <strong>+34 644 59 72 87</strong>.</li>
            <li>Recibirás tu <strong>API Key</strong> por WhatsApp en segundos.</li>
            <li>Pega esa key en el campo de abajo y presiona Guardar.</li>
          </ol>
        </div>

        {loading ? (
          <div className='space-y-4'>
            {[1, 2].map((i) => <div key={i} className='h-24 skeleton rounded-2xl' />)}
          </div>
        ) : stores.length === 0 ? (
          <p className='text-sm text-slate-400'>No hay tiendas registradas.</p>
        ) : (
          <div className='space-y-4'>
            {stores.map((store) => (
              <div key={store.id} className='rounded-2xl border border-slate-200 p-4'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    {store.logoUrl ? (
                      <img src={store.logoUrl} alt={store.name} className='h-9 w-9 rounded-xl object-cover' />
                    ) : (
                      <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10'>
                        <i className='bx bx-store text-base text-primary' aria-hidden='true' />
                      </div>
                    )}
                    <div>
                      <p className='text-sm font-semibold text-slate-800'>{store.name}</p>
                      <p className='text-xs text-slate-400'>{store.whatsappNumber ?? 'Sin número WA en la tienda'}</p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    type='button'
                    onClick={() => void toggleWpp(store)}
                    disabled={saving === store.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                      store.wppNotificationsEnabled ? 'bg-[#25D366]' : 'bg-slate-200'
                    }`}
                    aria-label={store.wppNotificationsEnabled ? 'Desactivar WA' : 'Activar WA'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        store.wppNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* API Key input — solo visible cuando está activado */}
                {store.wppNotificationsEnabled ? (
                  <div className='mt-3 flex gap-2'>
                    <input
                      type='text'
                      placeholder='API Key de CallMeBot'
                      value={apiKeys[store.id] ?? ''}
                      onChange={(e) => setApiKeys((k) => ({ ...k, [store.id]: e.target.value }))}
                      className='flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[#25D366]/40 focus:ring-2 focus:ring-[#25D366]/10'
                    />
                    <button
                      type='button'
                      onClick={() => void saveApiKey(store)}
                      disabled={saving === store.id + '_key'}
                      className='rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
                    >
                      {saving === store.id + '_key' ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
