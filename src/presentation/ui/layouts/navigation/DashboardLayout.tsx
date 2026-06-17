import { useIsMobile } from '@shared/hooks/useIsMobile';
import { AdminStoreFilterProvider, useAdminStoreFilterContext } from '@/shared/context/AdminStoreFilterContext';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { useLogout } from '@/application/useCases/auth/useLogout';

import Box from '@atoms/box/SimpleBox';
import MobileHeaderLayout from '@presentation/ui/layouts/navigation/MobileHeaderLayout';
import DesktopHeaderLayout from '@presentation/ui/layouts/navigation/DesktopHeaderLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
  hasGradient?: boolean;
}

const BlockedStoreScreen = () => {
  const { handleLogout } = useLogout();
  return (
    <Box className='flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center'>
      <Box className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
        <i className='bx bx-block text-4xl text-red-500' />
      </Box>
      <h1 className='text-2xl font-bold text-neutral-dark'>Acceso suspendido</h1>
      <p className='mt-3 max-w-sm text-slate-500'>
        Tu tienda ha sido suspendida por falta de pago. Comunícate con el administrador de la plataforma para reactivar tu acceso.
      </p>
      <button
        onClick={handleLogout}
        className='mt-8 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm hover:bg-red-50 hover:text-red-600'
      >
        <i className='bx bx-log-out text-base' />
        Cerrar sesión
      </button>
    </Box>
  );
};

const DashboardContent = ({ children, hasGradient, isMobile }: { children: React.ReactNode; hasGradient: boolean; isMobile: boolean }) => {
  const role = getAuthenticatedRole();
  const { stores, selectedStore } = useAdminStoreFilterContext();

  if (role === 'seller' && stores.length > 0 && selectedStore && !selectedStore.isActive) {
    return <BlockedStoreScreen />;
  }

  return (
    <Box className={`min-h-screen w-full flex flex-col ${hasGradient ? 'gradient-dashboard' : ''}`}>
      {isMobile ? <MobileHeaderLayout /> : <DesktopHeaderLayout />}
      <main className={`mx-auto flex-1 w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 ${isMobile ? 'pb-24' : 'pb-10'}`}>
        {children}
      </main>
    </Box>
  );
};

const DashboardLayout = ({ children, hasGradient = false }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <AdminStoreFilterProvider>
      <DashboardContent hasGradient={hasGradient} isMobile={isMobile}>
        {children}
      </DashboardContent>
    </AdminStoreFilterProvider>
  );
};

export default DashboardLayout;
