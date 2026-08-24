import { useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { formatThousands } from '@/shared/utils/formatThousands';

interface ProductRestockModalProps {
  product: IProduct;
  submitting: boolean;
  error: string | null;
  onConfirm: (payload: { quantity: number; unitCost?: number; batchCode?: string; expiresAt?: string }) => Promise<void>;
  onClose: () => void;
}

const ProductRestockModal = ({ product, submitting, error, onConfirm, onClose }: ProductRestockModalProps) => {
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState(product.cost ? String(product.cost) : '');
  const [batchCode, setBatchCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const qty = Number(quantity);
  const canSubmit = qty > 0 && (!product.isPerishable || Boolean(expiresAt));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onConfirm({
      quantity: qty,
      unitCost: unitCost ? Number(unitCost) : undefined,
      batchCode: batchCode.trim() || undefined,
      expiresAt: expiresAt || undefined,
    });
  };

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-neutral-dark/50 px-4 backdrop-blur-sm'
      onClick={!submitting ? onClose : undefined}
    >
      <div
        className='w-full max-w-md rounded-[1.75rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center gap-3 border-b border-neutral-gray/20 px-6 py-4'>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className='h-10 w-10 flex-shrink-0 rounded-xl object-cover' />
          ) : (
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-gray/15'>
              <i className='bx bx-package text-lg text-neutral-dark/40' aria-hidden='true' />
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <h2 className='truncate text-base font-bold text-neutral-dark'>Reabastecer</h2>
            <p className='truncate text-xs text-neutral-dark/50'>{product.name}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={submitting}
            className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-neutral-dark/50 hover:bg-neutral-gray/20 disabled:opacity-40'
          >
            <i className='bx bx-x text-xl' aria-hidden='true' />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className='space-y-4 p-6'>
          <div>
            <label className='mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide'>
              Cantidad que llegó <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              min='1'
              step='1'
              autoFocus
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder='Ej. 10'
              disabled={submitting}
              className='w-full rounded-xl border border-neutral-gray/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide'>Costo unitario</label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-sm text-slate-400'>$</span>
              <input
                type='text'
                inputMode='numeric'
                value={formatThousands(unitCost)}
                onChange={(e) => setUnitCost(e.target.value.replace(/\D/g, ''))}
                placeholder='0'
                disabled={submitting}
                className='w-full rounded-xl border border-neutral-gray/30 py-2.5 pl-7 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60'
              />
            </div>
          </div>

          <div>
            <label className='mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide'>Lote (opcional)</label>
            <input
              type='text'
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              placeholder='Ej. R57-240730'
              disabled={submitting}
              className='w-full rounded-xl border border-neutral-gray/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide'>
              Vencimiento {product.isPerishable ? <span className='text-red-500'>*</span> : '(opcional)'}
            </label>
            <input
              type='date'
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={submitting}
              className='w-full rounded-xl border border-neutral-gray/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60'
            />
            {product.isPerishable ? (
              <p className='mt-1 text-[11px] text-slate-400'>Este producto es perecedero — la fecha es obligatoria.</p>
            ) : null}
          </div>

          {error ? (
            <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600'>{error}</div>
          ) : null}

          <div className='flex items-center justify-end gap-2 border-t border-slate-100 pt-4'>
            <Button type='button' variant='outline' onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type='submit' variant='primary' disabled={submitting || !canSubmit}>
              {submitting ? 'Guardando...' : 'Confirmar ingreso'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default ProductRestockModal;
