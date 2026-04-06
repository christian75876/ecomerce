import { NavLink } from 'react-router-dom';
import Box from '@atoms/box/SimpleBox';
import SimpleIcon from '@atoms/icon/SimpleIcon';
import clsx from 'clsx';
import {
  canAccessAdminPanel,
  isAuthenticated,
} from '@/shared/utils/checkIsUserAuthenticated.util';
import { ROUTES } from '@/shared/constants/routes';

const adminNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'bx-home' },
  { label: 'Tiendas', path: ROUTES.PRIVATE.STORES, icon: 'bx-store' },
  { label: 'Categorías', path: '/categories', icon: 'bx-category' },
  { label: 'Inventario', path: '/inventory', icon: 'bx-box' },
  { label: 'POS', path: '/pos', icon: 'bx-credit-card' },
  { label: 'Pedidos', path: '/orders', icon: 'bx-receipt' },
  { label: 'Compras', path: ROUTES.PRIVATE.PURCHASES, icon: 'bx-package' },
  { label: 'Proveedores', path: ROUTES.PRIVATE.SUPPLIERS, icon: 'bx-briefcase' },
  { label: 'Clientes', path: ROUTES.PRIVATE.CUSTOMERS, icon: 'bx-group' },
  { label: 'Caja', path: ROUTES.PRIVATE.CASH, icon: 'bx-wallet' },
  { label: 'Auditoría', path: ROUTES.PRIVATE.AUDIT, icon: 'bx-history' },
  { label: 'Ajustes', path: '/settings', icon: 'bx-cog' },
  { label: 'Productos', path: '/products', icon: 'bx-shopping-bag'}
];

const publicNavItems = [
  { label: 'Productos', path: ROUTES.PUBLIC.HOME, icon: 'bx-shopping-bag' },
  { label: 'Tiendas', path: ROUTES.PUBLIC.STORES, icon: 'bx-store' },
  { label: 'Carrito', path: ROUTES.PUBLIC.CART, icon: 'bx-cart' },
];

const NavigationMenu = () => {
  const navItems =
    isAuthenticated() && canAccessAdminPanel() ? adminNavItems : publicNavItems;

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
