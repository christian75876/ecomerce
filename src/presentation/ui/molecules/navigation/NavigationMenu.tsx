import { NavLink, useLocation } from 'react-router-dom';
import Box from '@atoms/box/SimpleBox';
import SimpleIcon from '@atoms/icon/SimpleIcon';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import {
  canAccessAdminPanel,
  getAuthenticatedRole,
  isAuthenticated,
  isBuyerSession,
} from '@/shared/utils/checkIsUserAuthenticated.util';
import { ROUTES } from '@/shared/constants/routes';

type NavGroup = { label: string; items: { label: string; path: string; icon: string }[] };

// ── Admin: ve y gestiona todo ──────────────────────────────────────────────
const adminNavGroups: NavGroup[] = [
  {
    label: 'Inicio',
    items: [{ label: 'Dashboard', path: ROUTES.PRIVATE.DASHBOARD, icon: 'bx-home' }],
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Tiendas', path: ROUTES.PRIVATE.STORES, icon: 'bx-store' },
      { label: 'Productos', path: ROUTES.PRIVATE.PRODUCTS, icon: 'bx-shopping-bag' },
      { label: 'Categorías', path: ROUTES.PRIVATE.CATEGORIES, icon: 'bx-category' },
      { label: 'Inventario', path: ROUTES.PRIVATE.INVENTORY, icon: 'bx-box' },
    ],
  },
  {
    label: 'Operación',
    items: [
      { label: 'POS', path: ROUTES.PRIVATE.POS, icon: 'bx-credit-card' },
      { label: 'Pedidos', path: ROUTES.PRIVATE.ORDERS, icon: 'bx-receipt' },
      { label: 'Caja', path: ROUTES.PRIVATE.CASH, icon: 'bx-wallet' },
    ],
  },
  {
    label: 'Abastecimiento',
    items: [
      { label: 'Proveedores', path: ROUTES.PRIVATE.SUPPLIERS, icon: 'bx-briefcase' },
      { label: 'Compras', path: ROUTES.PRIVATE.PURCHASES, icon: 'bx-package' },
    ],
  },
  {
    label: 'Control',
    items: [
      { label: 'Suscripciones', path: ROUTES.PRIVATE.SUBSCRIPTIONS, icon: 'bx-credit-card-alt' },
      { label: 'Invitaciones', path: ROUTES.PRIVATE.INVITATIONS, icon: 'bx-envelope' },
      { label: 'Auditoría', path: ROUTES.PRIVATE.AUDIT, icon: 'bx-history' },
      { label: 'Ajustes', path: ROUTES.PRIVATE.SETTINGS, icon: 'bx-cog' },
    ],
  },
];

// ── Seller: solo su tienda y operación propia ──────────────────────────────
const sellerNavGroups: NavGroup[] = [
  {
    label: 'Inicio',
    items: [{ label: 'Dashboard', path: ROUTES.PRIVATE.DASHBOARD, icon: 'bx-home' }],
  },
  {
    label: 'Mi tienda',
    items: [
      { label: 'Mi tienda', path: ROUTES.PRIVATE.STORE, icon: 'bx-store' },
      { label: 'Productos', path: ROUTES.PRIVATE.PRODUCTS, icon: 'bx-shopping-bag' },
      { label: 'Inventario', path: ROUTES.PRIVATE.INVENTORY, icon: 'bx-box' },
    ],
  },
  {
    label: 'Operación',
    items: [
      { label: 'POS', path: ROUTES.PRIVATE.POS, icon: 'bx-credit-card' },
      { label: 'Pedidos', path: ROUTES.PRIVATE.ORDERS, icon: 'bx-receipt' },
      { label: 'Caja', path: ROUTES.PRIVATE.CASH, icon: 'bx-wallet' },
    ],
  },
  {
    label: 'Abastecimiento',
    items: [
      { label: 'Proveedores', path: ROUTES.PRIVATE.SUPPLIERS, icon: 'bx-briefcase' },
      { label: 'Compras', path: ROUTES.PRIVATE.PURCHASES, icon: 'bx-package' },
    ],
  },
  {
    label: 'Relaciones',
    items: [{ label: 'Clientes', path: ROUTES.PRIVATE.CUSTOMERS, icon: 'bx-group' }],
  },
  {
    label: 'Ajustes',
    items: [{ label: 'Ajustes', path: ROUTES.PRIVATE.SETTINGS, icon: 'bx-cog' }],
  },
];

const publicNavItems = [
  { label: 'Productos', path: ROUTES.PUBLIC.HOME, icon: 'bx-shopping-bag' },
  { label: 'Tiendas', path: ROUTES.PUBLIC.STORES, icon: 'bx-store' },
  { label: 'Favoritos', path: ROUTES.PUBLIC.FAVORITES, icon: 'bx-heart' },
  { label: 'Mis pedidos', path: ROUTES.PUBLIC.MY_ORDERS, icon: 'bx-receipt' },
  { label: 'Carrito', path: ROUTES.PUBLIC.CART, icon: 'bx-cart' },
];

const NavigationMenu = () => {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isAdminNavigation = isAuthenticated() && canAccessAdminPanel();
  const role = getAuthenticatedRole();
  const buyerSession = isBuyerSession();

  const activeNavGroups = role === 'admin' ? adminNavGroups : sellerNavGroups;

  const visiblePublicItems = publicNavItems.filter((item) => {
    if (!isAuthenticated() && (item.path === ROUTES.PUBLIC.FAVORITES || item.path === ROUTES.PUBLIC.MY_ORDERS)) {
      return false;
    }
    if (isAuthenticated() && !buyerSession && item.path === ROUTES.PUBLIC.MY_ORDERS) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!openGroup) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openGroup]);

  // Close dropdown on route change
  useEffect(() => {
    setOpenGroup(null);
  }, [location.pathname]);

  return (
    <Box ref={menuRef} className='flex items-center gap-1'>
      {isAdminNavigation ? (
        activeNavGroups.map((group) => {
          const isActive = group.items.some((item) =>
            location.pathname.startsWith(item.path),
          );

          return (
            <Box key={group.label} className='relative'>
              {group.items.length === 1 ? (
                <NavLink
                  to={group.items[0].path}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-neutral-dark/65 hover:bg-white hover:text-neutral-dark',
                  )}
                >
                  <SimpleIcon name={group.items[0].icon} size={18} className='text-inherit' />
                  {group.label}
                </NavLink>
              ) : (
                <>
                  <button
                    type='button'
                    onClick={() =>
                      setOpenGroup((current) => current === group.label ? null : group.label)
                    }
                    className={clsx(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
                      isActive || openGroup === group.label
                        ? 'bg-white text-neutral-dark shadow-sm'
                        : 'text-neutral-dark/65 hover:bg-white hover:text-neutral-dark',
                    )}
                  >
                    {group.label}
                    <SimpleIcon
                      name='bx-chevron-down'
                      size={16}
                      className={clsx('transition-transform', openGroup === group.label && 'rotate-180')}
                    />
                  </button>

                  {openGroup === group.label ? (
                    <Box className='absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] rounded-[1.35rem] border border-neutral-gray/40 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)]'>
                      {group.items.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpenGroup(null)}
                          className={({ isActive: itemActive }) =>
                            clsx(
                              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                              itemActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-neutral-dark/75 hover:bg-background hover:text-neutral-dark',
                            )
                          }
                        >
                          <SimpleIcon name={item.icon} size={18} />
                          {item.label}
                        </NavLink>
                      ))}
                    </Box>
                  ) : null}
                </>
              )}
            </Box>
          );
        })
      ) : (
        visiblePublicItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-white text-neutral-dark shadow-sm'
                  : 'text-neutral-dark/70 hover:bg-white hover:text-neutral-dark',
              )
            }
          >
            <SimpleIcon name={icon} size={18} className='text-inherit' />
            {label}
          </NavLink>
        ))
      )}
    </Box>
  );
};

export default NavigationMenu;
