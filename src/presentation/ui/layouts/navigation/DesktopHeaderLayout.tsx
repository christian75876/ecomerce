import { useLogout } from '@/application/useCases/auth/useLogout';
import LogoWithText from '@/presentation/ui/molecules/common/LogoWithText';
import { ROUTES } from '@/shared/constants/routes';
import {
  canAccessAdminPanel,
  getAuthenticatedRole,
  isAuthenticated,
} from '@/shared/utils/checkIsUserAuthenticated.util';
import { useCart } from '@/shared/hooks/useCart';

import Box from '@atoms/box/SimpleBox';
import NavigationMenu from '@molecules/navigation/NavigationMenu';
import NotificationDropdown from '@organisms/notifications/NotificationDropdown';
import { Link, useNavigate } from 'react-router-dom';

const roleChip = (role: string | null) => {
  if (role === 'buyer')  return { label: 'Comprador', icon: 'bx-user',    bg: 'bg-sky-50   text-sky-700   ring-1 ring-sky-200' };
  if (role === 'admin')  return { label: 'Admin',     icon: 'bxs-crown',  bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' };
  return                        { label: 'Vendedor',  icon: 'bx-store',   bg: 'bg-blue-50  text-blue-700  ring-1 ring-blue-200' };
};

const DesktopHeaderLayout = () => {
  const navigate = useNavigate();
  const { handleLogout } = useLogout();
  const authenticated = isAuthenticated();
  const showAdminActions = authenticated && canAccessAdminPanel();
  const isBuyer = getAuthenticatedRole() === 'buyer' || !canAccessAdminPanel();
  const roleLabel = getAuthenticatedRole();
  const chip = roleChip(roleLabel);
  const { items } = useCart();
  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Box className='fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/97 backdrop-blur-sm'>
      <Box className='mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6'>
        {/* Logo */}
        <Box className='flex-shrink-0'>
          <Link to={authenticated && !isBuyer ? ROUTES.PRIVATE.DASHBOARD : ROUTES.PUBLIC.HOME}>
            <LogoWithText title='Hot' subtitle='' size='sm' />
          </Link>
        </Box>

        {/* Navigation */}
        <Box className='flex-1 overflow-x-clip'>
          <NavigationMenu />
        </Box>

        {/* Right actions */}
        <Box className='flex flex-shrink-0 items-center gap-2'>
          {showAdminActions ? <NotificationDropdown /> : null}

          {/* Cart button — solo buyers */}
          {(!authenticated || isBuyer) ? (
            <Link
              to={ROUTES.PUBLIC.CART}
              className='relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary/30 hover:text-primary'
              aria-label='Carrito'
            >
              <i className='bx bx-cart text-lg' aria-hidden='true' />
              {cartCount > 0 ? (
                <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white'>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              ) : null}
            </Link>
          ) : null}

          {/* Role chip */}
          {authenticated ? (
            <span className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold md:flex ${chip.bg}`}>
              <i className={`bx ${chip.icon} text-sm`} aria-hidden='true' />
              {chip.label}
            </span>
          ) : null}

          {/* Help link */}
          <Link
            to={ROUTES.PUBLIC.HELP}
            className='flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-primary/30 hover:text-primary'
            aria-label='Ayuda'
          >
            <i className='bx bx-help-circle text-lg' aria-hidden='true' />
          </Link>

          {/* Profile button */}
          {authenticated ? (
            <Link
              to={ROUTES.PRIVATE.PROFILE}
              className='flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary/30 hover:text-primary'
              aria-label='Mi perfil'
            >
              <i className='bx bx-user text-lg' aria-hidden='true' />
            </Link>
          ) : null}

          {/* Auth button */}
          {authenticated ? (
            <button
              className='flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition-all duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95'
              onClick={handleLogout}
            >
              <i className='bx bx-log-out text-base' aria-hidden='true' />
              <span className='hidden sm:inline'>Salir</span>
            </button>
          ) : (
            <button
              className='flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-primary-dark active:scale-95'
              onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
            >
              <i className='bx bx-log-in text-base' aria-hidden='true' />
              Entrar
            </button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DesktopHeaderLayout;
