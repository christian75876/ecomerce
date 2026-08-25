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
            className='block text-sm font-semibold text-slate-700'
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          className={clsx(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800',
            'placeholder:text-slate-500',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-300/30'
              : 'border-slate-200 hover:border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20',
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
