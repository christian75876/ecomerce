import { NavLink } from 'react-router-dom';
import Box from '@atoms/box/SimpleBox';
import Icon from '@atoms/icon/SimpleIcon';
import Typography from '@atoms/typography/SimpleTypography';
import { ROUTES } from '@/shared/constants/routes';

const navItems = [
  { label: 'Inicio', path: ROUTES.PRIVATE.DASHBOARD, icon: 'bx-home' },
  { label: 'Categorías', path: ROUTES.PRIVATE.CATEGORIES, icon: 'bx-category' },
  { label: 'Inventario', path: ROUTES.PRIVATE.INVENTORY, icon: 'bx-box' },
  { label: 'POS', path: ROUTES.PRIVATE.POS, icon: 'bx-credit-card' },
  { label: 'Pedidos', path: ROUTES.PRIVATE.ORDERS, icon: 'bx-receipt' },
  { label: 'Productos', path: ROUTES.PRIVATE.PRODUCTS, icon: 'bx-shopping-bag' },
  { label: 'Ajustes', path: ROUTES.PRIVATE.SETTINGS, icon: 'bx-cog' }
];

const MobileHeaderLayout = () => {
  return (
    <Box className='fixed z-50 bottom-0 w-full bg-white shadow-md py-3'>
      <Box className='flex justify-around'>
        {navItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center text-sm transition-all ${
                isActive ? 'text-primary' : 'text-gray-600'
              }`
            }
          >
            <Icon name={icon} className='text-2xl' />
            <Typography variant='p' className='mt-1'>
              {label}
            </Typography>
          </NavLink>
        ))}
      </Box>
    </Box>
  );
};

export default MobileHeaderLayout;
