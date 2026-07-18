import { useIsMobile } from '@shared/hooks/useIsMobile';

import Box from '@atoms/box/SimpleBox';
import MobileHeaderLayout from '@presentation/ui/layouts/navigation/MobileHeaderLayout';
import DesktopHeaderLayout from '@presentation/ui/layouts/navigation/DesktopHeaderLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
  hasGradient?: boolean;
}

const DashboardLayout = ({
  children,
  hasGradient = false
}: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <Box
      className={`min-h-screen w-full flex flex-col ${hasGradient ? 'gradient-dashboard' : ''}`}
    >
      {isMobile ? <MobileHeaderLayout /> : <DesktopHeaderLayout />}

      <main
        className={`mx-auto flex-1 w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-6 pb-24' : 'pt-20 pb-10'}`}
      >
        {children}
      </main>
    </Box>
  );
};

export default DashboardLayout;
