import clsx from 'clsx';
import { InputHTMLAttributes, forwardRef } from 'react';

import Box from '@atoms/box/SimpleBox';
import ErrorMessage from '@atoms/error-message/SimpleErrorMessage';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <Box className='w-full '>
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-2xl border px-4 py-3.5 transition-all bg-white/90 shadow-sm placeholder:text-neutral-dark/35',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-neutral-gray/80 focus:border-primary/40 focus:ring-primary/20',
            className
          )}
          {...props}
        />
        {error && <ErrorMessage message={error} />}
      </Box>
    );
  }
);

export default Input;
