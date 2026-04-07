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
        'surface-card rounded-[1.6rem] p-4 transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(15,23,42,0.14)]',
        className
      )}
    >
      {children}
    </Box>
  );
};

export default Card;
