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
        'flex items-center justify-center gap-2 rounded-lg transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer',
        'whitespace-nowrap',
        {
          'px-3 py-1 text-sm': size === 'sm',
          'px-5 py-2 text-md': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',

          'w-full': fullWidth,
          'w-auto': !fullWidth,

          'bg-primary text-neutral-white hover:bg-primary-dark focus:ring-primary-light':
            variant === 'primary' && !disabled,
          'bg-secondary text-neutral-dark hover:bg-secondary-dark focus:ring-secondary-light':
            variant === 'secondary' && !disabled,
          'border border-neutral-gray text-neutral-dark hover:bg-neutral-gray focus:ring-neutral-gray':
            variant === 'outline' && !disabled,
          'border border-primary text-primary hover:bg-primary-dark focus:ring-primary-light':
            variant === 'outlinePrimary' && !disabled,
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400':
            variant === 'danger' && !disabled,
          'bg-neutral-white text-primary hover:bg-neutral-gray focus:ring-primary-light':
            variant === 'ghost' && !disabled,
          'bg-primary-opacity text-primary hover:bg-primary-dark focus:ring-primary-light':
            variant === 'primary-opacity' && !disabled,
          'bg-neutral-gray text-neutral-dark opacity-50 cursor-not-allowed':
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
