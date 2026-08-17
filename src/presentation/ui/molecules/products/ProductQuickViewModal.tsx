import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { buildAssetUrl } from '@/shared/utils/buildAssetUrl';

const fallbackImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';

interface ProductQuickViewModalProps {
  id: string;
  image: string | null;
  name: string;
  description?: string;
  price: string | number;
  compareAtPrice?: number | null;
  availableQuantity?: number;
  showStock?: boolean;
  primaryColor?: string;
  onClose: () => void;
  onAddToCart: () => void;
}

const ProductQuickViewModal = ({
  id,
  image,
  name,
  description,
  price,
  compareAtPrice,
  availableQuantity,
  showStock = false,
  primaryColor,
  onClose,
  onAddToCart,
}: ProductQuickViewModalProps) => {
  const imgSrc = buildAssetUrl(image) ?? fallbackImage;
  const numPrice = Number(price);
  const isOutOfStock = availableQuantity === 0;
  const isLowStock = availableQuantity !== undefined && availableQuantity > 0 && availableQuantity <= 5;
  const hasDiscount = compareAtPrice != null && Number(compareAtPrice) > numPrice;
  const customBtnStyle = primaryColor ? { backgroundColor: primaryColor } : undefined;

  return (
    <div
      className='fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4'
      onClick={onClose}
    >
      <div
        className='relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-float sm:rounded-3xl'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type='button'
          onClick={onClose}
          aria-label='Cerrar'
          className='absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-md transition hover:text-slate-800'
        >
          <i className='bx bx-x text-xl' aria-hidden='true' />
        </button>

        <div className='aspect-[4/3] w-full overflow-hidden bg-slate-50'>
          <img src={imgSrc} alt={name} className='h-full w-full object-cover' />
        </div>

        <div className='space-y-3 p-5'>
          <h3 className='text-lg font-bold text-slate-800'>{name}</h3>

          {description ? <p className='text-sm text-slate-500'>{description}</p> : null}

          <div className='flex items-center gap-2'>
            {hasDiscount ? (
              <span className='text-sm font-medium text-slate-400 line-through'>
                {formatCurrencyCOP(compareAtPrice!)}
              </span>
            ) : null}
            <span className={`text-2xl font-extrabold ${isOutOfStock ? 'text-slate-400' : 'text-accent'}`}>
              {formatCurrencyCOP(price)}
            </span>
          </div>

          {isOutOfStock ? (
            <span className='inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500'>
              Agotado
            </span>
          ) : showStock && isLowStock ? (
            <span className='inline-block rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600'>
              ¡Solo {availableQuantity} en stock!
            </span>
          ) : null}

          <div className='flex gap-2 pt-2'>
            <button
              type='button'
              onClick={onAddToCart}
              disabled={isOutOfStock}
              className='flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40'
              style={isOutOfStock ? undefined : customBtnStyle ?? { backgroundColor: '#6366f1' }}
            >
              <i className='bx bx-plus text-base' aria-hidden='true' />
              Agregar al carrito
            </button>
            <Link
              to={ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', id)}
              className='flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary'
            >
              Ver más
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewModal;
