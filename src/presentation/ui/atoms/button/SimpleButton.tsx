import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'ghost'
  | 'outlinePrimary'
  | 'primary-opacity';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const GRADIENT_PRIMARY = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
const SHADOW_PRIMARY = '0 4px 14px rgba(99, 102, 241, 0.35)';
const SHADOW_PRIMARY_HOVER = '0 6px 20px rgba(99, 102, 241, 0.45)';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary' && !isDisabled;

  const computedStyle: React.CSSProperties = isPrimary
    ? { background: GRADIENT_PRIMARY, boxShadow: SHADOW_PRIMARY, ...style }
    : style ?? {};

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isPrimary) e.currentTarget.style.boxShadow = SHADOW_PRIMARY_HOVER;
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isPrimary) e.currentTarget.style.boxShadow = SHADOW_PRIMARY;
    onMouseLeave?.(e);
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl',
        'font-semibold tracking-[0.01em] whitespace-nowrap select-none',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'active:scale-[0.97]',
        {
          /* Sizes */
          'h-8  px-3.5 text-xs':   size === 'sm',
          'h-10 px-5   text-sm':   size === 'md',
          'h-12 px-6   text-base': size === 'lg',

          /* Width */
          'w-full':  fullWidth,
          'w-auto': !fullWidth,

          /* Variants */
          'text-white hover:opacity-90 focus-visible:ring-indigo-400/50':
            variant === 'primary' && !isDisabled,
          'bg-violet-600 text-white shadow-sm hover:bg-violet-700 focus-visible:ring-violet-400/50':
            variant === 'secondary' && !isDisabled,
          'border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm focus-visible:ring-slate-300':
            variant === 'outline' && !isDisabled,
          'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 focus-visible:ring-indigo-300':
            variant === 'outlinePrimary' && !isDisabled,
          'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md focus-visible:ring-red-400':
            variant === 'danger' && !isDisabled,
          'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-300':
            variant === 'ghost' && !isDisabled,
          'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-300':
            variant === 'primary-opacity' && !isDisabled,

          /* Disabled */
          'cursor-not-allowed opacity-40 shadow-none': isDisabled,
          'cursor-wait': loading,
        },
        className
      )}
      style={computedStyle}
      disabled={isDisabled}
      aria-busy={loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading ? (
        <svg
          className={clsx('animate-spin', {
            'h-3.5 w-3.5': size === 'sm',
            'h-4 w-4':     size === 'md',
            'h-5 w-5':     size === 'lg',
          })}
          viewBox='0 0 24 24'
          fill='none'
          aria-hidden='true'
        >
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
        </svg>
      ) : null}

      {!loading && leftIcon ? (
        <span className={clsx('leading-none', { 'text-xs': size === 'sm', 'text-sm': size === 'md', 'text-base': size === 'lg' })}>
          {leftIcon}
        </span>
      ) : null}

      {children}

      {rightIcon && !loading ? (
        <span className={clsx('leading-none', { 'text-xs': size === 'sm', 'text-sm': size === 'md', 'text-base': size === 'lg' })}>
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
};

export default Button;
