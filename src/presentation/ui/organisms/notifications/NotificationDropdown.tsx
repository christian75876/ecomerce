import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrderNotifications } from '@/shared/hooks/useOrderNotifications';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { ROUTES } from '@/shared/constants/routes';
import clsx from 'clsx';

const timeAgo = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Ahora mismo';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
};

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAllRead, markRead } = useOrderNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        className='relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary/30 hover:text-primary'
        aria-label='Notificaciones'
      >
        <i className='bx bx-bell text-lg' aria-hidden='true' />
        {unreadCount > 0 ? (
          <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className='absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[340px] rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.14)]'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-slate-100 px-4 py-3'>
            <span className='text-sm font-semibold text-slate-800'>Notificaciones</span>
            {unreadCount > 0 ? (
              <button
                type='button'
                onClick={markAllRead}
                className='text-xs font-medium text-primary hover:underline'
              >
                Marcar todo como leído
              </button>
            ) : null}
          </div>

          {/* List */}
          <div className='max-h-[400px] overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='flex flex-col items-center py-10 text-center'>
                <i className='bx bx-bell-off mb-2 text-4xl text-slate-300' aria-hidden='true' />
                <p className='text-sm font-medium text-slate-400'>Sin notificaciones</p>
                <p className='mt-0.5 text-xs text-slate-300'>Los pedidos nuevos aparecerán aquí</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={ROUTES.PRIVATE.ORDERS}
                  onClick={() => { markRead(n.id); setOpen(false); }}
                  className={clsx(
                    'flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-0 hover:bg-slate-50',
                    !n.read && 'bg-primary/5',
                  )}
                >
                  <div className={clsx(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                    n.read ? 'bg-slate-100' : 'bg-primary/10',
                  )}>
                    <i className={clsx('bx bx-receipt text-base', n.read ? 'text-slate-400' : 'text-primary')} aria-hidden='true' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-semibold text-slate-800'>
                      Nuevo pedido · {n.itemCount} {n.itemCount === 1 ? 'artículo' : 'artículos'}
                    </p>
                    <p className='truncate text-xs text-slate-500'>{n.customerName} · {formatCurrencyCOP(n.total)}</p>
                    <p className='mt-0.5 text-[11px] text-slate-400'>{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read ? (
                    <span className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary' />
                  ) : null}
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationDropdown;
