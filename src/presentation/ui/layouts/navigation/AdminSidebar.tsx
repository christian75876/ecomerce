import { NavLink, Link } from 'react-router-dom';
import clsx from 'clsx';
import { ROUTES } from '@/shared/constants/routes';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { useLogout } from '@/application/useCases/auth/useLogout';
import { useOrderNotifications } from '@/shared/hooks/useOrderNotifications';
import StoreSearchSelector from '@/presentation/ui/molecules/navigation/StoreSearchSelector';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface NavGroup {
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard', path: ROUTES.PRIVATE.DASHBOARD, icon: 'bx-home' },
    ],
  },
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
    items: [
      { label: 'Clientes y cartera', path: ROUTES.PRIVATE.CUSTOMERS, icon: 'bx-group' },
      { label: 'Cupones', path: ROUTES.PRIVATE.COUPONS, icon: 'bx-purchase-tag' },
    ],
  },
  {
    label: 'Control',
    adminOnly: true,
    items: [
      { label: 'Suscripciones', path: ROUTES.PRIVATE.SUBSCRIPTIONS, icon: 'bx-credit-card-front' },
      { label: 'Publicidad', path: ROUTES.PRIVATE.ADVERTISING, icon: 'bx-trophy' },
      { label: 'Invitaciones', path: ROUTES.PRIVATE.INVITATIONS, icon: 'bx-envelope' },
      { label: 'Auditoría', path: ROUTES.PRIVATE.AUDIT, icon: 'bx-history' },
      { label: 'Ajustes', path: ROUTES.PRIVATE.SETTINGS, icon: 'bx-cog' },
    ],
  },
];

const AdminSidebar = () => {
  const { handleLogout } = useLogout();
  const role = getAuthenticatedRole();
  const isAdmin = role === 'admin';
  const { unreadCount } = useOrderNotifications();
  const visibleGroups = navGroups.filter((g) => !g.adminOnly || isAdmin);

  return (
    <aside className='fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-white/5 bg-slate-900'>
      {/* Brand */}
      <div className='flex items-center gap-3 border-b border-white/8 px-4 py-4'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-md'>
          <i className='bx bxs-crown text-xl text-white' aria-hidden='true' />
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-bold leading-none text-white'>Panel de control</p>
          <p className='mt-0.5 text-[10px] uppercase tracking-wider text-slate-400'>
            {isAdmin ? 'Administrador' : 'Vendedor'}
          </p>
        </div>
      </div>

      {/* Store selector — admin only */}
      {isAdmin ? (
        <div className='border-b border-white/8 px-3 py-3'>
          <StoreSearchSelector dropdownClassName='left-0' />
        </div>
      ) : null}

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto px-2 py-3' style={{ scrollbarWidth: 'none' }}>
        {visibleGroups.map((group) => (
          <div key={group.label} className='mb-4'>
            <p className='mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600'>
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
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-slate-400 hover:bg-white/10 hover:text-slate-100',
                    )
                  }
                >
                  <i className={`bx ${item.icon} text-base shrink-0`} aria-hidden='true' />
                  <span className='flex-1 truncate'>{item.label}</span>
                  {badge > 0 ? (
                    <span className='flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white'>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className='border-t border-white/8 px-3 py-3 space-y-0.5'>
        <Link
          to={ROUTES.PRIVATE.PROFILE}
          className='flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-slate-100'
        >
          <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/10'>
            <i className='bx bx-user text-xs text-slate-300' aria-hidden='true' />
          </div>
          <span className='flex-1 truncate'>Mi perfil</span>
        </Link>
        <button
          type='button'
          onClick={handleLogout}
          className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-500/15 hover:text-red-400'
        >
          <i className='bx bx-log-out text-base' aria-hidden='true' />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
