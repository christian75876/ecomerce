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
            'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary',
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
