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
import { useLogout } from '@/application/useCases/auth/useLogout';
import { authSession } from '@/shared/utils/authSession';

// ── Nav item definitions ──────────────────────────────────────────────────────

const adminRolePrimaryNavItems = [
  { label: 'Suscripciones', path: ROUTES.PRIVATE.SUBSCRIPTIONS, icon: 'bx-badge-check'   },
  { label: 'Invitaciones',  path: ROUTES.PRIVATE.INVITATIONS,   icon: 'bx-envelope'      },
  { label: 'Auditoría',     path: ROUTES.PRIVATE.AUDIT,         icon: 'bx-shield-quarter' },
];

const sellerPrimaryNavItems = [
  { label: 'Inicio',   path: ROUTES.PRIVATE.DASHBOARD, icon: 'bx-home'        },
  { label: 'POS',      path: ROUTES.PRIVATE.POS,       icon: 'bx-credit-card' },
  { label: 'Pedidos',  path: ROUTES.PRIVATE.ORDERS,    icon: 'bx-receipt'     },
];

// Admin "Más" — Control section (primary, always visible)
const adminControlItems = [
  { label: 'Suscripciones', path: ROUTES.PRIVATE.SUBSCRIPTIONS, icon: 'bx-badge-check'      },
  { label: 'Publicidad',    path: ROUTES.PRIVATE.ADVERTISING,   icon: 'bx-bulb'             },
  { label: 'Invitaciones',  path: ROUTES.PRIVATE.INVITATIONS,   icon: 'bx-envelope'         },
  { label: 'Auditoría',     path: ROUTES.PRIVATE.AUDIT,         icon: 'bx-shield-quarter'   },
  { label: 'Ajustes',       path: ROUTES.PRIVATE.SETTINGS,      icon: 'bx-cog'              },
];

// Admin "Más" — Tiendas section (collapsible)
const adminStoreItems = [
  { label: 'Dashboard',          path: ROUTES.PRIVATE.DASHBOARD,     icon: 'bx-home-alt-2'    },
  { label: 'Tienda',             path: ROUTES.PRIVATE.STORES,        icon: 'bx-store'         },
  { label: 'Productos',          path: ROUTES.PRIVATE.PRODUCTS,      icon: 'bx-shopping-bag'  },
  { label: 'Categorías',         path: ROUTES.PRIVATE.CATEGORIES,    icon: 'bx-category'      },
  { label: 'Inventario',         path: ROUTES.PRIVATE.INVENTORY,     icon: 'bx-box'           },
  { label: 'POS',                path: ROUTES.PRIVATE.POS,           icon: 'bx-credit-card'   },
  { label: 'Pedidos',            path: ROUTES.PRIVATE.ORDERS,        icon: 'bx-receipt'       },
  { label: 'Historial ventas',   path: ROUTES.PRIVATE.SALES_HISTORY, icon: 'bx-history'       },
  { label: 'Proveedores',        path: ROUTES.PRIVATE.SUPPLIERS,     icon: 'bx-briefcase'     },
  { label: 'Compras',            path: ROUTES.PRIVATE.PURCHASES,     icon: 'bx-package'       },
  { label: 'Clientes y cartera', path: ROUTES.PRIVATE.CUSTOMERS,     icon: 'bx-group'         },
  { label: 'Cupones',            path: ROUTES.PRIVATE.COUPONS,       icon: 'bx-purchase-tag'  },
];

// Seller "Más" — flat grid (unchanged)
const sellerMoreNavItems = [
  { label: 'Tienda',             path: ROUTES.PRIVATE.STORES,        icon: 'bx-store'         },
  { label: 'Productos',          path: ROUTES.PRIVATE.PRODUCTS,      icon: 'bx-shopping-bag'  },
  { label: 'Categorías',         path: ROUTES.PRIVATE.CATEGORIES,    icon: 'bx-category'      },
  { label: 'Inventario',         path: ROUTES.PRIVATE.INVENTORY,     icon: 'bx-box'           },
  { label: 'Historial ventas',   path: ROUTES.PRIVATE.SALES_HISTORY, icon: 'bx-history'       },
  { label: 'Clientes y cartera', path: ROUTES.PRIVATE.CUSTOMERS,     icon: 'bx-group'         },
  { label: 'Compras',            path: ROUTES.PRIVATE.PURCHASES,     icon: 'bx-package'       },
  { label: 'Proveedores',        path: ROUTES.PRIVATE.SUPPLIERS,     icon: 'bx-briefcase'     },
  { label: 'Cupones',            path: ROUTES.PRIVATE.COUPONS,       icon: 'bx-purchase-tag'  },
  { label: 'Auditoría',          path: ROUTES.PRIVATE.AUDIT,         icon: 'bx-shield-quarter' },
  { label: 'Ajustes',            path: ROUTES.PRIVATE.SETTINGS,      icon: 'bx-cog'           },
  { label: 'Ayuda',              path: ROUTES.PUBLIC.HELP,            icon: 'bx-help-circle'   },
];

const publicPrimaryNavItems = [
  { label: 'Inicio',   path: ROUTES.PUBLIC.HOME,       icon: 'bx-home'    },
  { label: 'Tiendas',  path: ROUTES.PUBLIC.STORES,     icon: 'bx-store'   },
  { label: 'Mapa',     path: ROUTES.PUBLIC.STORE_MAP,  icon: 'bx-map-alt' },
  { label: 'Carrito',  path: ROUTES.PUBLIC.CART,       icon: 'bx-cart'    },
];

const publicMoreNavItems = [
  { label: 'Favoritos',   path: ROUTES.PUBLIC.FAVORITES,   icon: 'bx-heart'       },
  { label: 'Mis pedidos', path: ROUTES.PUBLIC.MY_ORDERS,   icon: 'bx-receipt'     },
  { label: 'Entrar',      path: ROUTES.PUBLIC.LOGIN,        icon: 'bx-user'        },
  { label: 'Ayuda',       path: ROUTES.PUBLIC.HELP,         icon: 'bx-help-circle' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Ahora mismo';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
};

type NavItem = { label: string; path: string; icon: string };

function NavGrid({ items, onClose }: { items: NavItem[]; onClose: () => void }) {
  return (
    <div className='grid grid-cols-2 gap-2'>
      {items.map(({ label, path, icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onClose}
          className='flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-sm font-medium text-neutral-dark/75'
        >
          <Icon name={icon} className='text-xl' />
          {label}
        </NavLink>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const MobileHeaderLayout = () => {
  const [showMore, setShowMore] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [storesOpen, setStoresOpen] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(showMore ? 'mobile-nav-more-open' : 'mobile-nav-more-close'));
  }, [showMore]);

  // Reset stores section when panel closes
  useEffect(() => {
    if (!showMore) setStoresOpen(false);
  }, [showMore]);

  const adminView = isAuthenticated() && canAccessAdminPanel();
  const adminRole = isAdminRole();
  const { unreadCount, notifications, markAllRead, markRead } = useOrderNotifications();
  const { items: cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const buyerView = isBuyerSession();
  const { handleLogout, isLoading: loggingOut } = useLogout();
  const currentUser = authSession.getUser();

  const primaryNavItems = adminView
    ? (adminRole ? adminRolePrimaryNavItems : sellerPrimaryNavItems)
    : publicPrimaryNavItems;

  const closeAll = () => { setShowMore(false); setShowNotifPanel(false); };

  const displayName = currentUser?.customer
    ? `${currentUser.customer.firstName} ${currentUser.customer.lastName}`.trim()
    : currentUser?.email ?? '';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const handleLogoutAndClose = async () => {
    closeAll();
    await handleLogout();
  };

  return (
    <>
      {/* ── Notification panel (admin only) ── */}
      {showNotifPanel ? (
        <Box className='fixed inset-0 z-50 bg-neutral-dark/35 backdrop-blur-[2px]' onClick={closeAll}>
          <Box
            className='absolute inset-x-3 bottom-24 max-h-[70vh] overflow-hidden rounded-[1.75rem] border border-neutral-gray/20 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
            onClick={(e) => e.stopPropagation()}
          >
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

            <Box className='overflow-y-auto' style={{ maxHeight: 'calc(70vh - 64px)' }}>
              {notifications.length === 0 ? (
                <Box className='flex flex-col items-center py-12 text-center'>
                  <i className='bx bx-bell-off mb-3 text-4xl text-slate-200' aria-hidden='true' />
                  <p className='text-sm font-medium text-slate-400'>Sin notificaciones</p>
                  <p className='mt-1 text-xs text-slate-300'>
                    {adminRole ? 'Los registros e invitaciones aceptadas aparecerán aquí' : 'Los pedidos nuevos aparecerán aquí'}
                  </p>
                </Box>
              ) : (
                notifications.map((n) => {
                  const rowCls = `flex items-start gap-3 border-b border-slate-50 px-5 py-4 last:border-0 transition-colors hover:bg-slate-50 ${!n.read ? 'bg-primary/[0.04]' : ''}`;
                  const iconBoxCls = `mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!n.read ? 'bg-primary/10' : 'bg-slate-100'}`;
                  const iconCls = `text-base ${!n.read ? 'text-primary' : 'text-slate-400'}`;

                  if (n.type === 'new_order') {
                    return (
                      <NavLink key={n.id} to={ROUTES.PRIVATE.ORDERS} onClick={() => { markRead(n.id); closeAll(); }} className={rowCls}>
                        <Box className={iconBoxCls}><i className={`bx bx-receipt ${iconCls}`} aria-hidden='true' /></Box>
                        <Box className='min-w-0 flex-1'>
                          <p className='text-sm font-semibold text-slate-800'>Nuevo pedido · {n.itemCount} {n.itemCount === 1 ? 'artículo' : 'artículos'}</p>
                          <p className='mt-0.5 truncate text-xs text-slate-500'>{n.customerName} · {formatCurrencyCOP(n.total)}</p>
                          {n.deliveryMethod ? (
                            <p className='mt-0.5 text-[11px] text-slate-400'>{n.deliveryMethod === 'DELIVERY' ? '🚗 Domicilio' : '🏪 Recogida en tienda'}</p>
                          ) : null}
                          <p className='mt-1 text-[11px] text-slate-400'>{timeAgo(n.createdAt)}</p>
                        </Box>
                        {!n.read ? <span className='mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary' /> : null}
                      </NavLink>
                    );
                  }

                  if (n.type === 'invitation_accepted') {
                    return (
                      <NavLink key={n.id} to={ROUTES.PRIVATE.INVITATIONS} onClick={() => { markRead(n.id); closeAll(); }} className={rowCls}>
                        <Box className={iconBoxCls}><i className={`bx bx-store ${iconCls}`} aria-hidden='true' /></Box>
                        <Box className='min-w-0 flex-1'>
                          <p className='text-sm font-semibold text-slate-800'>Invitación aceptada</p>
                          <p className='mt-0.5 truncate text-xs text-slate-500'>{n.firstName} {n.lastName}</p>
                          <p className='truncate text-xs text-slate-400'>Tienda: {n.storeName}</p>
                          <p className='mt-1 text-[11px] text-slate-400'>{timeAgo(n.createdAt)}</p>
                        </Box>
                        {!n.read ? <span className='mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary' /> : null}
                      </NavLink>
                    );
                  }

                  return (
                    <NavLink key={n.id} to={ROUTES.PRIVATE.CUSTOMERS} onClick={() => { markRead(n.id); closeAll(); }} className={rowCls}>
                      <Box className={iconBoxCls}><i className={`bx bx-user-plus ${iconCls}`} aria-hidden='true' /></Box>
                      <Box className='min-w-0 flex-1'>
                        <p className='text-sm font-semibold text-slate-800'>Nuevo usuario registrado</p>
                        <p className='mt-0.5 truncate text-xs text-slate-500'>{n.firstName} {n.lastName}</p>
                        <p className='truncate text-xs text-slate-400'>{n.email}</p>
                        <p className='mt-1 text-[11px] text-slate-400'>{timeAgo(n.createdAt)}</p>
                      </Box>
                      {!n.read ? <span className='mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary' /> : null}
                    </NavLink>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      ) : null}

      {/* ── More panel ── */}
      {showMore ? (
        <Box className='fixed inset-0 z-50 bg-neutral-dark/35 backdrop-blur-[2px]' onClick={closeAll}>
          <Box
            className='absolute inset-x-3 bottom-24 max-h-[74vh] overflow-y-auto rounded-[1.75rem] border border-neutral-gray/20 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
            onClick={(e) => e.stopPropagation()}
          >
            {adminRole ? (
              /* ── Admin structured view ── */
              <div className='space-y-4'>
                {/* Control section */}
                <div>
                  <p className='mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400'>
                    Control
                  </p>
                  <NavGrid items={adminControlItems} onClose={closeAll} />
                </div>

                {/* Tiendas collapsible */}
                <div>
                  <button
                    type='button'
                    onClick={() => setStoresOpen((v) => !v)}
                    className='flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                  >
                    <Icon name='bx-store' className='text-xl text-slate-500' />
                    <span className='flex-1 text-left'>Tiendas</span>
                    {unreadCount > 0 && !storesOpen ? (
                      <span className='flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white'>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    ) : null}
                    <i
                      className={`bx text-base text-slate-400 transition-transform duration-200 ${storesOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`}
                      aria-hidden='true'
                    />
                  </button>

                  {storesOpen ? (
                    <div className='mt-2 rounded-2xl border border-slate-100 p-2'>
                      <NavGrid items={adminStoreItems} onClose={closeAll} />
                    </div>
                  ) : null}
                </div>

                {/* Help */}
                <NavLink
                  to={ROUTES.PUBLIC.HELP}
                  onClick={closeAll}
                  className='flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-sm font-medium text-neutral-dark/75'
                >
                  <Icon name='bx-help-circle' className='text-xl' />
                  Ayuda
                </NavLink>
              </div>
            ) : adminView ? (
              /* ── Seller flat view ── */
              <>
                <Typography variant='h3'>Más opciones</Typography>
                <Box className='mt-4'>
                  <NavGrid items={sellerMoreNavItems} onClose={closeAll} />
                </Box>
              </>
            ) : (
              /* ── Public / buyer view ── */
              <>
                <Typography variant='h3'>Más opciones</Typography>
                <Box className='mt-4'>
                  <NavGrid
                    items={publicMoreNavItems.filter((item) => {
                      if (isAuthenticated() && item.path === ROUTES.PUBLIC.LOGIN) return false;
                      if (!isAuthenticated() && (item.path === ROUTES.PUBLIC.FAVORITES || item.path === ROUTES.PUBLIC.MY_ORDERS)) return false;
                      if (item.path === ROUTES.PUBLIC.MY_ORDERS && !buyerView) return false;
                      return true;
                    })}
                    onClose={closeAll}
                  />
                </Box>
              </>
            )}

            {/* ── Profile card + logout (all authenticated users) ── */}
            {isAuthenticated() ? (
              <div className='mt-2 border-t border-slate-100 pt-3'>
                {/* User info */}
                <div className='flex items-center gap-3 rounded-2xl px-3 py-2.5'>
                  <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary'>
                    {initials || <i className='bx bx-user text-lg' aria-hidden='true' />}
                  </div>
                  <div className='min-w-0 flex-1'>
                    {displayName ? (
                      <p className='truncate text-sm font-semibold text-slate-800'>{displayName}</p>
                    ) : null}
                    <p className='truncate text-xs text-slate-400'>{currentUser?.email ?? ''}</p>
                  </div>
                </div>

                {/* Profile link */}
                <NavLink
                  to={ROUTES.PRIVATE.PROFILE}
                  onClick={closeAll}
                  className='mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50'
                >
                  <i className='bx bx-user-circle text-xl text-slate-400' aria-hidden='true' />
                  Mi perfil
                  <i className='bx bx-chevron-right ml-auto text-slate-300' aria-hidden='true' />
                </NavLink>

                {/* Logout */}
                <button
                  type='button'
                  disabled={loggingOut}
                  onClick={() => void handleLogoutAndClose()}
                  className='mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50'
                >
                  <i className='bx bx-log-out text-xl' aria-hidden='true' />
                  {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </button>
              </div>
            ) : null}
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

          {/* Bell — admin/seller only */}
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
