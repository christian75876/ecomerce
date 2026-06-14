import clsx from 'clsx';
import { ReactNode } from 'react';
import Box from '@atoms/box/SimpleBox';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <Box
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-primary/6',
        className
      )}
    >
      {children}
    </Box>
  );
};

export default Card;
