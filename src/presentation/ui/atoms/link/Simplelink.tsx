import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const Link = ({ to, children, className }: LinkProps) => {
  return (
    <RouterLink
      to={to}
      className={clsx('text-primary hover:underline', className)}
    >
      {children}
    </RouterLink>
  );
};

export default Link;
