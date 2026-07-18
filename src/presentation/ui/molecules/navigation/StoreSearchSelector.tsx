import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import SimpleIcon from '@atoms/icon/SimpleIcon';
import { useAdminStore } from '@/shared/contexts/AdminStoreContext';

const StoreSearchSelector = ({ dropdownClassName }: { dropdownClassName?: string } = {}) => {
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId, loadStores } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  if (stores.length === 0) return null;

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (id: string | undefined) => {
    setSelectedStoreId(id);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
          selectedStoreId
            ? 'bg-primary text-white'
            : 'border border-neutral-gray/40 bg-white text-neutral-dark/70',
        )}
      >
        <SimpleIcon name='bx-store' size={16} className='text-inherit shrink-0' />
        <span
          className='truncate'
          style={{ maxWidth: 160 }}
        >
          {selectedStore ? selectedStore.name : 'Todas las tiendas'}
        </span>
        <SimpleIcon
          name={open ? 'bx-chevron-up' : 'bx-chevron-down'}
          size={16}
          className='text-inherit shrink-0'
        />
      </button>

      {open ? (
        <div className={`absolute top-[calc(100%+0.75rem)] z-50 w-72 rounded-[1.35rem] border border-neutral-gray/40 bg-white shadow-lg ${dropdownClassName ?? 'right-0'}`}>
          <div className='p-3 pb-2'>
            <input
              autoFocus
              type='text'
              placeholder='Buscar tienda...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full rounded-xl border border-neutral-gray/30 bg-background px-3 py-2 text-sm text-neutral-dark outline-none placeholder:text-neutral-dark/40 focus:border-primary/50'
            />
          </div>

          <div className='max-h-64 overflow-y-auto p-2 pt-1'>
            <button
              type='button'
              onClick={() => handleSelect(undefined)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all',
                !selectedStoreId
                  ? 'bg-primary/10 text-primary'
                  : 'text-neutral-dark/70 hover:bg-neutral-gray/10',
              )}
            >
              <SimpleIcon name='bx-globe' size={16} className='shrink-0' />
              Todas las tiendas
            </button>

            {filteredStores.length === 0 ? (
              <p className='px-4 py-3 text-sm text-neutral-dark/40'>Sin resultados</p>
            ) : (
              filteredStores.map((store) => (
                <button
                  key={store.id}
                  type='button'
                  onClick={() => handleSelect(store.id)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all',
                    selectedStoreId === store.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-neutral-dark/70 hover:bg-neutral-gray/10',
                  )}
                >
                  <SimpleIcon name='bx-store' size={16} className='shrink-0' />
                  <span className='truncate'>{store.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StoreSearchSelector;
