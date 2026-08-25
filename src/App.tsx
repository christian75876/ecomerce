import { useEffect, useState } from 'react';
import { useTokenRefresh } from '@/shared/hooks/useTokenRefresh';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';
import { useBuyerOrderNotifications } from '@/shared/hooks/useBuyerOrderNotifications';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SnackbarProvider } from 'notistack';

import AppRouter from '@presentation/routes/AppRouter';
import { SnackbarUtilitiesConfigurator } from '@shared/utils/SnackbarManager';
import OfflineIndicator from '@molecules/common/OfflineIndicator';
import PwaInstallBanner from '@molecules/common/PwaInstallBanner';
import NotificationToast from '@molecules/common/NotificationToast';
import AppBlockedScreen from '@molecules/common/AppBlockedScreen';
import { OrderNotificationsProvider } from '@/shared/contexts/OrderNotificationsContext';
import { AdminStoreProvider } from '@/shared/contexts/AdminStoreContext';
import { AppConfigRepository, type IAppConfig } from '@/infrastructure/repositories/api/app-config/AppConfigRepository';
import { canAccessAdminPanel } from '@/shared/utils/checkIsUserAuthenticated.util';

function App() {
  useTokenRefresh();
  usePushNotifications();
  useBuyerOrderNotifications();
  const [appConfig, setAppConfig] = useState<IAppConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await AppConfigRepository.getConfig();
        setAppConfig(config);
      } catch {
        setAppConfig({
          isAccessBlocked: false,
          blockedMessage: null,
          updatedAt: ''
        });
      }
    };
    void loadConfig();
  }, []);

  // Admins always bypass the block so they can re-enable the app
  const isBlocked = appConfig?.isAccessBlocked && !canAccessAdminPanel();

  if (isBlocked) {
    return <AppBlockedScreen message={appConfig?.blockedMessage} />;
  }

  return (
    <BrowserRouter>
      <HelmetProvider>
        <SnackbarProvider maxSnack={3} autoHideDuration={2500} preventDuplicate>
          <SnackbarUtilitiesConfigurator />
          <AdminStoreProvider>
            <OrderNotificationsProvider>
              <OfflineIndicator />
              <AppRouter />
              <PwaInstallBanner />
              <NotificationToast />
            </OrderNotificationsProvider>
          </AdminStoreProvider>
        </SnackbarProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;
