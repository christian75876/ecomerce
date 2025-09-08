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
  onNeedRefresh() {
    console.log('Nueva versión disponible. Recarga para actualizar.');
  },
  onOfflineReady() {
    console.log('La aplicación está lista para usarse sin conexión.');
  }
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
