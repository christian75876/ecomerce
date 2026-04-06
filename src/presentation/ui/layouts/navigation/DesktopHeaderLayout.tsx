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
    <Box className='w-full flex items-center justify-between px-8 py-4'>
      <LogoWithText title='Hot' subtitle='Ecomerce' size='sm' />
      <NavigationMenu />
      <Box className='flex items-center gap-4'>
        {showAdminActions ? <NotificationDropdown /> : null}
        {authenticated ? (
          <Box className='hidden rounded-full bg-neutral-dark/5 px-3 py-2 text-sm font-medium text-neutral-dark/70 md:block'>
            {roleLabel === 'buyer' ? 'Comprador' : 'Panel de tienda'}
          </Box>
        ) : null}
        {authenticated ? (
          <button
            className='p-2 rounded-full bg-gray-200'
            onClick={handleLogout}
          >
            👤 Logout
          </button>
        ) : (
          <button
            className='p-2 rounded-full bg-gray-200'
            onClick={() => navigate(`${ROUTES.PUBLIC.LOGIN}`)}
          >
            👤 Login
          </button>
        )}
      </Box>
    </Box>
  );
};

export default DesktopHeaderLayout;
