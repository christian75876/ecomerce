import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { buildAssetUrl, buildResponsiveSrcSet, cloudinaryTransform } from '@/shared/utils/buildAssetUrl';

const RESPONSIVE_WIDTHS = [320, 480, 640, 960];
const CARD_IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px';

interface ProductCardProps {
  image: string | null;
  name: string;
  price: string | number;
  compareAtPrice?: number | null;
  availableQuantity?: number;
  showStock?: boolean;
  description?: string;
  id: string;
  storeName?: string;
  storeSlug?: string;
  badge?: string;
  averageRating?: number | null;
  reviewCount?: number;
  isSponsored?: boolean;
  isAdultContent?: boolean;
  layoutStyle?: 'GRID' | 'LIST';
  buttonStyle?: 'ROUNDED' | 'SHARP' | 'PILL';
  primaryColor?: string;
  onAddToCart: () => void;
  addToCartLabel?: string;
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='56' fill='%23cbd5e1'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E";

const btnRadiusClass = (style?: 'ROUNDED' | 'SHARP' | 'PILL') => {
  if (style === 'SHARP') return 'rounded-none';
  if (style === 'PILL') return 'rounded-full';
  return 'rounded-xl';
};

const ProductCard = ({
  image,
  name,
  price,
  compareAtPrice,
  availableQuantity,
  showStock = false,
  id,
  storeName,
  storeSlug,
  badge,
  averageRating,
  reviewCount,
  isSponsored = false,
  isAdultContent = false,
  layoutStyle = 'GRID',
  buttonStyle,
  primaryColor,
  onAddToCart,
  addToCartLabel = 'Agregar',
}: ProductCardProps) => {
  const resolvedImgUrl = image ? buildAssetUrl(image) : null;
  const imgSrc = resolvedImgUrl ? cloudinaryTransform(resolvedImgUrl, 'f_auto,q_auto,w_480') : PLACEHOLDER;
  const imgSrcSet = resolvedImgUrl ? buildResponsiveSrcSet(resolvedImgUrl, RESPONSIVE_WIDTHS) : undefined;
  const numPrice = Number(price);
  const isOutOfStock = availableQuantity === 0;
  const isLowStock = availableQuantity !== undefined && availableQuantity > 0 && availableQuantity <= 5;
  const hasDiscount = compareAtPrice != null && Number(compareAtPrice) > numPrice;
  const discountPct = hasDiscount
    ? Math.round(((Number(compareAtPrice) - numPrice) / Number(compareAtPrice)) * 100)
    : 0;
  const btnClass = btnRadiusClass(buttonStyle);
  const customBtnStyle = primaryColor ? { backgroundColor: primaryColor } : undefined;

  return (
    <article className={`group relative flex h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-250 ease-spring hover:-translate-y-1.5 hover:-rotate-1 hover:border-primary/25 hover:shadow-panel ${layoutStyle === 'LIST' ? 'flex-row hover:rotate-0' : 'flex-col'}`}>
      {/* ── Image ── */}
      <Link
        to={ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', id)}
        className={`block shrink-0 ${layoutStyle === 'LIST' ? 'w-40 sm:w-56' : ''}`}
        tabIndex={-1}
        aria-label={name}
      >
        <div className={`relative overflow-hidden bg-slate-50 ${layoutStyle === 'LIST' ? 'h-full min-h-[120px]' : 'aspect-[4/3] w-full'}`}>
          <img
            src={imgSrc}
            srcSet={imgSrcSet}
            sizes={imgSrcSet ? CARD_IMAGE_SIZES : undefined}
            alt={name}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${isAdultContent ? 'blur-md scale-110' : ''}`}
            loading='lazy'
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER;
            }}
          />

          {/* Discount badge */}
          {hasDiscount ? (
            <span className='absolute left-2 top-2 rounded-full bg-error px-2 py-0.5 text-xs font-bold text-white shadow'>
              -{discountPct}%
            </span>
          ) : badge ? (
            <span className='absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white shadow'>
              {badge}
            </span>
          ) : null}

          {/* +18 badge */}
          {isAdultContent ? (
            <span className='absolute right-2 top-2 rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow'>
              +18
            </span>
          ) : null}

          {/* Stock badge */}
          {isOutOfStock ? (
            <span className='absolute bottom-2 left-2 rounded-full bg-slate-600/90 px-2 py-0.5 text-xs font-semibold text-white'>
              Agotado
            </span>
          ) : showStock && isLowStock ? (
            <span className='absolute bottom-2 left-2 rounded-full bg-warning/90 px-2 py-0.5 text-xs font-semibold text-white'>
              ¡Solo {availableQuantity} en stock!
            </span>
          ) : null}
        </div>
      </Link>

      {/* ── Info ── */}
      <div className='flex flex-1 flex-col gap-1 p-3'>
        {storeName && storeSlug ? (
          <div className='flex items-center gap-1.5'>
            <Link
              to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', storeSlug)}
              className='truncate text-xs font-medium text-primary hover:underline'
              onClick={(e) => e.stopPropagation()}
            >
              {storeName}
            </Link>
            {isSponsored ? (
              <span className='flex-shrink-0 rounded-full border border-highlight/40 bg-highlight-50 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-neutral-dark'>
                Patrocinado
              </span>
            ) : null}
          </div>
        ) : null}

        {averageRating ? (
          <div className='flex items-center gap-1 text-xs'>
            <i className='bx bxs-star text-amber-400' style={{ fontSize: 11 }} aria-hidden='true' />
            <span className='font-semibold text-slate-700'>{averageRating.toFixed(1)}</span>
            <span className='text-slate-400'>({reviewCount ?? 0})</span>
          </div>
        ) : null}

        <Link to={ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', id)}>
          <h3 className='line-clamp-2 text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-primary'>
            {name}
          </h3>
        </Link>

        {/* Price row */}
        <div className='mt-auto flex items-center justify-between gap-2 pt-2.5'>
          <div className='flex flex-col'>
            {hasDiscount ? (
              <span className='text-xs font-medium leading-none text-slate-400 line-through'>
                {formatCurrencyCOP(compareAtPrice!)}
              </span>
            ) : null}
            <span className={`text-lg font-extrabold leading-none tracking-tight ${isOutOfStock ? 'text-slate-400' : 'text-accent'}`}>
              {formatCurrencyCOP(price)}
            </span>
          </div>

          <button
            type='button'
            aria-label={`${addToCartLabel} ${name}`}
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`flex h-8 items-center gap-1 px-3 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:opacity-90 hover:shadow-md hover:shadow-primary/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${customBtnStyle ? '' : 'bg-primary hover:bg-primary-dark'} ${btnClass}`}
            style={isOutOfStock ? undefined : customBtnStyle}
          >
            <i className='bx bx-plus' style={{ fontSize: 14 }} aria-hidden='true' />
            {addToCartLabel}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
