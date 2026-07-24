import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Box from '@atoms/box/SimpleBox';
import Icon from '@atoms/icon/SimpleIcon';
import Typography from '@atoms/typography/SimpleTypography';
import { ROUTES } from '@/shared/constants/routes';
import {
  canAccessAdminPanel,
  isAuthenticated,
  isBuyerSession,
} from '@/shared/utils/checkIsUserAuthenticated.util';
import { useOrderNotifications } from '@/shared/hooks/useOrderNotifications';
import { useCart } from '@/shared/hooks/useCart';

const adminPrimaryNavItems = [
  { label: 'Inicio', path: ROUTES.PRIVATE.DASHBOARD, icon: 'bx-home' },
  { label: 'POS', path: ROUTES.PRIVATE.POS, icon: 'bx-credit-card' },
  { label: 'Pedidos', path: ROUTES.PRIVATE.ORDERS, icon: 'bx-receipt' },
];

const adminMoreNavItems = [
  { label: 'Tiendas', path: ROUTES.PRIVATE.STORES, icon: 'bx-store' },
  { label: 'Productos', path: ROUTES.PRIVATE.PRODUCTS, icon: 'bx-shopping-bag' },
  { label: 'Categorías', path: ROUTES.PRIVATE.CATEGORIES, icon: 'bx-category' },
  { label: 'Inventario', path: ROUTES.PRIVATE.INVENTORY, icon: 'bx-box' },
  { label: 'Clientes y cartera', path: ROUTES.PRIVATE.CUSTOMERS, icon: 'bx-group' },
  { label: 'Compras', path: ROUTES.PRIVATE.PURCHASES, icon: 'bx-package' },
  { label: 'Proveedores', path: ROUTES.PRIVATE.SUPPLIERS, icon: 'bx-briefcase' },
  { label: 'Caja', path: ROUTES.PRIVATE.CASH, icon: 'bx-wallet' },
  { label: 'Auditoría', path: ROUTES.PRIVATE.AUDIT, icon: 'bx-history' },
  { label: 'Cupones', path: ROUTES.PRIVATE.COUPONS, icon: 'bx-purchase-tag' },
  { label: 'Ajustes', path: ROUTES.PRIVATE.SETTINGS, icon: 'bx-cog' },
  { label: 'Ayuda', path: ROUTES.PUBLIC.HELP, icon: 'bx-help-circle' },
];

const publicPrimaryNavItems = [
  { label: 'Inicio', path: ROUTES.PUBLIC.HOME, icon: 'bx-home' },
  { label: 'Tiendas', path: ROUTES.PUBLIC.STORES, icon: 'bx-store' },
  { label: 'Mapa', path: ROUTES.PUBLIC.STORE_MAP, icon: 'bx-map-alt' },
  { label: 'Carrito', path: ROUTES.PUBLIC.CART, icon: 'bx-cart' },
];

const publicMoreNavItems = [
  { label: 'Mi perfil', path: ROUTES.PRIVATE.PROFILE, icon: 'bx-user' },
  { label: 'Favoritos', path: ROUTES.PUBLIC.FAVORITES, icon: 'bx-heart' },
  { label: 'Mis pedidos', path: ROUTES.PUBLIC.MY_ORDERS, icon: 'bx-receipt' },
  { label: 'Entrar', path: ROUTES.PUBLIC.LOGIN, icon: 'bx-user' },
  { label: 'Ayuda', path: ROUTES.PUBLIC.HELP, icon: 'bx-help-circle' },
];

const MobileHeaderLayout = () => {
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(showMore ? 'mobile-nav-more-open' : 'mobile-nav-more-close'));
  }, [showMore]);

  const adminView = isAuthenticated() && canAccessAdminPanel();
  const { unreadCount } = useOrderNotifications();
  const { items: cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const buyerView = isBuyerSession();
  const primaryNavItems = adminView ? adminPrimaryNavItems : publicPrimaryNavItems;
  const moreNavItems = adminView
    ? adminMoreNavItems
    : publicMoreNavItems.filter((item) => {
        // Ocultar "Mi perfil" si no está autenticado
        if (!isAuthenticated() && item.path === ROUTES.PRIVATE.PROFILE) {
          return false;
        }
        // Ocultar "Entrar" si ya está autenticado
        if (isAuthenticated() && item.path === ROUTES.PUBLIC.LOGIN) {
          return false;
        }
        // Ocultar favoritos/pedidos si no está autenticado
        if (
          !isAuthenticated() &&
          (item.path === ROUTES.PUBLIC.FAVORITES || item.path === ROUTES.PUBLIC.MY_ORDERS)
        ) {
          return false;
        }
        // Ocultar "Mis pedidos" si no es comprador
        if (item.path === ROUTES.PUBLIC.MY_ORDERS && !buyerView) {
          return false;
        }
        return true;
      });

  return (
    <>
      {showMore ? (
        <Box className='fixed inset-0 z-50 bg-neutral-dark/35 backdrop-blur-[2px]' onClick={() => setShowMore(false)}>
          <Box
            className='absolute inset-x-3 bottom-24 rounded-[1.75rem] border border-neutral-gray/20 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
            onClick={(event) => event.stopPropagation()}
          >
            <Typography variant='h3'>Más opciones</Typography>
            <Box className='mt-4 grid grid-cols-2 gap-2'>
              {moreNavItems.map(({ label, path, icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setShowMore(false)}
                  className='flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-sm font-medium text-neutral-dark/75'
                >
                  <Icon name={icon} className='text-xl' />
                  {label}
                </NavLink>
              ))}
            </Box>
          </Box>
        </Box>
      ) : null}
      <Box className='surface-card fixed inset-x-0 bottom-0 z-50 rounded-t-[1.5rem] py-3 [padding-bottom:calc(env(safe-area-inset-bottom,0px)+0.75rem)]'>
        <Box className='flex justify-around'>
          {primaryNavItems.map(({ label, path, icon }) => {
            const isOrders = adminView && path === ROUTES.PRIVATE.ORDERS;
            const isCart = !adminView && path === ROUTES.PUBLIC.CART;
            const badge =
              (isOrders && unreadCount > 0 ? unreadCount : 0) ||
              (isCart && cartCount > 0 ? cartCount : 0);
            return (
              <NavLink
                key={path}
                to={path}
                onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `relative flex flex-col items-center text-sm transition-all ${
                    isActive ? 'text-primary' : 'text-gray-600'
                  }`
                }
              >
                <span className='relative'>
                  <Icon name={icon} className='text-2xl' />
                  {badge > 0 ? (
                    <span className='absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white'>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  ) : null}
                </span>
                <Typography variant='p' className='mt-1 text-xs'>
                  {label}
                </Typography>
              </NavLink>
            );
          })}
          <button
            type='button'
            onClick={() => setShowMore((current) => !current)}
            className='flex flex-col items-center text-sm text-gray-600 transition-all'
          >
            <Icon name='bx-grid-alt' className='text-2xl' />
            <Typography variant='p' className='mt-1 text-xs'>
              Más
            </Typography>
          </button>
        </Box>
      </Box>
    </>
  );
};

export default MobileHeaderLayout;
