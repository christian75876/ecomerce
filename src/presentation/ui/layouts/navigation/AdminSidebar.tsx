import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import clsx from 'clsx';
import { ROUTES } from '@/shared/constants/routes';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { useLogout } from '@/application/useCases/auth/useLogout';
import { useOrderNotifications } from '@/shared/hooks/useOrderNotifications';
import StoreSearchSelector from '@/presentation/ui/molecules/navigation/StoreSearchSelector';
import NotificationDropdown from '@organisms/notifications/NotificationDropdown';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const dashboardGroup: NavGroup = {
  label: 'General',
  items: [
    { label: 'Dashboard', path: ROUTES.PRIVATE.DASHBOARD, icon: 'bx-home-alt-2' },
  ],
};

const controlGroup: NavGroup = {
  label: 'Control',
  items: [
    { label: 'Suscripciones', path: ROUTES.PRIVATE.SUBSCRIPTIONS, icon: 'bx-credit-card-front' },
    { label: 'Publicidad', path: ROUTES.PRIVATE.ADVERTISING, icon: 'bx-trophy' },
    { label: 'Invitaciones', path: ROUTES.PRIVATE.INVITATIONS, icon: 'bx-envelope' },
    { label: 'Auditoría', path: ROUTES.PRIVATE.AUDIT, icon: 'bx-shield-quarter' },
    { label: 'Ajustes', path: ROUTES.PRIVATE.SETTINGS, icon: 'bx-cog' },
  ],
};

const storeGroups: NavGroup[] = [
  {
    label: 'Catálogo',
    items: [
      { label: 'Tienda', path: ROUTES.PRIVATE.STORES, icon: 'bx-store' },
      { label: 'Productos', path: ROUTES.PRIVATE.PRODUCTS, icon: 'bx-shopping-bag' },
      { label: 'Categorías', path: ROUTES.PRIVATE.CATEGORIES, icon: 'bx-category' },
      { label: 'Inventario', path: ROUTES.PRIVATE.INVENTORY, icon: 'bx-box' },
    ],
  },
  {
    label: 'Operación',
    items: [
      { label: 'POS',               path: ROUTES.PRIVATE.POS,           icon: 'bx-credit-card' },
      { label: 'Pedidos',           path: ROUTES.PRIVATE.ORDERS,        icon: 'bx-receipt'     },
      { label: 'Historial ventas',  path: ROUTES.PRIVATE.SALES_HISTORY, icon: 'bx-history'     },
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
    items: [
      { label: 'Clientes y cartera', path: ROUTES.PRIVATE.CUSTOMERS, icon: 'bx-group' },
      { label: 'Cupones', path: ROUTES.PRIVATE.COUPONS, icon: 'bx-purchase-tag' },
    ],
  },
];

function NavGroupSection({ group, unreadCount }: { group: NavGroup; unreadCount: number }) {
  return (
    <div className='mb-4'>
      <p
        className='mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.15em]'
        style={{ color: 'rgba(148, 163, 184, 0.5)' }}
      >
        {group.label}
      </p>
      {group.items.map((item) => {
        const badge = item.path === ROUTES.PRIVATE.ORDERS && unreadCount > 0 ? unreadCount : 0;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150',
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200',
              )
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.3)',
                  }
                : undefined
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span
                    className='absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full'
                    style={{ background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }}
                  />
                ) : null}
                <i
                  className={`bx ${item.icon} text-base shrink-0`}
                  style={{ color: isActive ? '#818cf8' : undefined }}
                  aria-hidden='true'
                />
                <span className='flex-1 truncate'>{item.label}</span>
                {badge > 0 ? (
                  <span className='flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm'>
                    {badge > 9 ? '9+' : badge}
                  </span>
                ) : null}
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}

const AdminSidebar = () => {
  const { handleLogout } = useLogout();
  const role = getAuthenticatedRole();
  const isAdmin = role === 'admin';
  const { unreadCount } = useOrderNotifications();
  const [storesOpen, setStoresOpen] = useState(false);

  return (
    <aside
      className='fixed left-0 top-0 z-40 flex h-screen w-60 flex-col'
      style={{
        background: 'linear-gradient(180deg, #0e0c1e 0%, #13112a 60%, #111827 100%)',
        borderRight: '1px solid rgba(99, 102, 241, 0.12)',
      }}
    >
      {/* Brand */}
      <div className='flex items-center gap-3 px-4 py-5'>
        <div
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg'
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.45)' }}
        >
          <i className='bx bxs-crown text-lg text-white' aria-hidden='true' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-[13px] font-bold leading-tight text-white'>Merku</p>
          <p className='mt-0.5 text-[10px] font-medium uppercase tracking-widest' style={{ color: '#6366f1' }}>
            {isAdmin ? 'Administrador' : 'Vendedor'}
          </p>
        </div>
        <div className='shrink-0'>
          <NotificationDropdown dark align='left' />
        </div>
      </div>

      {/* Divider */}
      <div className='mx-4 mb-1' style={{ height: '1px', background: 'linear-gradient(90deg, rgba(99,102,241,0.25) 0%, transparent 100%)' }} />


      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto px-2 py-2' style={{ scrollbarWidth: 'none' }}>

        {isAdmin ? (
          <>
            {/* Control — primary section for admin, shown first */}
            <NavGroupSection group={controlGroup} unreadCount={unreadCount} />

            {/* Tiendas — collapsible secondary section */}
            <div className='mb-4'>
              <button
                type='button'
                onClick={() => setStoresOpen((v) => !v)}
                className='flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.05] hover:text-slate-200'
              >
                <i className='bx bx-store text-base shrink-0' aria-hidden='true' />
                <span className='flex-1 text-left'>Tiendas</span>
                {unreadCount > 0 && !storesOpen ? (
                  <span className='flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
                <i
                  className={clsx(
                    'bx text-xs shrink-0 transition-transform duration-200',
                    storesOpen ? 'bx-chevron-up' : 'bx-chevron-down',
                  )}
                  aria-hidden='true'
                />
              </button>

              {storesOpen ? (
                <div
                  className='mt-1 overflow-hidden rounded-xl px-1 py-2'
                  style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}
                >
                  <div className='px-2 pb-2 pt-1'>
                    <StoreSearchSelector dropdownClassName='left-0' />
                  </div>
                  <NavGroupSection group={dashboardGroup} unreadCount={unreadCount} />
                  {storeGroups.map((group) => (
                    <NavGroupSection key={group.label} group={group} unreadCount={unreadCount} />
                  ))}
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            {/* Seller view — flat list of all groups */}
            <NavGroupSection group={dashboardGroup} unreadCount={unreadCount} />
            {storeGroups.map((group) => (
              <NavGroupSection key={group.label} group={group} unreadCount={unreadCount} />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className='px-3 pb-4 pt-2'>
        <div className='mb-2' style={{ height: '1px', background: 'rgba(99, 102, 241, 0.12)' }} />

        <Link
          to={ROUTES.PRIVATE.PROFILE}
          className='flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200'
        >
          <div
            className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg'
            style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <i className='bx bx-user text-sm text-indigo-300' aria-hidden='true' />
          </div>
          <span className='flex-1 truncate'>Mi perfil</span>
        </Link>
        <button
          type='button'
          onClick={handleLogout}
          className='mt-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-400'
        >
          <i className='bx bx-log-out text-base' aria-hidden='true' />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
