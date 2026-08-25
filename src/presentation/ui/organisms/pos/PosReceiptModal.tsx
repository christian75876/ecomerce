import { ISale } from '@/application/dtos/sales/response/SaleResponse';
import { PosGuestInfo } from '@/application/useCases/pos/usePosManagement';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { formatDate } from '@/shared/utils/formatDate';

interface Props {
  sale: ISale;
  guestInfo?: PosGuestInfo;
  onClose: () => void;
}

function buildWhatsAppText(sale: ISale, guest?: PosGuestInfo): string {
  const clientName = sale.customer
    ? `${sale.customer.firstName} ${sale.customer.lastName}`
    : guest?.name || '';

  const text = [
    `🧾 *Comprobante de Venta POS*`,
    sale.store?.name ? `📍 Tienda: ${sale.store.name}` : '',
    `📅 Fecha: ${formatDate(sale.createdAt)}`,
    `🔖 Ref: #${sale.id.slice(0, 8).toUpperCase()}`,
    `---`,
    ...sale.items.map(
      (item) =>
        `• ${item.product.name} ×${item.quantity} = ${formatCurrencyCOP(item.lineTotal)}`,
    ),
    `---`,
    `💰 *Total: ${formatCurrencyCOP(sale.total)}*`,
    `Método: ${sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Crédito'}`,
    clientName ? `👤 Cliente: ${clientName}` : '',
    guest?.doc ? `📄 Documento: ${guest.docType} ${guest.doc}` : '',
    guest?.phone ? `📱 Tel: ${guest.phone}` : '',
    guest?.deliveryType === 'SHIPPING' ? `\n🚚 *Envío a domicilio*` : '',
    guest?.deliveryType === 'SHIPPING' && guest.deliveryAddress ? `📍 Dirección: ${guest.deliveryAddress}` : '',
    guest?.deliveryType === 'SHIPPING' && guest.deliveryCity ? `🏙️ Ciudad: ${guest.deliveryCity}` : '',
    guest?.deliveryType === 'SHIPPING' && guest.deliveryNotes ? `📝 Notas: ${guest.deliveryNotes}` : '',
    guest?.deliveryType === 'LOCAL' ? `🏪 Retiro en local` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const phone = guest?.phone ? guest.phone.replace(/\D/g, '') : '';
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

export const PosReceiptModal = ({ sale, guestInfo, onClose }: Props) => {
  const handlePrint = () => window.print();
  const handleWhatsApp = () => window.open(buildWhatsAppText(sale, guestInfo), '_blank');

  return (
    <>
      {/*
        Print strategy: body * visibility:hidden hides everything.
        #pos-receipt-content overrides with visibility:visible.
        position:fixed places it at the top of the printed page.
        Buttons use print:hidden so they're excluded from print.
      */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #pos-receipt-content,
          #pos-receipt-content * { visibility: visible; }
          #pos-receipt-content {
            position: fixed;
            top: 0;
            left: 0;
            width: 80mm;
            background: white;
            padding: 16px;
          }
        }
      `}</style>

      {/* Overlay — position:fixed covers viewport; hidden during print via visibility:hidden */}
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
        <div className='w-full max-w-xs rounded-2xl bg-white shadow-2xl'>

          {/* Receipt content — this block becomes visible during print */}
          <div id='pos-receipt-content' className='p-6'>
            <div className='mb-4 text-center'>
              {sale.store?.name && (
                <p className='text-lg font-bold text-slate-800'>{sale.store.name}</p>
              )}
              <p className='mt-0.5 text-xs text-slate-500'>Comprobante de venta POS</p>
              <p className='mt-1 font-mono text-xs text-slate-400'>
                #{sale.id.slice(0, 8).toUpperCase()}
              </p>
              <p className='mt-1 text-xs text-slate-500'>{formatDate(sale.createdAt)}</p>
            </div>

            <div className='my-3 border-t border-dashed border-slate-200' />

            <div className='space-y-2.5'>
              {sale.items.map((item, idx) => (
                <div key={item.id || idx} className='flex justify-between text-sm'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-medium text-slate-800'>{item.product.name}</p>
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

            <div className='my-3 border-t border-dashed border-slate-200' />

            <div className='flex justify-between font-bold text-slate-800'>
              <span>Total</span>
              <span>{formatCurrencyCOP(sale.total)}</span>
            </div>
            <div className='mt-1 flex justify-between text-xs text-slate-500'>
              <span>Método de pago</span>
              <span>{sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Crédito'}</span>
            </div>

            {(sale.customer || guestInfo?.name || guestInfo?.phone || guestInfo?.doc) && (
              <div className='mt-2 space-y-0.5 text-xs text-slate-500'>
                {sale.customer && (
                  <p>Cliente: {sale.customer.firstName} {sale.customer.lastName}</p>
                )}
                {!sale.customer && guestInfo?.name && <p>Cliente: {guestInfo.name}</p>}
                {guestInfo?.doc && (
                  <p>Documento: {guestInfo.docType} {guestInfo.doc}</p>
                )}
                {guestInfo?.phone && <p>Teléfono: {guestInfo.phone}</p>}
              </div>
            )}

            {/* Shipping guide — shown only when delivery type is SHIPPING */}
            {guestInfo?.deliveryType === 'SHIPPING' && (
              <>
                <div className='my-3 border-t-2 border-dashed border-slate-800' />
                <div className='rounded border border-slate-300 p-3'>
                  <p className='mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-slate-700'>
                    Guía de Envío
                  </p>
                  <div className='space-y-1 text-xs text-slate-700'>
                    <p><span className='font-semibold'>Destinatario:</span> {guestInfo.name || '—'}</p>
                    {guestInfo.doc && (
                      <p><span className='font-semibold'>Doc:</span> {guestInfo.docType} {guestInfo.doc}</p>
                    )}
                    {guestInfo.phone && (
                      <p><span className='font-semibold'>Tel:</span> {guestInfo.phone}</p>
                    )}
                    {guestInfo.deliveryAddress && (
                      <p><span className='font-semibold'>Dirección:</span> {guestInfo.deliveryAddress}</p>
                    )}
                    {guestInfo.deliveryCity && (
                      <p><span className='font-semibold'>Ciudad:</span> {guestInfo.deliveryCity}</p>
                    )}
                    {guestInfo.deliveryNotes && (
                      <p><span className='font-semibold'>Notas:</span> {guestInfo.deliveryNotes}</p>
                    )}
                  </div>
                  <p className='mt-2 text-center text-[9px] uppercase tracking-wider text-slate-400'>
                    Venta por ecommerce · {sale.store?.name ?? ''}
                  </p>
                </div>
              </>
            )}

            <p className='mt-5 text-center text-[10px] text-slate-400'>¡Gracias por su compra!</p>
          </div>

          {/* Action buttons — hidden during print */}
          <div className='flex flex-col gap-2 px-6 pb-6 print:hidden'>
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
                className='flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-whatsapp/30 bg-whatsapp/10 px-4 py-2.5 text-sm font-semibold text-whatsapp-dark transition hover:bg-whatsapp/15'
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
