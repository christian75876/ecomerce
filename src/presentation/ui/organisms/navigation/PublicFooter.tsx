import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

// Footer del marketplace público. Además de navegación, da enlaces internos
// rastreables a páginas que antes casi no recibían ninguno (la landing
// /bienvenida solo aparecía en el sitemap; Términos/Privacidad/Ayuda solo
// desde el registro o el panel de admin).
const PublicFooter = ({ isMobile }: { isMobile: boolean }) => (
  <footer className={`border-t border-slate-100 bg-white ${isMobile ? 'pt-8 pb-28' : 'py-10'}`}>
    <div className='mx-auto flex max-w-[1440px] flex-col gap-6 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between'>
      <div className='max-w-sm'>
        <p className='text-lg font-black text-slate-800'>Merku</p>
        <p className='mt-1 text-sm text-slate-500'>
          Marketplace de tiendas y restaurantes locales en Colombia.
        </p>
      </div>

      <nav aria-label='Enlaces del sitio' className='flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500'>
        <Link to={ROUTES.PUBLIC.HOME} className='hover:text-primary'>Productos</Link>
        <Link to={ROUTES.PUBLIC.STORES} className='hover:text-primary'>Tiendas</Link>
        <Link to={ROUTES.PUBLIC.STORE_MAP} className='hover:text-primary'>Mapa de tiendas</Link>
        <Link to={ROUTES.PUBLIC.LANDING} className='hover:text-primary'>Vende en Merku</Link>
        <Link to={ROUTES.PUBLIC.HELP} className='hover:text-primary'>Ayuda</Link>
        <Link to={ROUTES.PUBLIC.TERMS} className='hover:text-primary'>Términos</Link>
        <Link to={ROUTES.PUBLIC.PRIVACY} className='hover:text-primary'>Privacidad</Link>
      </nav>

      <p className='text-xs text-slate-400'>© {new Date().getFullYear()} Merku. Hecho en Colombia 🇨🇴</p>
    </div>
  </footer>
);

export default PublicFooter;
