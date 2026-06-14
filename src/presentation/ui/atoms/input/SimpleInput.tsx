import clsx from 'clsx';
import { InputHTMLAttributes, forwardRef } from 'react';

import Box from '@atoms/box/SimpleBox';
import ErrorMessage from '@atoms/error-message/SimpleErrorMessage';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <Box className='w-full space-y-1.5'>
        {label ? (
          <label
            htmlFor={id}
            className='block text-sm font-semibold text-neutral-dark/80'
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          className={clsx(
            'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-neutral-dark',
            'shadow-xs placeholder:text-neutral-dark/30',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-400 bg-red-50/30 focus:border-red-400 focus:ring-red-400/25'
              : 'border-neutral-gray/70 hover:border-neutral-gray focus:border-primary/50 focus:ring-primary/20',
            className
          )}
          {...props}
        />
        {error ? <ErrorMessage message={error} /> : null}
      </Box>
    );
  }
);

Input.displayName = 'Input';

export default Input;
