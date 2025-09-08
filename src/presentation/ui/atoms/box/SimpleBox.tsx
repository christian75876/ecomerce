import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * A flexible Box component to replace <div> elements.
 * Now using clsx for class management and forwardRef support.
 */
const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={clsx(className)} {...props}>
        {children}
      </div>
    );
  }
);

export default Box;
