import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App';

//Styled imports
import '@assets/styles/index.css';
import '@assets/styles/palette.tailwind.css';
import 'react-day-picker/dist/style.css'; 
import 'boxicons/css/boxicons.min.css';


import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedRefresh() {},
  onOfflineReady() {},
  onRegisterError(e) {
    console.error('[SW] Error al registrar:', e);
  },
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
