import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { buildAssetUrl } from '@/shared/utils/buildAssetUrl';

const fallbackImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';

interface MenuItemRowProps {
  id: string;
  image: string | null;
  name: string;
  description?: string;
  price: string | number;
  compareAtPrice?: number | null;
  availableQuantity?: number;
  showStock?: boolean;
  isSponsored?: boolean;
  hasVariants?: boolean;
  primaryColor?: string;
  onAddToCart: () => void;
  onQuickView: () => void;
}

const MenuItemRow = ({
  id,
  image,
  name,
  description,
  price,
  compareAtPrice,
  availableQuantity,
  showStock = false,
  isSponsored = false,
  hasVariants = false,
  primaryColor,
  onAddToCart,
  onQuickView,
}: MenuItemRowProps) => {
  const navigate = useNavigate();
  const imgSrc = buildAssetUrl(image) ?? fallbackImage;
  const numPrice = Number(price);
  const isOutOfStock = availableQuantity === 0;
  const isLowStock = availableQuantity !== undefined && availableQuantity > 0 && availableQuantity <= 5;
  const hasDiscount = compareAtPrice != null && Number(compareAtPrice) > numPrice;
  const addToCartLabel = hasVariants ? 'Ver opciones' : 'Agregar';
  const customBtnStyle = primaryColor ? { backgroundColor: primaryColor } : undefined;

  const handleAddClick = () => {
    if (hasVariants) {
      navigate(ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', id));
    } else {
      onAddToCart();
    }
  };

  return (
    <div className='group flex gap-3 border-b border-dashed border-slate-200 py-4 last:border-0'>
      <button
        type='button'
        onClick={onQuickView}
        aria-label={`Ver ${name}`}
        className='block h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 p-0'
      >
        <img src={imgSrc} alt={name} className='h-full w-full object-cover' loading='lazy' />
      </button>

      <div className='min-w-0 flex-1'>
        {/* Nombre ······ precio, con línea punteada tipo carta de restaurante */}
        <div className='flex items-end gap-2'>
          <button
            type='button'
            onClick={onQuickView}
            className='truncate p-0 text-left font-serif text-[15px] font-semibold text-slate-800 transition-colors group-hover:text-primary'
          >
            {name}
          </button>
          <span className='mb-1.5 h-0 min-w-[1rem] flex-1 border-b border-dotted border-slate-300' aria-hidden='true' />
          <span className='inline-flex flex-shrink-0 items-baseline gap-1.5 whitespace-nowrap'>
            {hasDiscount ? (
              <span className='mr-1 text-xs font-medium text-slate-400 line-through'>
                {formatCurrencyCOP(compareAtPrice!)}
              </span>
            ) : null}
            <span className={`font-extrabold ${isOutOfStock ? 'text-slate-400' : 'text-accent'}`}>
              {formatCurrencyCOP(price)}
            </span>
          </span>
        </div>

        {description ? (
          <p className='mt-0.5 line-clamp-2 text-sm text-slate-500'>{description}</p>
        ) : null}

        <div className='mt-2 flex items-center gap-2'>
          {isSponsored ? (
            <span className='rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-amber-600'>
              Patrocinado
            </span>
          ) : null}
          {isOutOfStock ? (
            <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500'>
              Agotado
            </span>
          ) : showStock && isLowStock ? (
            <span className='rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600'>
              ¡Solo {availableQuantity} en stock!
            </span>
          ) : null}

          <button
            type='button'
            aria-label={`${addToCartLabel} ${name}`}
            onClick={handleAddClick}
            disabled={isOutOfStock}
            className='ml-auto flex h-7 items-center gap-1 rounded-full px-3 text-[11px] font-bold text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40'
            style={isOutOfStock ? undefined : customBtnStyle ?? { backgroundColor: '#6366f1' }}
          >
            <i className='bx bx-plus' style={{ fontSize: 12 }} aria-hidden='true' />
            {addToCartLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemRow;
