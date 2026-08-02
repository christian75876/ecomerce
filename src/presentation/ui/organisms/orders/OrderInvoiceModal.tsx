import type { IOrder } from '@/application/dtos/orders/response/OrderResponse';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { formatDate } from '@/shared/utils/formatDate';

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Pendiente',
  PAID:      'Pagado',
  PREPARING: 'En preparación',
  SHIPPED:   'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-600 border-amber-200',
  PAID:      'bg-blue-50 text-blue-600 border-blue-200',
  PREPARING: 'bg-violet-50 text-violet-600 border-violet-200',
  SHIPPED:   'bg-indigo-50 text-indigo-600 border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-500 border-red-200',
};

interface Props {
  order: IOrder;
  onClose: () => void;
}

function buildWhatsAppUrl(order: IOrder): string {
  const name = `${order.customer.firstName} ${order.customer.lastName}`;
  const isDelivery = order.deliveryMethod === 'DELIVERY';

  const lines = [
    `🧾 *Comprobante de Pedido*`,
    `📅 ${formatDate(order.createdAt)}`,
    `🔖 Pedido #${order.id.slice(0, 8).toUpperCase()}`,
    `👤 Cliente: ${name}`,
    order.customer.phone ? `📱 Tel: ${order.customer.phone}` : '',
    isDelivery ? `🚚 Entrega a domicilio` : `🏪 Retiro en tienda`,
    `---`,
    ...order.items.map(
      (i) => `• ${i.product?.name ?? 'Producto'} ×${i.quantity} = ${formatCurrencyCOP(i.lineTotal)}`,
    ),
    `---`,
    order.discountAmount > 0
      ? `Descuento${order.couponCode ? ` (${order.couponCode})` : ''}: -${formatCurrencyCOP(order.discountAmount)}`
      : '',
    `💰 *Total: ${formatCurrencyCOP(order.total)}*`,
    isDelivery && order.deliveryAddress
      ? `\n📍 Dirección: ${order.deliveryAddress}`
      : '',
    isDelivery && order.deliveryCity ? `🏙️ Ciudad: ${order.deliveryCity}` : '',
    isDelivery && order.deliveryDepartment ? `${order.deliveryDepartment}` : '',
    isDelivery && order.deliveryNotes ? `📝 Notas: ${order.deliveryNotes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const rawPhone = order.customer.phone?.replace(/\D/g, '') ?? '';
  const base = rawPhone ? `https://wa.me/${rawPhone}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(lines)}`;
}

export const OrderInvoiceModal = ({ order, onClose }: Props) => {
  const handlePrint = () => window.print();
  const handleWhatsApp = () => window.open(buildWhatsAppUrl(order), '_blank');

  const isDelivery = order.deliveryMethod === 'DELIVERY';
  const isPickup   = order.deliveryMethod === 'PICKUP';
  const statusColor = STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-500 border-slate-200';

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #order-invoice-content,
          #order-invoice-content * { visibility: visible; }
          #order-invoice-content {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            background: white;
            padding: 32px;
          }
        }
      `}</style>

      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
        <div className='flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl'>

          {/* Header — hidden when printing */}
          <div className='flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 print:hidden'>
            <h2 className='text-base font-semibold text-slate-800'>Comprobante de pedido</h2>
            <button
              type='button'
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100'
            >
              <i className='bx bx-x text-xl' />
            </button>
          </div>

          {/* Invoice body */}
          <div id='order-invoice-content' className='flex-1 overflow-y-auto p-6'>

            {/* Title + ref */}
            <div className='mb-5 text-center'>
              <p className='text-xl font-bold text-slate-800'>Comprobante de Pedido</p>
              <p className='mt-1 font-mono text-sm text-slate-500'>
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className='mt-1 text-xs text-slate-400'>{formatDate(order.createdAt)}</p>
              <span
                className={`mt-2 inline-block rounded-full border px-3 py-0.5 text-[11px] font-semibold ${statusColor}`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>

            <div className='my-4 border-t border-dashed border-slate-200' />

            {/* Customer */}
            <div className='mb-4'>
              <p className='mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Cliente
              </p>
              <div className='space-y-1 text-sm text-slate-700'>
                <p className='font-semibold'>
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className='flex items-center gap-1.5 text-xs text-slate-500'>
                  <i className='bx bx-envelope text-slate-400' />
                  {order.customer.email}
                </p>
                {order.customer.phone && (
                  <p className='flex items-center gap-1.5 text-xs text-slate-500'>
                    <i className='bx bxl-whatsapp text-green-500' />
                    {order.customer.phone}
                  </p>
                )}
              </div>
            </div>

            <div className='my-4 border-t border-dashed border-slate-200' />

            {/* Items */}
            <div className='mb-4'>
              <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Artículos
              </p>
              <div className='space-y-3'>
                {order.items.map((item) => (
                  <div key={item.id} className='flex justify-between text-sm'>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-medium text-slate-800'>
                        {item.product?.name ?? 'Producto'}
                      </p>
                      <p className='text-xs text-slate-400'>
                        {item.quantity} × {formatCurrencyCOP(item.unitPrice)}
                      </p>
                    </div>
                    <p className='ml-3 shrink-0 font-semibold text-slate-700'>
                      {formatCurrencyCOP(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className='my-4 border-t border-dashed border-slate-200' />

            {/* Totals */}
            {order.discountAmount > 0 && (
              <>
                <div className='flex justify-between text-sm text-slate-500'>
                  <span>Subtotal</span>
                  <span>{formatCurrencyCOP(Number(order.total) + order.discountAmount)}</span>
                </div>
                <div className='flex justify-between text-sm text-emerald-600'>
                  <span className='flex items-center gap-1'>
                    Descuento
                    {order.couponCode && (
                      <span className='ml-1 rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px]'>
                        {order.couponCode}
                      </span>
                    )}
                  </span>
                  <span>−{formatCurrencyCOP(order.discountAmount)}</span>
                </div>
                <div className='my-2 border-t border-slate-100' />
              </>
            )}
            <div className='flex items-center justify-between'>
              <span className='font-bold text-slate-800'>Total</span>
              <span className='text-lg font-bold text-slate-800'>
                {formatCurrencyCOP(order.total)}
              </span>
            </div>

            {/* Delivery — PICKUP */}
            {isPickup && (
              <>
                <div className='my-4 border-t border-dashed border-slate-200' />
                <div className='flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3'>
                  <i className='bx bx-store shrink-0 text-xl text-emerald-600' />
                  <div>
                    <p className='text-sm font-semibold text-emerald-700'>Retiro en tienda</p>
                    <p className='text-xs text-emerald-600'>
                      El cliente recogerá el pedido directamente en el local
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Delivery — SHIPPING GUIDE */}
            {isDelivery && (
              <>
                <div className='my-4 border-t-2 border-dashed border-slate-700' />
                <div className='rounded-xl border border-blue-200 bg-blue-50/60 p-4'>
                  <p className='mb-3 text-center text-[11px] font-bold uppercase tracking-widest text-blue-700'>
                    Guía de Envío
                  </p>
                  <div className='space-y-2 text-sm text-slate-700'>
                    <p className='font-semibold'>
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    {order.customer.phone && (
                      <p className='flex items-center gap-2 text-xs'>
                        <i className='bx bxl-whatsapp shrink-0 text-green-500' />
                        {order.customer.phone}
                      </p>
                    )}
                    {order.deliveryAddress && (
                      <p className='flex items-start gap-2 text-xs'>
                        <i className='bx bx-map-pin mt-0.5 shrink-0 text-blue-500' />
                        {order.deliveryAddress}
                      </p>
                    )}
                    {(order.deliveryCity || order.deliveryDepartment) && (
                      <p className='flex items-center gap-2 text-xs'>
                        <i className='bx bx-buildings shrink-0 text-slate-400' />
                        {[order.deliveryCity, order.deliveryDepartment].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {order.deliveryNotes && (
                      <p className='flex items-start gap-2 text-xs text-slate-500'>
                        <i className='bx bx-note mt-0.5 shrink-0' />
                        {order.deliveryNotes}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <p className='mt-6 text-center text-[10px] text-slate-400'>¡Gracias por tu compra!</p>
          </div>

          {/* Actions — hidden when printing */}
          <div className='flex shrink-0 flex-col gap-2 border-t border-slate-100 px-6 py-4 print:hidden'>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={handlePrint}
                className='flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
              >
                <i className='bx bx-printer text-base' />
                Imprimir
              </button>
              <button
                type='button'
                onClick={handleWhatsApp}
                className='flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100'
              >
                <i className='bx bxl-whatsapp text-base' />
                WhatsApp
              </button>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
