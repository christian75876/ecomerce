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
        'bg-white rounded-xl shadow-md p-4 transition-all',
        'hover:shadow-lg',
        className
      )}
    >
      {children}
    </Box>
  );
};

export default Card;
