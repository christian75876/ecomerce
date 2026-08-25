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
  ...props
}) => {
  const isDisabled = disabled || loading;

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

          /* Variants — the primary gradient fill pairs with dark ink text,
             not white: measured contrast of white-on-vivid-papaya is
             ~2.9:1 (fails AA), ink-on-vivid-papaya is ~5.7:1 (passes).
             Every other variant below uses the *base* primary/secondary/
             accent token, which is deliberately the deep shade — see the
             contrast note atop palette.tailwind.css — so white text on it
             (secondary) and colored text on a light tint (outlinePrimary,
             primary-opacity) both clear AA on their own, no extra -dark
             indirection needed. */
          'btn-gradient-primary text-neutral-dark hover:opacity-90 focus-visible:ring-primary/50 transition-shadow':
            variant === 'primary' && !isDisabled,
          'bg-secondary text-white shadow-sm hover:bg-secondary-dark focus-visible:ring-secondary/50':
            variant === 'secondary' && !isDisabled,
          'border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm focus-visible:ring-slate-300':
            variant === 'outline' && !isDisabled,
          'border border-primary-200 bg-primary-50 text-primary hover:bg-primary-100 hover:border-primary-light focus-visible:ring-primary/40':
            variant === 'outlinePrimary' && !isDisabled,
          'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md focus-visible:ring-red-400':
            variant === 'danger' && !isDisabled,
          'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-300':
            variant === 'ghost' && !isDisabled,
          'bg-primary-50 text-primary hover:bg-primary-100 focus-visible:ring-primary/40':
            variant === 'primary-opacity' && !isDisabled,

          /* Disabled */
          'cursor-not-allowed opacity-40 shadow-none': isDisabled,
          'cursor-wait': loading,
        },
        className
      )}
      style={style}
      disabled={isDisabled}
      aria-busy={loading}
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
