import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'outlinePrimary' | 'primary-opacity';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-2xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer',
        'font-semibold tracking-[0.01em] shadow-sm active:scale-[0.99]',
        'whitespace-nowrap',
        {
          'px-3.5 py-2 text-sm': size === 'sm',
          'px-5 py-3 text-sm': size === 'md',
          'px-6 py-3.5 text-base': size === 'lg',

          'w-full': fullWidth,
          'w-auto': !fullWidth,

          'bg-primary text-neutral-white hover:bg-primary-dark focus:ring-primary-light':
            variant === 'primary' && !disabled,
          'bg-secondary text-neutral-white hover:bg-secondary-dark focus:ring-secondary-light':
            variant === 'secondary' && !disabled,
          'border border-neutral-gray bg-white text-neutral-dark hover:border-neutral-dark/20 hover:bg-neutral-white focus:ring-neutral-gray':
            variant === 'outline' && !disabled,
          'border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white focus:ring-primary-light':
            variant === 'outlinePrimary' && !disabled,
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400':
            variant === 'danger' && !disabled,
          'bg-white text-primary hover:bg-primary/5 focus:ring-primary-light':
            variant === 'ghost' && !disabled,
          'bg-primary/10 text-primary hover:bg-primary/15 focus:ring-primary-light':
            variant === 'primary-opacity' && !disabled,
          'bg-neutral-gray text-neutral-dark opacity-50 cursor-not-allowed shadow-none':
            disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon && (
        <span
          className={clsx({
            'text-sm': size === 'sm',
            'text-md': size === 'md',
            'text-lg': size === 'lg'
          })}
        >
          {leftIcon}
        </span>
      )}
      {children}
      {rightIcon && (
        <span
          className={clsx({
            'text-sm': size === 'sm',
            'text-md': size === 'md',
            'text-lg': size === 'lg'
          })}
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
