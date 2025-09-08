import { NavLink, NavLinkProps } from 'react-router-dom';
import clsx from 'clsx';

interface SimpleNavLinkProps extends NavLinkProps {
  disabled?: boolean;
}

const SimpleNavLink = ({
  disabled,
  className,
  children,
  ...props
}: SimpleNavLinkProps) => {
  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        clsx(
          'transition-all duration-300',
          isActive
            ? 'text-primary font-semibold'
            : 'text-gray-600 hover:text-primary',
          disabled && 'pointer-events-none opacity-50',
          className
        )
      }
    >
      {children}
    </NavLink>
  );
};

export default SimpleNavLink;
