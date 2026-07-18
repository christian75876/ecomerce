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
        'rounded-2xl bg-white p-4 transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/8',
        className
      )}
      style={{
        border: '1px solid rgba(15,23,42,0.07)',
        boxShadow: '0 1px 4px rgba(15,23,42,0.05), 0 4px 16px rgba(99,102,241,0.05)',
      }}
    >
      {children}
    </Box>
  );
};

export default Card;
