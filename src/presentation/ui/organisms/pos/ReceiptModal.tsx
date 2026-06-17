import { useState } from 'react';
import { ISale } from '@/application/dtos/sales/response/SaleResponse';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface ReceiptModalProps {
  sale: ISale;
  onClose: () => void;
}

export const ReceiptModal = ({ sale, onClose }: ReceiptModalProps) => {
  const [phone, setPhone] = useState('');

  const date = new Date(sale.createdAt).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentLabel = sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Crédito';
  const total = formatCurrencyCOP(Number(sale.total));

  const buildWhatsAppMessage = () => {
    const lines = [
      '🧾 *Comprobante de compra*',
      `📅 ${date}`,
      '',
      ...sale.items.map(
        (item) => `• ${item.product.name} ×${item.quantity}  —  ${formatCurrencyCOP(item.lineTotal)}`,
      ),
      '',
      `💰 *Total: ${total}*`,
      `💳 ${paymentLabel}`,
      '',
      '¡Gracias por tu compra! 🙌',
    ];
    return lines.join('\n');
  };

  const handleWhatsApp = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return;
    const number = digits.startsWith('57') ? digits : `57${digits}`;
    const text = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/${number}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    const rows = sale.items
      .map(
        (item) =>
          `<tr>
            <td>${item.product.name}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">${formatCurrencyCOP(item.lineTotal)}</td>
          </tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Comprobante de compra</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; max-width: 320px; margin: 0 auto; padding: 24px 16px; font-size: 13px; color: #1e293b; }
    .header { text-align: center; margin-bottom: 16px; }
    .header h1 { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 11px; color: #64748b; }
    .divider { border: none; border-top: 1px dashed #cbd5e1; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; }
    thead th { text-align: left; font-size: 10px; color: #94a3b8; text-transform: uppercase; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3) { text-align: right; }
    tbody td { padding: 6px 0; border-bottom: 1px dashed #f1f5f9; font-size: 12px; }
    .total-row { margin-top: 12px; text-align: right; }
    .total-row .label { font-size: 11px; color: #64748b; }
    .total-row .amount { font-size: 17px; font-weight: 700; }
    .method { text-align: right; font-size: 11px; color: #64748b; margin-top: 4px; }
    .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧾 Comprobante de compra</h1>
    <p>${date}</p>
  </div>
  <hr class="divider"/>
  <table>
    <thead>
      <tr><th>Producto</th><th>Cant.</th><th>Total</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <hr class="divider"/>
  <div class="total-row">
    <p class="label">Total</p>
    <p class="amount">${total}</p>
  </div>
  <p class="method">${paymentLabel}</p>
  <p class="footer">¡Gracias por tu compra!</p>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=420,height=640');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center'>
      <div className='w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl'>

        {/* Header */}
        <div className='bg-green-50 px-6 py-5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500 shadow-sm'>
              <i className='bx bx-check text-2xl text-white' />
            </div>
            <div>
              <h3 className='text-lg font-bold text-slate-800'>¡Venta confirmada!</h3>
              <p className='text-xs text-slate-500'>
                {sale.items.length} producto{sale.items.length !== 1 ? 's' : ''} ·{' '}
                <span className='font-semibold text-green-600'>{total}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className='max-h-44 overflow-y-auto px-6 py-4'>
          <div className='space-y-2'>
            {sale.items.map((item) => (
              <div key={item.id} className='flex items-center justify-between gap-4'>
                <span className='flex-1 truncate text-sm text-slate-600'>
                  {item.product.name}
                  <span className='ml-1 text-slate-400'>×{item.quantity}</span>
                </span>
                <span className='shrink-0 text-sm font-semibold text-slate-700'>
                  {formatCurrencyCOP(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <div className='border-t border-slate-100 px-6 py-4'>
          <p className='mb-2.5 text-sm font-semibold text-slate-700'>
            <i className='bx bxl-whatsapp mr-1.5 text-green-500' />
            Enviar comprobante por WhatsApp
          </p>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <span className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400'>
                +57
              </span>
              <input
                type='tel'
                inputMode='numeric'
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder='300 123 4567'
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-400/20'
              />
            </div>
            <button
              type='button'
              onClick={handleWhatsApp}
              disabled={phone.replace(/\D/g, '').length < 10}
              className='flex items-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-600 active:scale-95 disabled:opacity-40'
            >
              <i className='bx bxl-whatsapp text-lg' />
              Enviar
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className='flex gap-2 border-t border-slate-100 px-6 py-4'>
          <button
            type='button'
            onClick={handlePrint}
            className='flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95'
          >
            <i className='bx bx-printer text-base' />
            Imprimir
          </button>
          <button
            type='button'
            onClick={onClose}
            className='flex flex-1 items-center justify-center rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-200 active:scale-95'
          >
            Omitir
          </button>
        </div>
      </div>
    </div>
  );
};
