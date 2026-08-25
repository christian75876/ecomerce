import { useState } from 'react';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import HomeSection from './HomeSection';
import { Reveal } from '@/presentation/ui/molecules/common/Reveal';

interface HomeFeaturedStoresProps {
  stores: IStore[];
}

type StoreTab = 'all' | 'STORE' | 'RESTAURANT';

/** Logo-less store avatars rotate through 3 of the 4 Mercado accents —
 * banano is left out here because it's too light for white initials to
 * stay AA-legible against it; papaya/turquesa/guayaba all resolve toward
 * their AA-safe deep shade so white text stays readable. */
const STORE_COLORS = [
  'from-primary-light to-primary',
  'from-secondary-light to-secondary',
  'from-accent-light to-accent',
];

const HomeFeaturedStores = ({ stores }: HomeFeaturedStoresProps) => {
  const [activeTab, setActiveTab] = useState<StoreTab>('all');

  if (stores.length === 0) return null;

  const hasRestaurants = stores.some((s) => s.storeType === 'RESTAURANT');
  const hasRegularStores = stores.some((s) => s.storeType === 'STORE');
  const showTabs = hasRestaurants && hasRegularStores;

  const visible = activeTab === 'all' ? stores : stores.filter((s) => s.storeType === activeTab);

  const tabs: { value: StoreTab; label: string; icon: string }[] = [
    { value: 'all', label: 'Todas', icon: 'bx-store' },
    { value: 'STORE', label: 'Tiendas', icon: 'bx-shopping-bag' },
    { value: 'RESTAURANT', label: 'Restaurantes', icon: 'bx-restaurant' },
  ];

  return (
    <HomeSection
      title='Tiendas destacadas'
      subtitle='Comercios activos en Merku'
      action={
        <Link
          to={ROUTES.PUBLIC.STORES}
          className='text-sm font-semibold text-primary hover:text-primary-dark'
        >
          Ver todas →
        </Link>
      }
    >
      <div className='space-y-3'>
        {showTabs ? (
          <div className='flex gap-1.5'>
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type='button'
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === tab.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                <i className={`bx ${tab.icon} text-sm`} aria-hidden='true' />
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className='space-y-2'>
          {visible.map((store, idx) => {
            const gradient = STORE_COLORS[idx % STORE_COLORS.length];
            const initial = store.name.charAt(0).toUpperCase();

            return (
              <Reveal key={store.id} effect='fade-up' delay={Math.min(idx, 6) * 0.05}>
                <Link
                  to={ROUTES.PUBLIC.STORE_DETAILS.replace(':slug', store.slug)}
                  className='flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm'
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
                    <div className='flex items-center gap-1.5'>
                      <p className='truncate text-sm font-semibold text-slate-800'>{store.name}</p>
                      {store.storeType === 'RESTAURANT' ? (
                        <span className='flex-shrink-0 rounded-full bg-highlight px-1.5 py-0.5 text-[9px] font-bold text-neutral-dark'>
                          🍽️
                        </span>
                      ) : null}
                      {store.isAdultContent ? (
                        <span className='flex-shrink-0 rounded-full bg-error px-1.5 py-0.5 text-[9px] font-bold text-white'>
                          +18
                        </span>
                      ) : null}
                    </div>
                    <p className='truncate text-xs text-slate-400'>
                      {store.description || 'Ver productos →'}
                    </p>
                  </div>
                  <i className='bx bx-chevron-right flex-shrink-0 text-lg text-slate-300' aria-hidden='true' />
                </Link>
              </Reveal>
            );
          })}

          {visible.length === 0 ? (
            <p className='py-4 text-center text-sm text-slate-400'>No hay tiendas de este tipo.</p>
          ) : null}
        </div>
      </div>
    </HomeSection>
  );
};

export default HomeFeaturedStores;
