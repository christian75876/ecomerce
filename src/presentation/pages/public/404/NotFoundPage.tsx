import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

const NotFoundPage = () => {
  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center'>
      <div className='mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/8'>
        <span className='text-6xl'>🔍</span>
      </div>

      <p className='mb-2 text-sm font-bold uppercase tracking-[0.3em] text-primary/60'>
        Error 404
      </p>
      <h1 className='mb-4 text-4xl font-extrabold tracking-tight text-neutral-dark sm:text-5xl'>
        Página no encontrada
      </h1>
      <p className='mb-8 max-w-md text-base text-neutral-dark/60'>
        El enlace que seguiste no existe o fue movido. Puede que la dirección esté mal escrita o que el producto ya no esté disponible.
      </p>

      <div className='flex flex-wrap justify-center gap-3'>
        <Link
          to={ROUTES.PUBLIC.HOME}
          className='flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark active:scale-95'
        >
          <i className='bx bx-home text-base' aria-hidden='true' />
          Ir al inicio
        </Link>
        <button
          type='button'
          onClick={() => window.history.back()}
          className='flex items-center gap-2 rounded-2xl border border-neutral-gray/40 bg-white px-6 py-3 text-sm font-bold text-neutral-dark/70 shadow-sm transition hover:border-primary/30 hover:text-primary active:scale-95'
        >
          <i className='bx bx-arrow-back text-base' aria-hidden='true' />
          Volver atrás
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
