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
        'rounded-2xl border border-slate-900/[0.07] bg-white p-4 shadow-card transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/8',
        className
      )}
    >
      {children}
    </Box>
  );
};

export default Card;
