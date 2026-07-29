import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMyOrders } from '@/application/useCases/orders/useMyOrders';
import { isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';
import { ROUTES } from '@/shared/constants/routes';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { formatDate } from '@/shared/utils/formatDate';
import type { IOrder } from '@/application/dtos/orders/response/OrderResponse';

const PAGE_SIZE = 5;

// ── Status config ─────────────────────────────────────────────────────────────

type Status = IOrder['status'];

const STATUS: Record<Status, { label: string; emoji: string; color: string; bg: string; border: string; step: number }> = {
  PENDING:   { label: 'Pendiente',       emoji: '⏳', color: '#92400e', bg: '#fffbeb', border: '#fde68a', step: 0 },
  PAID:      { label: 'Pagado',          emoji: '💳', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0', step: 1 },
  PREPARING: { label: 'En preparación', emoji: '🔧', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', step: 2 },
  SHIPPED:   { label: 'Enviado',         emoji: '🚚', color: '#5b21b6', bg: '#f5f3ff', border: '#ddd6fe', step: 3 },
  DELIVERED: { label: 'Entregado',       emoji: '📦', color: '#14532d', bg: '#dcfce7', border: '#86efac', step: 4 },
  CANCELLED: { label: 'Cancelado',       emoji: '✖',  color: '#991b1b', bg: '#fef2f2', border: '#fecaca', step: -1 },
};

const STEPS: Status[] = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'];

// ── Small components ──────────────────────────────────────────────────────────

const Badge = ({ status }: { status: Status }) => {
  const s = STATUS[status];
  return (
    <span
      className='inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold'
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {s.emoji} {s.label}
    </span>
  );
};

const ProductThumb = ({
  imageUrl,
  name,
  productId,
  size = 'sm',
}: {
  imageUrl: string | null;
  name: string;
  productId: string;
  size?: 'sm' | 'lg';
}) => {
  const dim = size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  const text = size === 'lg' ? 'text-xl' : 'text-sm';
  return (
    <Link
      to={ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', productId)}
      onClick={(e) => e.stopPropagation()}
      className={`${dim} shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 transition hover:opacity-80 hover:shadow-md`}
      title={name}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className='h-full w-full object-cover' />
      ) : (
        <span className={`flex h-full w-full items-center justify-center ${text}`}>🛍️</span>
      )}
    </Link>
  );
};

const DeliveryChip = ({ method }: { method: IOrder['deliveryMethod'] }) => {
  if (!method) return null;
  return (
    <span className='inline-flex items-center gap-1 text-xs text-slate-500'>
      <i className={`bx ${method === 'DELIVERY' ? 'bx-car' : 'bx-store'} text-sm`} />
      {method === 'DELIVERY' ? 'Domicilio' : 'Recoger en tienda'}
    </span>
  );
};

const StatusTimeline = ({ status }: { status: Status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className='flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3'>
        <span className='text-2xl'>✖</span>
        <div>
          <p className='font-semibold text-red-700'>Pedido cancelado</p>
          <p className='text-xs text-red-400'>Este pedido fue cancelado</p>
        </div>
      </div>
    );
  }
  const current = STATUS[status].step;
  // Formula: line goes from center of circle[0] to center of circle[last]
  // circle center = 1rem (half of w-8=2rem) from each edge → full line = calc(100% - 2rem)
  // progress width = progressFraction * full_line = calc(f*100% - f*2rem)
  const f = current / (STEPS.length - 1);

  return (
    <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4'>
      {/* ── Circles row — labels are in a separate row so their height never shifts the circles ── */}
      <div className='relative'>
        {/* Full track — z-0 keeps it behind the circles */}
        <div className='absolute left-4 right-4 top-4 z-0 h-0.5 -translate-y-1/2 bg-slate-200' />
        {/* Progress track — z-0 keeps it behind the circles */}
        <div
          className='absolute left-4 top-4 z-0 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500'
          style={{ width: `calc(${f * 100}% - ${f * 2}rem)` }}
        />
        <div className='relative flex justify-between'>
          {STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <div
                key={s}
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-all duration-300 ${
                  active
                    ? 'border-primary bg-primary text-white shadow-md shadow-primary/30'
                    : done
                    ? 'border-primary bg-white text-primary'
                    : 'border-slate-200 bg-white text-slate-300'
                }`}
              >
                {done
                  ? <i className='bx bx-check text-base font-bold' />
                  : <span className='text-xs'>{STATUS[s].emoji}</span>
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Labels row — completely separate, multi-line text here can't affect circle positions ── */}
      <div className='mt-2 flex justify-between'>
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <p
              key={s}
              className={`w-8 text-center text-[10px] font-medium leading-tight ${
                active ? 'text-primary' : done ? 'text-slate-500' : 'text-slate-300'
              }`}
            >
              {STATUS[s].label}
            </p>
          );
        })}
      </div>
    </div>
  );
};

const Skeleton = () => (
  <div className='animate-pulse space-y-3 p-4'>
    {[0, 1, 2].map((i) => (
      <div key={i} className='rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2'>
        <div className='flex justify-between'>
          <div className='h-4 w-28 rounded-full bg-slate-200' />
          <div className='h-5 w-20 rounded-full bg-slate-200' />
        </div>
        <div className='h-3 w-40 rounded-full bg-slate-100' />
        <div className='h-3 w-32 rounded-full bg-slate-100' />
      </div>
    ))}
  </div>
);

// ── Order list card ───────────────────────────────────────────────────────────

// ── Sync badge ────────────────────────────────────────────────────────────────

const SyncBadge = ({ lastUpdated, syncing }: { lastUpdated: Date | null; syncing: boolean }) => {
  const [label, setLabel] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const update = () => {
      if (!lastUpdated) { setLabel(''); return; }
      const secs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      setLabel(secs < 60 ? `hace ${secs}s` : `hace ${Math.floor(secs / 60)}min`);
    };
    update();
    timerRef.current = setInterval(update, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lastUpdated]);

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${syncing ? 'text-primary' : 'text-slate-400'}`}>
      <i className={`bx bx-refresh text-sm ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Sincronizando…' : label ? `Actualizado ${label}` : 'Actualizando cada 30s'}
    </span>
  );
};

// ── Order list card ───────────────────────────────────────────────────────────

const OrderCard = ({
  order,
  selected,
  isChanged,
  onClick,
}: {
  order: IOrder;
  selected: boolean;
  isChanged: boolean;
  onClick: () => void;
}) => {
  const items = order.items ?? [];
  const visibleItems = items.slice(0, 2);
  const extra = items.length - visibleItems.length;

  return (
    <button
      type='button'
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
        isChanged
          ? 'border-green-400 bg-green-50 shadow-md shadow-green-100 ring-2 ring-green-300/60'
          : selected
          ? 'border-primary/40 bg-primary/[0.04] shadow-sm'
          : 'border-slate-100 bg-white hover:border-primary/20 hover:shadow-sm'
      }`}
    >
      {/* Top row */}
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='font-semibold text-slate-800'>
            Pedido <span className='font-mono'>#{order.id.slice(0, 8).toUpperCase()}</span>
          </p>
          <div className='mt-1 flex flex-wrap items-center gap-2'>
            <span className='text-sm font-semibold text-slate-700'>{formatCurrencyCOP(order.total)}</span>
            <span className='text-slate-300 text-xs'>·</span>
            <span className='text-xs text-slate-400'>{formatDate(order.createdAt)}</span>
          </div>
        </div>
        <Badge status={order.status} />
      </div>

      {/* Products preview */}
      {visibleItems.length > 0 && (
        <div className='mt-3 space-y-1.5'>
          {visibleItems.map((item) => (
            <div key={item.id} className='flex items-center gap-2'>
              <ProductThumb
                imageUrl={item.product?.imageUrl ?? null}
                name={item.product?.name ?? 'Producto'}
                productId={item.productId}
                size='sm'
              />
              <p className='min-w-0 flex-1 truncate text-xs text-slate-600'>
                {item.product?.name ?? 'Producto'}{' '}
                <span className='text-slate-400'>×{item.quantity}</span>
              </p>
              <span className='shrink-0 text-xs font-medium text-slate-600'>{formatCurrencyCOP(item.lineTotal)}</span>
            </div>
          ))}
          {extra > 0 && (
            <p className='text-[11px] text-primary'>+{extra} artículo{extra !== 1 ? 's' : ''} más</p>
          )}
        </div>
      )}

      {/* Bottom row */}
      <div className='mt-3 flex items-center justify-between'>
        <DeliveryChip method={order.deliveryMethod} />
        <span className='flex items-center gap-1 text-[11px] font-medium text-primary'>
          Ver detalle <i className='bx bx-chevron-right' />
        </span>
      </div>
    </button>
  );
};

// ── Detail panel ─────────────────────────────────────────────────────────────

const DetailPanel = ({
  order,
  loading,
  error,
  onBack,
}: {
  order: IOrder | null;
  loading: boolean;
  error: string | null;
  onBack?: () => void;
}) => {
  const noSelection = !order && !loading && !error;

  return (
    <div className='flex flex-col rounded-[1.75rem] border border-slate-100 bg-white shadow-sm overflow-hidden'>
      <div className='flex items-center gap-3 border-b border-slate-100 px-5 py-4'>
        {onBack && (
          <button type='button' onClick={onBack} className='flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 lg:hidden'>
            <i className='bx bx-arrow-back text-lg' />
          </button>
        )}
        <h2 className='text-base font-semibold text-slate-800'>
          {order ? `Pedido #${order.id.slice(0, 8).toUpperCase()}` : 'Detalle del pedido'}
        </h2>
      </div>

      <div className='flex-1 overflow-y-auto p-5'>
        {noSelection && (
          <div className='flex flex-col items-center py-16 text-center'>
            <span className='mb-3 text-5xl'>🧾</span>
            <p className='font-semibold text-slate-600'>Selecciona un pedido</p>
            <p className='mt-1 text-sm text-slate-400'>para ver sus ítems y estado.</p>
          </div>
        )}

        {error && (
          <div className='flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600'>
            <i className='bx bx-error-circle text-lg shrink-0' />
            {error}
          </div>
        )}

        {loading && (
          <div className='space-y-3'>
            <div className='h-20 animate-pulse rounded-2xl bg-slate-100' />
            <div className='h-32 animate-pulse rounded-2xl bg-slate-50' />
            <div className='h-24 animate-pulse rounded-2xl bg-slate-50' />
          </div>
        )}

        {order && !loading && (
          <div className='space-y-5'>
            {/* Timeline */}
            <StatusTimeline status={order.status} />

            {/* Info grid */}
            <div className='grid grid-cols-2 gap-2'>
              <div className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3'>
                <p className='text-[11px] font-medium uppercase tracking-wide text-slate-400'>Total</p>
                <p className='mt-1 text-lg font-bold text-slate-800'>{formatCurrencyCOP(order.total)}</p>
              </div>
              <div className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3'>
                <p className='text-[11px] font-medium uppercase tracking-wide text-slate-400'>Estado</p>
                <p className='mt-1'><Badge status={order.status} /></p>
              </div>
              <div className='col-span-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3'>
                <p className='text-[11px] font-medium uppercase tracking-wide text-slate-400'>Fecha</p>
                <p className='mt-0.5 text-sm font-medium text-slate-700'>{formatDate(order.createdAt)}</p>
              </div>
              {order.deliveryMethod && (
                <div className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3'>
                  <p className='text-[11px] font-medium uppercase tracking-wide text-slate-400'>Entrega</p>
                  <p className='mt-1'><DeliveryChip method={order.deliveryMethod} /></p>
                </div>
              )}
              {order.deliveryAddress && (
                <div className={`rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 ${!order.deliveryMethod ? 'col-span-2' : ''}`}>
                  <p className='text-[11px] font-medium uppercase tracking-wide text-slate-400'>Dirección</p>
                  <p className='mt-0.5 text-xs text-slate-700'>
                    {order.deliveryAddress}{order.deliveryCity ? `, ${order.deliveryCity}` : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Products */}
            {order.items && order.items.length > 0 && (
              <div>
                <p className='mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400'>
                  Artículos ({order.items.length})
                </p>
                <div className='space-y-2'>
                  {order.items.map((item) => (
                    <div key={item.id} className='flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
                      <ProductThumb
                        imageUrl={item.product?.imageUrl ?? null}
                        name={item.product?.name ?? 'Producto'}
                        productId={item.productId}
                        size='lg'
                      />
                      <div className='min-w-0 flex-1'>
                        <Link
                          to={ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', item.productId)}
                          className='block truncate text-sm font-semibold text-slate-800 hover:text-primary hover:underline'
                        >
                          {item.product?.name ?? 'Producto'}
                        </Link>
                        <p className='text-xs text-slate-400'>
                          {item.quantity} unid. × {formatCurrencyCOP(item.unitPrice)}
                        </p>
                      </div>
                      <p className='shrink-0 text-sm font-bold text-slate-700'>
                        {formatCurrencyCOP(item.lineTotal)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total breakdown */}
                <div className='mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3'>
                  {order.discountAmount > 0 && (
                    <>
                      <div className='flex justify-between text-sm text-slate-500'>
                        <span>Subtotal</span>
                        <span>{formatCurrencyCOP(Number(order.total) + order.discountAmount)}</span>
                      </div>
                      <div className='flex justify-between text-sm text-green-600'>
                        <span>Descuento {order.couponCode && <span className='ml-1 rounded bg-green-100 px-1.5 text-[10px] font-mono'>{order.couponCode}</span>}</span>
                        <span>−{formatCurrencyCOP(order.discountAmount)}</span>
                      </div>
                      <div className='mt-2 border-t border-slate-200 pt-2' />
                    </>
                  )}
                  <div className='flex justify-between font-bold text-slate-800'>
                    <span>Total</span>
                    <span>{formatCurrencyCOP(order.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const MyOrdersPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, selectedOrder, loadingList, loadingDetail, listError, detailError, lastUpdated, syncing, changedOrderIds } = useMyOrders(orderId);
  const [page, setPage] = useState(1);

  if (!isAuthenticated()) return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageOrders = orders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectOrder = (id: string) => navigate(ROUTES.PUBLIC.MY_ORDER_DETAILS.replace(':orderId', id));
  const clearOrder  = () => navigate(ROUTES.PUBLIC.MY_ORDERS);

  // On mobile: if an order is selected show only detail, otherwise show list
  const showDetailOnly = !!orderId;

  return (
    <div className='space-y-6'>
      {/* Hero */}
      <div className='rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-6 py-10 shadow-sm'>
        <h1 className='text-3xl font-bold text-slate-800'>Mis pedidos</h1>
        <p className='mt-2 text-slate-500'>Revisa tu historial, estados e ítems comprados desde tu cuenta.</p>
        {orders.length > 0 && (
          <div className='mt-4 flex flex-wrap gap-3'>
            <span className='inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-blue-600 shadow-sm'>
              <i className='bx bx-receipt' /> {orders.length} pedido{orders.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className='grid gap-6 lg:grid-cols-[1fr_400px]'>

        {/* ── List column — hidden on mobile when detail is open ── */}
        <div className={showDetailOnly ? 'hidden lg:block' : 'block'}>
          <div className='rounded-[1.75rem] border border-slate-100 bg-white shadow-sm'>
            <div className='flex items-center justify-between border-b border-slate-100 px-5 py-4'>
              <div>
                <h2 className='text-base font-semibold text-slate-800'>Historial de compras</h2>
                {!loadingList && !listError && orders.length > 0 && (
                  <p className='mt-0.5 text-xs text-slate-400'>{orders.length} pedido{orders.length !== 1 ? 's' : ''} en total</p>
                )}
              </div>
              {!loadingList && (
                <SyncBadge lastUpdated={lastUpdated} syncing={syncing} />
              )}
            </div>

            {/* List body */}
            {listError ? (
              <div className='m-4 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600'>
                <i className='bx bx-error-circle text-lg shrink-0' />
                {listError}
              </div>
            ) : loadingList ? (
              <Skeleton />
            ) : orders.length === 0 ? (
              <div className='flex flex-col items-center py-16 text-center'>
                <span className='mb-3 text-5xl'>📦</span>
                <p className='font-semibold text-slate-700'>Sin pedidos aún</p>
                <p className='mt-1 text-sm text-slate-400 max-w-xs'>
                  Tus compras aparecerán aquí una vez que realices tu primer pedido.
                </p>
              </div>
            ) : (
              <div className='space-y-3 p-4'>
                {pageOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    selected={order.id === orderId}
                    isChanged={changedOrderIds.has(order.id)}
                    onClick={() => selectOrder(order.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between border-t border-slate-100 px-5 py-4'>
                <button
                  type='button'
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className='flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <i className='bx bx-chevron-left' /> Anterior
                </button>
                <span className='text-xs text-slate-400'>Pág. {safePage} / {totalPages}</span>
                <button
                  type='button'
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className='flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40'
                >
                  Siguiente <i className='bx bx-chevron-right' />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Detail column — full width on mobile when open ── */}
        <div className={!showDetailOnly ? 'hidden lg:block' : 'block'}>
          <DetailPanel
            order={selectedOrder}
            loading={loadingDetail}
            error={detailError}
            onBack={clearOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
