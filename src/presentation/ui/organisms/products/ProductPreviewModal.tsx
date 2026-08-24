import { createPortal } from 'react-dom';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface ProductPreviewModalProps {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  categoryName?: string;
  imageSrc: string | null;
  galleryPreviews: string[];
  videoCount: number;
  onClose: () => void;
}

const ProductPreviewModal = ({
  name,
  description,
  price,
  compareAtPrice,
  categoryName,
  imageSrc,
  galleryPreviews,
  videoCount,
  onClose,
}: ProductPreviewModalProps) => {
  const numericPrice = Number(price) || 0;
  const numericCompareAt = Number(compareAtPrice) || 0;
  const hasDiscount = numericCompareAt > numericPrice;

  return createPortal(
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-slate-100 px-5 py-3'>
          <p className='text-sm font-semibold text-slate-700'>Así se verá tu producto</p>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600'
            aria-label='Cerrar vista previa'
          >
            <i className='bx bx-x text-xl' aria-hidden='true' />
          </button>
        </div>

        <div className='aspect-square w-full bg-slate-100'>
          {imageSrc ? (
            <img src={imageSrc} alt={name || 'Vista previa del producto'} className='h-full w-full object-cover' />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-slate-300'>
              <i className='bx bx-image text-6xl' aria-hidden='true' />
            </div>
          )}
        </div>

        {galleryPreviews.length > 0 ? (
          <div className='flex gap-2 overflow-x-auto px-5 py-3'>
            {galleryPreviews.map((url, idx) => (
              <img key={idx} src={url} alt='' className='h-14 w-14 shrink-0 rounded-lg object-cover' />
            ))}
          </div>
        ) : null}

        <div className='space-y-2 px-5 py-4'>
          {categoryName ? (
            <span className='inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary'>
              {categoryName}
            </span>
          ) : null}

          <h2 className='text-lg font-bold text-slate-800'>{name || 'Nombre del producto'}</h2>

          <div className='flex items-baseline gap-2'>
            <span className='text-xl font-extrabold text-slate-900'>
              {formatCurrencyCOP(numericPrice)}
            </span>
            {hasDiscount ? (
              <span className='text-sm text-slate-400 line-through'>
                {formatCurrencyCOP(numericCompareAt)}
              </span>
            ) : null}
          </div>

          <p className='whitespace-pre-line text-sm text-slate-500'>
            {description || 'Sin descripción todavía.'}
          </p>

          {videoCount > 0 ? (
            <p className='flex items-center gap-1.5 text-xs font-medium text-slate-400'>
              <i className='bx bx-video text-sm' aria-hidden='true' />
              {videoCount} video{videoCount > 1 ? 's' : ''} incluido{videoCount > 1 ? 's' : ''}
            </p>
          ) : null}
        </div>

        <div className='border-t border-slate-100 px-5 py-3'>
          <Button type='button' variant='outline' fullWidth onClick={onClose}>
            Cerrar vista previa
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProductPreviewModal;
