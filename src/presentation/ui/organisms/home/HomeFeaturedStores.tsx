import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import HomeSection from './HomeSection';

interface HomeFeaturedStoresProps {
  stores: IStore[];
}

const STORE_COLORS = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-700',
  'from-rose-500 to-pink-700',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-cyan-700',
];

const HomeFeaturedStores = ({ stores }: HomeFeaturedStoresProps) => {
  if (stores.length === 0) return null;

  return (
    <HomeSection
      title='Tiendas destacadas'
      subtitle='Comercios activos en el marketplace'
      action={
        <Link
          to={ROUTES.PUBLIC.STORES}
          className='text-sm font-semibold text-primary hover:text-primary-dark'
        >
          Ver todas →
        </Link>
      }
    >
      <div className='space-y-2'>
        {stores.map((store, idx) => {
          const gradient = STORE_COLORS[idx % STORE_COLORS.length];
          const initial = store.name.charAt(0).toUpperCase();

          return (
            <Link
              key={store.id}
              to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
              className='flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 transition-all hover:border-primary/25 hover:shadow-sm'
            >
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className='h-10 w-10 flex-shrink-0 rounded-xl object-cover'
                />
              ) : (
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-base font-bold text-white shadow-sm`}>
                  {initial}
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-slate-800'>{store.name}</p>
                <p className='truncate text-xs text-slate-400'>
                  {store.description || 'Ver productos →'}
                </p>
              </div>
              <i className='bx bx-chevron-right flex-shrink-0 text-lg text-slate-300' aria-hidden='true' />
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
};

export default HomeFeaturedStores;
