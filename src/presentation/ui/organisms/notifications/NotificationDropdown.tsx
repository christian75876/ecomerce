import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrderNotifications } from '@/shared/hooks/useOrderNotifications';
import type {
  AdminNotification,
  NewOrderNotification,
  InvitationAcceptedNotification,
  UserRegisteredNotification,
} from '@/shared/contexts/OrderNotificationsContext';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { ROUTES } from '@/shared/constants/routes';
import clsx from 'clsx';

const PAGE_SIZE = 5;

const timeAgo = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Ahora mismo';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `Hace ${Math.floor(diff / 86400)} d`;
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

function MarkReadButton({ id, markRead }: { id: string; markRead: (id: string) => void }) {
  return (
    <button
      type='button'
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead(id); }}
      className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition hover:scale-110 hover:shadow-md'
      aria-label='Marcar como leída'
      title='Marcar como leída'
    >
      <i className='bx bx-check text-sm' aria-hidden='true' />
    </button>
  );
}

// ── Order card ──────────────────────────────────────────────────────────────
function OrderCard({
  n,
  onClose,
  markRead,
}: {
  n: NewOrderNotification;
  onClose: () => void;
  markRead: (id: string) => void;
}) {
  const isNew = !n.read;
  return (
    <Link
      to={`${ROUTES.PRIVATE.ORDERS}?order=${n.orderId}`}
      onClick={() => { markRead(n.id); onClose(); }}
      className={clsx(
        'group block border-b border-slate-100 px-4 py-3.5 transition-all last:border-0',
        isNew
          ? 'border-l-[3px] border-l-primary bg-primary/[0.05] hover:bg-primary/[0.08]'
          : 'border-l-[3px] border-l-transparent opacity-50 hover:opacity-75 hover:bg-slate-50',
      )}
    >
      <div className='flex items-start gap-3'>
        <div className={clsx(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          isNew ? 'bg-primary/15' : 'bg-slate-100',
        )}>
          <i className={clsx('bx bx-receipt text-lg', isNew ? 'text-primary' : 'text-slate-400')} />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-2'>
            <span className={clsx(
              'text-[11px] font-bold uppercase tracking-wide',
              isNew ? 'text-primary' : 'text-slate-400',
            )}>
              Nuevo pedido
            </span>
            <div className='flex shrink-0 items-center gap-2'>
              <span className='text-[11px] text-slate-400'>{timeAgo(n.createdAt)}</span>
              {isNew ? <MarkReadButton id={n.id} markRead={markRead} /> : null}
            </div>
          </div>

          <p className='mt-0.5 font-mono text-[11px] text-slate-400'>
            #{n.orderId.slice(0, 8).toUpperCase()}
          </p>

          <p className={clsx('mt-1 text-sm leading-snug', isNew ? 'font-semibold text-slate-800' : 'font-medium text-slate-500')}>
            {n.customerName}
          </p>
          <p className={clsx('text-sm font-bold', isNew ? 'text-primary' : 'text-slate-400')}>
            {formatCurrencyCOP(n.total)}
          </p>

          <div className='mt-1.5 flex flex-wrap gap-1.5'>
            <span className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600'>
              <i className='bx bx-package text-[11px]' />
              {n.itemCount} {n.itemCount === 1 ? 'artículo' : 'artículos'}
            </span>
            {n.deliveryMethod === 'DELIVERY' ? (
              <span className='inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700'>
                <i className='bx bx-car text-[11px]' />
                Domicilio
              </span>
            ) : n.deliveryMethod === 'PICKUP' ? (
              <span className='inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700'>
                <i className='bx bx-store text-[11px]' />
                Recogida en tienda
              </span>
            ) : (
              <span className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500'>
                <i className='bx bx-map text-[11px]' />
                Sin entrega especificada
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Invitation accepted card ─────────────────────────────────────────────────
function InvitationCard({
  n,
  onClose,
  markRead,
}: {
  n: InvitationAcceptedNotification;
  onClose: () => void;
  markRead: (id: string) => void;
}) {
  const isNew = !n.read;
  return (
    <Link
      to={ROUTES.PRIVATE.INVITATIONS}
      onClick={() => { markRead(n.id); onClose(); }}
      className={clsx(
        'group block border-b border-slate-100 px-4 py-3.5 transition-all last:border-0',
        isNew
          ? 'border-l-[3px] border-l-primary bg-primary/[0.05] hover:bg-primary/[0.08]'
          : 'border-l-[3px] border-l-transparent opacity-50 hover:opacity-75 hover:bg-slate-50',
      )}
    >
      <div className='flex items-start gap-3'>
        <div className={clsx('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', isNew ? 'bg-primary/15' : 'bg-slate-100')}>
          <i className={clsx('bx bx-store text-lg', isNew ? 'text-primary' : 'text-slate-400')} />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-2'>
            <span className={clsx('text-[11px] font-bold uppercase tracking-wide', isNew ? 'text-primary' : 'text-slate-400')}>
              Invitación aceptada
            </span>
            <div className='flex shrink-0 items-center gap-2'>
              <span className='text-[11px] text-slate-400'>{timeAgo(n.createdAt)}</span>
              {isNew ? <MarkReadButton id={n.id} markRead={markRead} /> : null}
            </div>
          </div>
          <p className={clsx('mt-1 text-sm', isNew ? 'font-semibold text-slate-800' : 'font-medium text-slate-500')}>
            {n.firstName} {n.lastName}
          </p>
          <p className='mt-0.5 text-xs text-slate-500'>{n.email}</p>
          <p className='mt-0.5 text-xs text-slate-400'>Tienda: {n.storeName}</p>
        </div>
      </div>
    </Link>
  );
}

// ── User registered card ─────────────────────────────────────────────────────
function UserCard({
  n,
  onClose,
  markRead,
}: {
  n: UserRegisteredNotification;
  onClose: () => void;
  markRead: (id: string) => void;
}) {
  const isNew = !n.read;
  return (
    <Link
      to={ROUTES.PRIVATE.CUSTOMERS}
      onClick={() => { markRead(n.id); onClose(); }}
      className={clsx(
        'group block border-b border-slate-100 px-4 py-3.5 transition-all last:border-0',
        isNew
          ? 'border-l-[3px] border-l-primary bg-primary/[0.05] hover:bg-primary/[0.08]'
          : 'border-l-[3px] border-l-transparent opacity-50 hover:opacity-75 hover:bg-slate-50',
      )}
    >
      <div className='flex items-start gap-3'>
        <div className={clsx('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', isNew ? 'bg-primary/15' : 'bg-slate-100')}>
          <i className={clsx('bx bx-user-plus text-lg', isNew ? 'text-primary' : 'text-slate-400')} />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-2'>
            <span className={clsx('text-[11px] font-bold uppercase tracking-wide', isNew ? 'text-primary' : 'text-slate-400')}>
              Nuevo usuario
            </span>
            <div className='flex shrink-0 items-center gap-2'>
              <span className='text-[11px] text-slate-400'>{timeAgo(n.createdAt)}</span>
              {isNew ? <MarkReadButton id={n.id} markRead={markRead} /> : null}
            </div>
          </div>
          <p className={clsx('mt-1 text-sm', isNew ? 'font-semibold text-slate-800' : 'font-medium text-slate-500')}>
            {n.firstName} {n.lastName}
          </p>
          <p className='mt-0.5 text-xs text-slate-500'>{n.email}</p>
        </div>
      </div>
    </Link>
  );
}

function NotificationCard({
  n,
  onClose,
  markRead,
}: {
  n: AdminNotification;
  onClose: () => void;
  markRead: (id: string) => void;
}) {
  if (n.type === 'new_order') return <OrderCard n={n as NewOrderNotification} onClose={onClose} markRead={markRead} />;
  if (n.type === 'invitation_accepted') return <InvitationCard n={n as InvitationAcceptedNotification} onClose={onClose} markRead={markRead} />;
  return <UserCard n={n as UserRegisteredNotification} onClose={onClose} markRead={markRead} />;
}

// ── Main dropdown ────────────────────────────────────────────────────────────
const NotificationDropdown = ({ dark = false, align = 'right' }: { dark?: boolean; align?: 'left' | 'right' }) => {
  const { notifications, unreadCount, markAllRead, markRead, connectionStatus } = useOrderNotifications();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = notifications.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [notifications.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const statusDot =
    connectionStatus === 'connected' ? 'bg-green-400' :
    connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-slate-400';

  const statusLabel =
    connectionStatus === 'connected' ? 'En línea' :
    connectionStatus === 'connecting' ? 'Conectando…' : 'Sin conexión';

  return (
    <div ref={ref} className='relative'>
      {/* Bell button */}
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition ${
          dark
            ? 'border-white/15 bg-white/10 text-white/70 hover:border-white/30 hover:bg-white/15 hover:text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary'
        }`}
        aria-label='Notificaciones'
      >
        <i className='bx bx-bell text-lg' aria-hidden='true' />
        {unreadCount > 0 ? (
          <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : (
          <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 ${dark ? 'border-white/10' : 'border-white'} ${statusDot}`} />
        )}
      </button>

      {/* Dropdown panel */}
      {open ? (
        <div className={`absolute top-[calc(100%+0.75rem)] z-50 w-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.14)] ${align === 'left' ? 'left-0' : 'right-0'}`}>

          {/* Header */}
          <div className='flex items-center justify-between border-b border-slate-100 px-4 py-3'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-slate-800'>Notificaciones</span>
              {notifications.length > 0 ? (
                <span className='rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500'>
                  {notifications.length}
                </span>
              ) : null}
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex items-center gap-1 text-[11px] text-slate-400'>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot}`} />
                {statusLabel}
              </span>
              {unreadCount > 0 ? (
                <button
                  type='button'
                  onClick={markAllRead}
                  className='text-xs font-medium text-primary hover:underline'
                >
                  Todo leído
                </button>
              ) : null}
            </div>
          </div>

          {/* Notification list */}
          <div className='divide-y divide-slate-50'>
            {notifications.length === 0 ? (
              <div className='flex flex-col items-center py-10 text-center'>
                <i className='bx bx-bell-off mb-2 text-4xl text-slate-300' aria-hidden='true' />
                <p className='text-sm font-medium text-slate-400'>Sin notificaciones</p>
                <p className='mt-0.5 text-xs text-slate-300'>Los pedidos nuevos aparecerán aquí en tiempo real</p>
              </div>
            ) : (
              pageItems.map((n) => (
                <NotificationCard
                  key={n.id}
                  n={n}
                  onClose={() => setOpen(false)}
                  markRead={markRead}
                />
              ))
            )}
          </div>

          {/* Pagination footer */}
          {totalPages > 1 ? (
            <div className='flex items-center justify-between border-t border-slate-100 px-4 py-2.5'>
              <button
                type='button'
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
                className='flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30'
              >
                <i className='bx bx-chevron-left text-base' />
              </button>

              <span className='text-xs font-medium text-slate-500'>
                Página {safePage} de {totalPages}
                <span className='ml-1 text-slate-400'>· {notifications.length} notif.</span>
              </span>

              <button
                type='button'
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className='flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30'
              >
                <i className='bx bx-chevron-right text-base' />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default NotificationDropdown;
