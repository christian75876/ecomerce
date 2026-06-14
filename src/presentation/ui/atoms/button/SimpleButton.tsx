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
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-2xl',
        'font-semibold tracking-[0.01em] whitespace-nowrap select-none',
        'transition-all duration-200 ease-smooth',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'active:scale-[0.97]',
        {
          /* Sizes */
          'h-8  px-3.5 text-xs':  size === 'sm',
          'h-10 px-5   text-sm':  size === 'md',
          'h-12 px-6   text-base': size === 'lg',

          /* Width */
          'w-full':  fullWidth,
          'w-auto': !fullWidth,

          /* Variants — active */
          'bg-primary text-white shadow-soft hover:bg-primary-dark hover:shadow-card focus-visible:ring-primary/40':
            variant === 'primary' && !isDisabled,
          'bg-secondary text-white shadow-soft hover:bg-secondary-dark hover:shadow-card focus-visible:ring-secondary/40':
            variant === 'secondary' && !isDisabled,
          'border border-neutral-gray/60 bg-white text-neutral-dark shadow-xs hover:border-neutral-dark/25 hover:bg-neutral-50 hover:shadow-soft focus-visible:ring-neutral-gray':
            variant === 'outline' && !isDisabled,
          'border border-primary/25 bg-primary/6 text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-soft focus-visible:ring-primary/30':
            variant === 'outlinePrimary' && !isDisabled,
          'bg-red-600 text-white shadow-soft hover:bg-red-700 hover:shadow-card focus-visible:ring-red-400':
            variant === 'danger' && !isDisabled,
          'bg-transparent text-neutral-dark/70 hover:bg-neutral-dark/6 hover:text-neutral-dark focus-visible:ring-neutral-gray':
            variant === 'ghost' && !isDisabled,
          'bg-primary/10 text-primary hover:bg-primary/16 focus-visible:ring-primary/30':
            variant === 'primary-opacity' && !isDisabled,

          /* Disabled */
          'cursor-not-allowed opacity-45 shadow-none': isDisabled,
          'cursor-wait': loading,
        },
        className
      )}
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
          <circle
            className='opacity-25'
            cx='12' cy='12' r='10'
            stroke='currentColor'
            strokeWidth='4'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
          />
        </svg>
      ) : null}

      {!loading && leftIcon ? (
        <span className={clsx('leading-none', {
          'text-xs': size === 'sm',
          'text-sm': size === 'md',
          'text-base': size === 'lg',
        })}>
          {leftIcon}
        </span>
      ) : null}

      {children}

      {rightIcon && !loading ? (
        <span className={clsx('leading-none', {
          'text-xs': size === 'sm',
          'text-sm': size === 'md',
          'text-base': size === 'lg',
        })}>
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
};

export default Button;
