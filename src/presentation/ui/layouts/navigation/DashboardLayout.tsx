import { Suspense } from 'react';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { canAccessAdminPanel, isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';

import Box from '@atoms/box/SimpleBox';
import MobileHeaderLayout from '@presentation/ui/layouts/navigation/MobileHeaderLayout';
import DesktopHeaderLayout from '@presentation/ui/layouts/navigation/DesktopHeaderLayout';
import AdminSidebar from '@presentation/ui/layouts/navigation/AdminSidebar';

const ContentFallback = () => (
  <div className='flex min-h-[50vh] items-center justify-center'>
    <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
  </div>
);

interface DashboardLayoutProps {
  children: React.ReactNode;
  hasGradient?: boolean;
}

const DashboardLayout = ({
  children,
  hasGradient = false
}: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  const isAdminUser = isAuthenticated() && canAccessAdminPanel();

  // Admin desktop — sidebar layout
  if (!isMobile && isAdminUser) {
    return (
      <div
        className={`flex min-h-screen ${hasGradient ? 'gradient-dashboard' : ''}`}
        style={{ background: hasGradient ? undefined : '#f5f5fb' }}
      >
        <AdminSidebar />
        <main className='ml-60 flex-1 min-w-0 px-6 py-7 lg:px-8 lg:py-8'>
          <Suspense fallback={<ContentFallback />}>{children}</Suspense>
        </main>
      </div>
    );
  }

  // Mobile admin or public visitor — original top-bar layout
  return (
    <Box
      className={`min-h-screen w-full flex flex-col ${hasGradient ? 'gradient-dashboard' : ''}`}
    >
      {isMobile ? <MobileHeaderLayout /> : <DesktopHeaderLayout />}

      <main
        className={`mx-auto flex-1 w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-6 pb-24' : 'pt-20 pb-10'}`}
      >
        <Suspense fallback={<ContentFallback />}>{children}</Suspense>
      </main>
    </Box>
  );
};

export default DashboardLayout;
