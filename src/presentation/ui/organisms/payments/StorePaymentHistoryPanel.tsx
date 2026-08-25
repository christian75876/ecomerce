import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SubscriptionsRepository } from '@/infrastructure/repositories/api/subscriptions/SubscriptionsRepository';
import { AdvertisingRepository } from '@/infrastructure/repositories/api/advertising/AdvertisingRepository';
import type { IStoreSubscription } from '@/application/dtos/subscriptions/SubscriptionResponse';
import type { IStoreAdvertisement } from '@/application/dtos/advertising/AdvertisingResponse';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
}

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  OTHER: 'Otro',
};

const SUB_STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE:    { label: 'Activa',    cls: 'bg-emerald-100 text-emerald-700' },
  TRIAL:     { label: 'Prueba',    cls: 'bg-sky-100 text-sky-700'         },
  EXPIRED:   { label: 'Vencida',   cls: 'bg-red-100 text-red-600'         },
  CANCELLED: { label: 'Cancelada', cls: 'bg-slate-100 text-slate-500'     },
};

const AD_STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE:    { label: 'Activa',    cls: 'bg-amber-100 text-amber-700'  },
  EXPIRED:   { label: 'Vencida',   cls: 'bg-red-100 text-red-600'      },
  CANCELLED: { label: 'Cancelada', cls: 'bg-slate-100 text-slate-500'  },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <div className='space-y-3 px-6 py-4'>
    {[1, 2, 3].map((i) => <div key={i} className='h-16 skeleton rounded-2xl' />)}
  </div>
);

// ── Subscription row ──────────────────────────────────────────────────────────

const SubRow = ({ sub }: { sub: IStoreSubscription }) => {
  const st = SUB_STATUS[sub.status] ?? { label: sub.status, cls: 'bg-slate-100 text-slate-500' };
  return (
    <div className='flex flex-col gap-1.5 border-b border-slate-100 px-6 py-4 last:border-0'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-slate-800'>
            {sub.plan?.name ?? 'Plan sin nombre'}
          </p>
          <p className='mt-0.5 text-xs text-slate-500'>
            {fmtDate(sub.startDate)} → {fmtDate(sub.endDate)}
          </p>
        </div>
        <div className='flex flex-shrink-0 flex-col items-end gap-1'>
          <span className='text-sm font-bold text-slate-800'>
            {formatCurrencyCOP(sub.paidAmount)}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>
            {st.label}
          </span>
        </div>
      </div>
      <div className='flex items-center gap-3 text-xs text-slate-400'>
        <span>
          <i className='bx bx-money mr-1' aria-hidden='true' />
          {METHOD_LABEL[sub.paymentMethod] ?? sub.paymentMethod}
        </span>
        {sub.notes ? <span className='truncate italic'>"{sub.notes}"</span> : null}
      </div>
    </div>
  );
};

// ── Advertisement row ─────────────────────────────────────────────────────────

const AdRow = ({ ad }: { ad: IStoreAdvertisement }) => {
  const st = AD_STATUS[ad.status] ?? { label: ad.status, cls: 'bg-slate-100 text-slate-500' };
  const days = Math.ceil(
    (new Date(ad.endDate).getTime() - new Date(ad.startDate).getTime()) / 86400000,
  );
  return (
    <div className='flex flex-col gap-1.5 border-b border-slate-100 px-6 py-4 last:border-0'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-slate-800'>
            {days} {days === 1 ? 'día' : 'días'} de publicidad
          </p>
          <p className='mt-0.5 text-xs text-slate-500'>
            {fmtDate(ad.startDate)} → {fmtDate(ad.endDate)}
          </p>
        </div>
        <div className='flex flex-shrink-0 flex-col items-end gap-1'>
          <span className='text-sm font-bold text-slate-800'>
            {formatCurrencyCOP(ad.paidAmount)}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>
            {st.label}
          </span>
        </div>
      </div>
      <div className='flex items-center gap-3 text-xs text-slate-400'>
        <span>
          <i className='bx bx-money mr-1' aria-hidden='true' />
          {METHOD_LABEL[ad.paymentMethod] ?? ad.paymentMethod}
        </span>
        {ad.notes ? <span className='truncate italic'>"{ad.notes}"</span> : null}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

type Tab = 'subscriptions' | 'advertising';

interface Props {
  storeId: string;
  storeName: string;
  onClose: () => void;
}

const StorePaymentHistoryPanel = ({ storeId, storeName, onClose }: Props) => {
  const [tab, setTab] = useState<Tab>('subscriptions');
  const [subs, setSubs] = useState<IStoreSubscription[]>([]);
  const [ads, setAds] = useState<IStoreAdvertisement[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingAds, setLoadingAds] = useState(true);

  useEffect(() => {
    const loadSubs = async () => {
      setLoadingSubs(true);
      try {
        const r = await SubscriptionsRepository.getStoreSubscriptions(storeId);
        setSubs(r.data ?? []);
      } catch {
        setSubs([]);
      } finally {
        setLoadingSubs(false);
      }
    };
    const loadAds = async () => {
      setLoadingAds(true);
      try {
        const r = await AdvertisingRepository.getStoreAdvertisements(storeId);
        setAds(r.data ?? []);
      } catch {
        setAds([]);
      } finally {
        setLoadingAds(false);
      }
    };
    void loadSubs();
    void loadAds();
  }, [storeId]);

  const totalSubs = subs
    .filter((s) => s.status !== 'CANCELLED')
    .reduce((acc, s) => acc + s.paidAmount, 0);

  const totalAds = ads
    .filter((a) => a.status !== 'CANCELLED')
    .reduce((acc, a) => acc + a.paidAmount, 0);

  return createPortal(
    <div className='fixed inset-0 z-50 flex justify-end'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Panel */}
      <div className='relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-slate-100 px-6 py-5'>
          <div className='min-w-0'>
            <p className='text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
              Historial de pagos
            </p>
            <h2 className='mt-0.5 truncate text-lg font-bold text-slate-800'>{storeName}</h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          >
            <i className='bx bx-x text-xl' aria-hidden='true' />
          </button>
        </div>

        {/* Summary totals */}
        <div className='grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100'>
          <div className='px-6 py-4'>
            <p className='text-[10px] font-semibold uppercase tracking-wide text-slate-400'>
              Total suscripciones
            </p>
            <p className='mt-1 text-lg font-extrabold text-slate-800'>
              {loadingSubs ? '...' : formatCurrencyCOP(totalSubs)}
            </p>
            <p className='text-xs text-slate-400'>
              {loadingSubs ? '' : `${subs.length} registro${subs.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className='px-6 py-4'>
            <p className='text-[10px] font-semibold uppercase tracking-wide text-slate-400'>
              Total publicidad
            </p>
            <p className='mt-1 text-lg font-extrabold text-slate-800'>
              {loadingAds ? '...' : formatCurrencyCOP(totalAds)}
            </p>
            <p className='text-xs text-slate-400'>
              {loadingAds ? '' : `${ads.length} registro${ads.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-slate-100'>
          <button
            type='button'
            onClick={() => setTab('subscriptions')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
              tab === 'subscriptions'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <i className='bx bx-badge-check' aria-hidden='true' />
            Suscripciones
          </button>
          <button
            type='button'
            onClick={() => setTab('advertising')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
              tab === 'advertising'
                ? 'border-b-2 border-amber-500 text-amber-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <i className='bx bx-bulb' aria-hidden='true' />
            Publicidad
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          {tab === 'subscriptions' ? (
            loadingSubs ? (
              <RowSkeleton />
            ) : subs.length === 0 ? (
              <div className='flex flex-col items-center py-20 text-center'>
                <i className='bx bx-badge-check mb-3 text-5xl text-slate-200' aria-hidden='true' />
                <p className='font-semibold text-slate-400'>Sin suscripciones registradas</p>
                <p className='mt-1 text-sm text-slate-300'>Esta tienda aún no tiene pagos de suscripción.</p>
              </div>
            ) : (
              subs.map((s) => <SubRow key={s.id} sub={s} />)
            )
          ) : loadingAds ? (
            <RowSkeleton />
          ) : ads.length === 0 ? (
            <div className='flex flex-col items-center py-20 text-center'>
              <i className='bx bx-bulb mb-3 text-5xl text-slate-200' aria-hidden='true' />
              <p className='font-semibold text-slate-400'>Sin publicidad registrada</p>
              <p className='mt-1 text-sm text-slate-300'>Esta tienda aún no ha pagado publicidad.</p>
            </div>
          ) : (
            ads.map((a) => <AdRow key={a.id} ad={a} />)
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default StorePaymentHistoryPanel;
