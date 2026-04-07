import { useLogout } from '@/application/useCases/auth/useLogout';
import LogoWithText from '@/presentation/ui/molecules/common/LogoWithText';
import { ROUTES } from '@/shared/constants/routes';
import {
  canAccessAdminPanel,
  getAuthenticatedRole,
  isAuthenticated,
} from '@/shared/utils/checkIsUserAuthenticated.util';

import Box from '@atoms/box/SimpleBox';
import NavigationMenu from '@molecules/navigation/NavigationMenu';
import NotificationDropdown from '@organisms/notifications/NotificationDropdown';
import { useNavigate } from 'react-router-dom';

const DesktopHeaderLayout = () => {
  const navigate = useNavigate();
  const { handleLogout } = useLogout();
  const authenticated = isAuthenticated();
  const showAdminActions = authenticated && canAccessAdminPanel();
  const roleLabel = getAuthenticatedRole();

  return (
    <Box className='surface-card sticky top-3 z-40 mx-auto mt-3 flex w-full items-center justify-between rounded-[1.6rem] px-4 py-3 sm:px-6'>
      <LogoWithText title='Hot' subtitle='Ecomerce' size='sm' />
      <NavigationMenu />
      <Box className='flex items-center gap-4'>
        {showAdminActions ? <NotificationDropdown /> : null}
        {authenticated ? (
          <Box className='hidden rounded-full bg-neutral-dark/5 px-3 py-2 text-sm font-medium text-neutral-dark/70 md:block'>
            {roleLabel === 'buyer' ? 'Comprador' : 'Operación interna'}
          </Box>
        ) : null}
        {authenticated ? (
          <button
            className='rounded-full bg-neutral-dark/5 px-3 py-2 text-sm font-semibold text-neutral-dark/75 transition hover:bg-neutral-dark/10'
            onClick={handleLogout}
          >
            Salir
          </button>
        ) : (
          <button
            className='rounded-full bg-neutral-dark/5 px-3 py-2 text-sm font-semibold text-neutral-dark/75 transition hover:bg-neutral-dark/10'
            onClick={() => navigate(`${ROUTES.PUBLIC.LOGIN}`)}
          >
            Entrar
          </button>
        )}
      </Box>
    </Box>
  );
};

export default DesktopHeaderLayout;
