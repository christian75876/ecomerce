import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderNotifications } from '@/shared/hooks/useOrderNotifications';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { ROUTES } from '@/shared/constants/routes';
import { canAccessAdminPanel } from '@/shared/utils/checkIsUserAuthenticated.util';

const AUTO_DISMISS_MS = 6000;

const NotificationToast = () => {
  const { latestNotification, dismissLatest, markRead } = useOrderNotifications();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!latestNotification) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(dismissLatest, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [latestNotification, dismissLatest]);

  if (!canAccessAdminPanel() || !latestNotification) return null;

  const n = latestNotification;

  const handleClick = () => {
    markRead(n.id);
    dismissLatest();
    navigate(ROUTES.PRIVATE.ORDERS);
  };

  return (
    <div className='fixed bottom-24 right-4 z-[9999] w-[320px] sm:bottom-6 sm:right-6 sm:w-[360px]'>
      <div
        role='alert'
        aria-live='assertive'
        className='flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_48px_rgba(15,23,42,0.18)]'
        style={{ animation: 'slideInRight 0.25s ease-out' }}
      >
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
          <i className='bx bx-receipt text-xl text-primary' aria-hidden='true' />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='text-sm font-semibold text-slate-800'>
            Nuevo pedido · {n.itemCount} {n.itemCount === 1 ? 'artículo' : 'artículos'}
          </p>
          <p className='truncate text-xs text-slate-500'>
            {n.customerName} · {formatCurrencyCOP(n.total)}
          </p>
          {n.deliveryMethod ? (
            <p className='mt-0.5 text-[11px] text-slate-400'>
              {n.deliveryMethod === 'DELIVERY' ? 'Domicilio' : 'Recogida en tienda'}
            </p>
          ) : null}
          <button
            type='button'
            onClick={handleClick}
            className='mt-2 text-xs font-semibold text-primary hover:underline'
          >
            Ver pedido →
          </button>
        </div>

        <button
          type='button'
          onClick={dismissLatest}
          aria-label='Cerrar'
          className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600'
        >
          <i className='bx bx-x text-base' aria-hidden='true' />
        </button>
      </div>

      {/* Progress bar */}
      <div className='mt-1 h-0.5 overflow-hidden rounded-full bg-slate-100'>
        <div
          className='h-full bg-primary'
          style={{ animation: `shrinkWidth ${AUTO_DISMISS_MS}ms linear forwards` }}
        />
      </div>
    </div>
  );
};

export default NotificationToast;
