import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderNotifications } from '@/shared/hooks/useOrderNotifications';
import type { AdminNotification } from '@/shared/contexts/OrderNotificationsContext';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { ROUTES } from '@/shared/constants/routes';
import { canAccessAdminPanel } from '@/shared/utils/checkIsUserAuthenticated.util';

const AUTO_DISMISS_MS = 6000;

function toastContent(n: AdminNotification): { icon: string; title: string; subtitle: string; detail?: string; route: string } {
  if (n.type === 'new_order') {
    return {
      icon: 'bx-receipt',
      title: `Nuevo pedido · ${n.itemCount} ${n.itemCount === 1 ? 'artículo' : 'artículos'}`,
      subtitle: `${n.customerName} · ${formatCurrencyCOP(n.total)}`,
      detail: n.deliveryMethod ? (n.deliveryMethod === 'DELIVERY' ? 'Domicilio' : 'Recogida en tienda') : undefined,
      route: ROUTES.PRIVATE.ORDERS,
    };
  }
  if (n.type === 'invitation_accepted') {
    return {
      icon: 'bx-store',
      title: 'Invitación aceptada',
      subtitle: `${n.firstName} ${n.lastName}`,
      detail: `Tienda: ${n.storeName}`,
      route: ROUTES.PRIVATE.INVITATIONS,
    };
  }
  return {
    icon: 'bx-user-plus',
    title: 'Nuevo usuario registrado',
    subtitle: `${n.firstName} ${n.lastName}`,
    detail: n.email,
    route: ROUTES.PRIVATE.CUSTOMERS,
  };
}

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
  const { icon, title, subtitle, detail, route } = toastContent(n);

  const handleClick = () => {
    markRead(n.id);
    dismissLatest();
    navigate(route);
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
          <i className={`bx ${icon} text-xl text-primary`} aria-hidden='true' />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='text-sm font-semibold text-slate-800'>{title}</p>
          <p className='truncate text-xs text-slate-500'>{subtitle}</p>
          {detail ? <p className='mt-0.5 truncate text-[11px] text-slate-400'>{detail}</p> : null}
          <button
            type='button'
            onClick={handleClick}
            className='mt-2 text-xs font-semibold text-primary hover:underline'
          >
            Ver →
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
