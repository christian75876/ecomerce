import { NavLink } from 'react-router-dom';
import Box from '@atoms/box/SimpleBox';
import SimpleIcon from '@atoms/icon/SimpleIcon'; // Se usa el átomo de iconos
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'bx-home' },
  { label: 'Rastrear', path: '/tracking', icon: 'bx-package' },
  { label: 'Ajustes', path: '/settings', icon: 'bx-cog' },
  { label: 'Tiendas', path: '/stores', icon: 'bx-store' },
  { label: 'Productos', path: '/products', icon: 'bx-shopping-bag'}
];

const NavigationMenu = () => {
  return (
    <Box className='flex space-x-8'>
      {navItems.map(({ label, path, icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-2 text-md font-medium transition-all duration-200',
              isActive
                ? 'text-primary border-b-2 border-primary pb-1'
                : 'text-gray-600 hover:text-primary'
            )
          }
        >
          <SimpleIcon name={icon} size={18} className='text-inherit' />
          {label}
        </NavLink>
      ))}
    </Box>
  );
};

export default NavigationMenu;
