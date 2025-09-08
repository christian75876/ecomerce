import { SnackbarProvider } from 'notistack';

import AppRouter from '@presentation/routes/AppRouter';
import { SnackbarUtilitiesConfigurator } from '@shared/utils/SnackbarManager';

function App() {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={2500} preventDuplicate>
      <SnackbarUtilitiesConfigurator />
      <AppRouter />
    </SnackbarProvider>
  );
}

export default App;
