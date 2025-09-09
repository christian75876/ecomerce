import { useLogout } from '@/application/useCases/auth/useLogout';
import LogoWithText from '@/presentation/ui/molecules/common/LogoWithText';
import { ROUTES } from '@/shared/constants/routes';
import { isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';

import Box from '@atoms/box/SimpleBox';
import NavigationMenu from '@molecules/navigation/NavigationMenu';
import NotificationDropdown from '@organisms/notifications/NotificationDropdown';
import { useNavigate } from 'react-router-dom';

const DesktopHeaderLayout = () => {
  const navigate = useNavigate();
  const { handleLogout, isLoading, error } = useLogout();

  return (
    <Box className='w-full flex items-center justify-between px-8 py-4'>
      {/* Logo */}
      <LogoWithText title='Hot' subtitle='Ecomerce' size='sm' />

      {/* Menú de Navegación */}
      <NavigationMenu />

      {/* Acciones (Notificaciones, Perfil) */}
      <Box className='flex items-center gap-4'>
        <NotificationDropdown />
        {isAuthenticated() ? (
          <button
            className='p-2 rounded-full bg-gray-200'
            onClick={handleLogout}
          >
            👤 {/* Foto de perfil */} Logout
          </button> //TODO: Confirm with a modal if user wants to logout
        ) : (
          <button
            className='p-2 rounded-full bg-gray-200'
            onClick={() => navigate(`${ROUTES.PUBLIC.LOGIN}`)}
          >
            👤 {/* Foto de perfil */} Login
          </button>
        )}
      </Box>
    </Box>
  );
};

export default DesktopHeaderLayout;
