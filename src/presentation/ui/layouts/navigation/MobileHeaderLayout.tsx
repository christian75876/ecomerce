import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Box from '@atoms/box/SimpleBox';
import Icon from '@atoms/icon/SimpleIcon';
import Typography from '@atoms/typography/SimpleTypography';
import { ROUTES } from '@/shared/constants/routes';
import {
  canAccessAdminPanel,
  isAdminRole,
  isAuthenticated,
  isBuyerSession,
} from '@/shared/utils/checkIsUserAuthenticated.util';
import { useOrderNotifications } from '@/shared/hooks/useOrderNotifications';
import { useCart } from '@/shared/hooks/useCart';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

const adminPrimaryNavItems = [
  { label: 'Inicio',   path: ROUTES.PRIVATE.DASHBOARD, icon: 'bx-home'       },
  { label: 'POS',      path: ROUTES.PRIVATE.POS,       icon: 'bx-credit-card' },
  { label: 'Pedidos',  path: ROUTES.PRIVATE.ORDERS,    icon: 'bx-receipt'     },
];

const adminMoreNavItems = [
  { label: 'Tiendas',           path: ROUTES.PRIVATE.STORES,     icon: 'bx-store'         },
  { label: 'Productos',         path: ROUTES.PRIVATE.PRODUCTS,   icon: 'bx-shopping-bag'  },
  { label: 'Categorías',        path: ROUTES.PRIVATE.CATEGORIES, icon: 'bx-category'      },
  { label: 'Inventario',        path: ROUTES.PRIVATE.INVENTORY,  icon: 'bx-box'           },
  { label: 'Clientes y cartera',path: ROUTES.PRIVATE.CUSTOMERS,  icon: 'bx-group'         },
  { label: 'Compras',           path: ROUTES.PRIVATE.PURCHASES,  icon: 'bx-package'       },
  { label: 'Proveedores',       path: ROUTES.PRIVATE.SUPPLIERS,  icon: 'bx-briefcase'     },
  { label: 'Caja',              path: ROUTES.PRIVATE.CASH,       icon: 'bx-wallet'        },
  { label: 'Auditoría',         path: ROUTES.PRIVATE.AUDIT,      icon: 'bx-history'       },
  { label: 'Cupones',           path: ROUTES.PRIVATE.COUPONS,    icon: 'bx-purchase-tag'  },
  { label: 'Ajustes',           path: ROUTES.PRIVATE.SETTINGS,   icon: 'bx-cog'           },
  { label: 'Ayuda',             path: ROUTES.PUBLIC.HELP,         icon: 'bx-help-circle'   },
];

const superAdminMoreNavItems = [
  { label: 'Invitaciones',  path: ROUTES.PRIVATE.INVITATIONS,  icon: 'bx-envelope'      },
  { label: 'Suscripciones', path: ROUTES.PRIVATE.SUBSCRIPTIONS,icon: 'bx-badge-check'   },
  { label: 'Publicidad',    path: ROUTES.PRIVATE.ADVERTISING,  icon: 'bx-bulb'          },
];

const publicPrimaryNavItems = [
  { label: 'Inicio',   path: ROUTES.PUBLIC.HOME,       icon: 'bx-home'    },
  { label: 'Tiendas',  path: ROUTES.PUBLIC.STORES,     icon: 'bx-store'   },
  { label: 'Mapa',     path: ROUTES.PUBLIC.STORE_MAP,  icon: 'bx-map-alt' },
  { label: 'Carrito',  path: ROUTES.PUBLIC.CART,       icon: 'bx-cart'    },
];

const publicMoreNavItems = [
  { label: 'Mi perfil',   path: ROUTES.PRIVATE.PROFILE,    icon: 'bx-user'    },
  { label: 'Favoritos',   path: ROUTES.PUBLIC.FAVORITES,   icon: 'bx-heart'   },
  { label: 'Mis pedidos', path: ROUTES.PUBLIC.MY_ORDERS,   icon: 'bx-receipt' },
  { label: 'Entrar',      path: ROUTES.PUBLIC.LOGIN,        icon: 'bx-user'    },
  { label: 'Ayuda',       path: ROUTES.PUBLIC.HELP,         icon: 'bx-help-circle' },
];

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Ahora mismo';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
};

const MobileHeaderLayout = () => {
  const [showMore, setShowMore] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(showMore ? 'mobile-nav-more-open' : 'mobile-nav-more-close'));
  }, [showMore]);

  const adminView = isAuthenticated() && canAccessAdminPanel();
  const { unreadCount, notifications, markAllRead, markRead } = useOrderNotifications();
  const { items: cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const buyerView = isBuyerSession();
  const primaryNavItems = adminView ? adminPrimaryNavItems : publicPrimaryNavItems;
  const moreNavItems = adminView
    ? [...adminMoreNavItems, ...(isAdminRole() ? superAdminMoreNavItems : [])]
    : publicMoreNavItems.filter((item) => {
        if (!isAuthenticated() && item.path === ROUTES.PRIVATE.PROFILE) return false;
        if (isAuthenticated() && item.path === ROUTES.PUBLIC.LOGIN) return false;
        if (!isAuthenticated() && (item.path === ROUTES.PUBLIC.FAVORITES || item.path === ROUTES.PUBLIC.MY_ORDERS)) return false;
        if (item.path === ROUTES.PUBLIC.MY_ORDERS && !buyerView) return false;
        return true;
      });

  const closeAll = () => { setShowMore(false); setShowNotifPanel(false); };

  return (
    <>
      {/* ── Notification panel (admin only) ── */}
      {showNotifPanel ? (
        <Box className='fixed inset-0 z-50 bg-neutral-dark/35 backdrop-blur-[2px]' onClick={closeAll}>
          <Box
            className='absolute inset-x-3 bottom-24 max-h-[70vh] overflow-hidden rounded-[1.75rem] border border-neutral-gray/20 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box className='flex items-center justify-between border-b border-slate-100 px-5 py-4'>
              <Box className='flex items-center gap-2'>
                <i className='bx bx-bell text-xl text-primary' aria-hidden='true' />
                <Typography variant='h3'>Notificaciones</Typography>
                {unreadCount > 0 ? (
                  <span className='flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white'>
                    {unreadCount}
                  </span>
                ) : null}
              </Box>
              <Box className='flex items-center gap-2'>
                {unreadCount > 0 ? (
                  <button type='button' onClick={markAllRead} className='text-xs font-medium text-primary hover:underline'>
                    Marcar leídas
                  </button>
                ) : null}
                <button type='button' onClick={closeAll} className='flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100'>
                  <i className='bx bx-x text-lg' aria-hidden='true' />
                </button>
              </Box>
            </Box>

            {/* List */}
            <Box className='overflow-y-auto' style={{ maxHeight: 'calc(70vh - 64px)' }}>
              {notifications.length === 0 ? (
                <Box className='flex flex-col items-center py-12 text-center'>
                  <i className='bx bx-bell-off mb-3 text-4xl text-slate-200' aria-hidden='true' />
                  <p className='text-sm font-medium text-slate-400'>Sin notificaciones</p>
                  <p className='mt-1 text-xs text-slate-300'>Los pedidos nuevos aparecerán aquí</p>
                </Box>
              ) : (
                notifications.map((n) => (
                  <NavLink
                    key={n.id}
                    to={ROUTES.PRIVATE.ORDERS}
                    onClick={() => { markRead(n.id); closeAll(); }}
                    className={`flex items-start gap-3 border-b border-slate-50 px-5 py-4 last:border-0 transition-colors hover:bg-slate-50 ${!n.read ? 'bg-primary/[0.04]' : ''}`}
                  >
                    <Box className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!n.read ? 'bg-primary/10' : 'bg-slate-100'}`}>
                      <i className={`bx bx-receipt text-base ${!n.read ? 'text-primary' : 'text-slate-400'}`} aria-hidden='true' />
                    </Box>
                    <Box className='min-w-0 flex-1'>
                      <p className='text-sm font-semibold text-slate-800'>
                        Nuevo pedido · {n.itemCount} {n.itemCount === 1 ? 'artículo' : 'artículos'}
                      </p>
                      <p className='mt-0.5 truncate text-xs text-slate-500'>
                        {n.customerName} · {formatCurrencyCOP(n.total)}
                      </p>
                      {n.deliveryMethod ? (
                        <p className='mt-0.5 text-[11px] text-slate-400'>
                          {n.deliveryMethod === 'DELIVERY' ? '🚗 Domicilio' : '🏪 Recogida en tienda'}
                        </p>
                      ) : null}
                      <p className='mt-1 text-[11px] text-slate-400'>{timeAgo(n.createdAt)}</p>
                    </Box>
                    {!n.read ? <span className='mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary' /> : null}
                  </NavLink>
                ))
              )}
            </Box>
          </Box>
        </Box>
      ) : null}

      {/* ── More panel ── */}
      {showMore ? (
        <Box className='fixed inset-0 z-50 bg-neutral-dark/35 backdrop-blur-[2px]' onClick={closeAll}>
          <Box
            className='absolute inset-x-3 bottom-24 rounded-[1.75rem] border border-neutral-gray/20 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant='h3'>Más opciones</Typography>
            <Box className='mt-4 grid grid-cols-2 gap-2'>
              {moreNavItems.map(({ label, path, icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={closeAll}
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

      {/* ── Bottom nav bar ── */}
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
                onClick={closeAll}
                className={({ isActive }) =>
                  `relative flex flex-col items-center text-sm transition-all ${isActive ? 'text-primary' : 'text-gray-600'}`
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
                <Typography variant='p' className='mt-1 text-xs'>{label}</Typography>
              </NavLink>
            );
          })}

          {/* Bell button — admin only, always visible */}
          {adminView ? (
            <button
              type='button'
              onClick={() => { setShowMore(false); setShowNotifPanel((o) => !o); }}
              className='relative flex flex-col items-center text-sm text-gray-600 transition-all'
            >
              <span className='relative'>
                <i className='bx bx-bell text-2xl' aria-hidden='true' />
                {unreadCount > 0 ? (
                  <span className='absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </span>
              <Typography variant='p' className='mt-1 text-xs'>Alertas</Typography>
            </button>
          ) : null}

          {/* Más */}
          <button
            type='button'
            onClick={() => { setShowNotifPanel(false); setShowMore((o) => !o); }}
            className='flex flex-col items-center text-sm text-gray-600 transition-all'
          >
            <Icon name='bx-grid-alt' className='text-2xl' />
            <Typography variant='p' className='mt-1 text-xs'>Más</Typography>
          </button>
        </Box>
      </Box>
    </>
  );
};

export default MobileHeaderLayout;
