// Entrada SSR para scripts/prerender.mjs: renderiza a HTML estático las
// páginas públicas que no dependen de la API, con los mismos componentes que
// ve el usuario. El Worker sirve ese HTML a los bots que no ejecutan JS, así
// que el contenido nunca se desincroniza de la página real.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from '@/presentation/pages/public/landing/LandingPage';
import HelpPage from '@/presentation/pages/public/help/HelpPage';
import TermsPage from '@/presentation/pages/public/legal/TermsPage';
import PrivacyPage from '@/presentation/pages/public/legal/PrivacyPage';

// standalone: la página trae su propio nav y footer (LandingPage). Las demás
// se montan dentro del layout de la app, así que el Worker les agrega uno.
export const PAGES = {
  '/bienvenida': { Page: LandingPage, standalone: true },
  '/ayuda': { Page: HelpPage, standalone: false },
  '/terminos': { Page: TermsPage, standalone: false },
  '/privacidad': { Page: PrivacyPage, standalone: false },
} as const;

export function render(path: keyof typeof PAGES): string {
  const { Page } = PAGES[path];
  return renderToString(
    <HelmetProvider context={{}}>
      <StaticRouter location={path}>
        <Page />
      </StaticRouter>
    </HelmetProvider>,
  );
}
