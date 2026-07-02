import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const Link = ({ to, children, className, style, onClick }: LinkProps) => {
  return (
    <RouterLink
      to={to}
      className={clsx('text-primary hover:underline', className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </RouterLink>
  );
};

export default Link;
