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
      className={`min-h-screen flex flex-col ${hasGradient ? 'gradient-dashboard' : ''}`}
    >
      {isMobile ? <MobileHeaderLayout /> : <DesktopHeaderLayout />}

      <main className={`flex-1 p-6 ${isMobile ? 'pb-25' : ''}`}>
        {children}
      </main>
    </Box>
  );
};

export default DashboardLayout;
