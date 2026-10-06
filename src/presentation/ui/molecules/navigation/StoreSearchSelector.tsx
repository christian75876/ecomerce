import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import SimpleIcon from '@atoms/icon/SimpleIcon';
import { useAdminStore } from '@/shared/contexts/AdminStoreContext';

const DROPDOWN_WIDTH = 288; // w-72
const GAP = 12; // top-[calc(100%+0.75rem)]
const VIEWPORT_MARGIN = 8;

interface Props {
  /** A qué lado del botón se alinea el dropdown. 'right' (por defecto) alinea
   * su borde derecho con el del botón; 'left' alinea el izquierdo. */
  align?: 'left' | 'right';
}

const StoreSearchSelector = ({ align = 'right' }: Props = {}) => {
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId, loadStores } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  // El botón puede vivir dentro de contenedores con overflow-hidden/scroll
  // (p. ej. el panel colapsable "Tiendas" del sidebar) — el dropdown se
  // porta a document.body para no quedar recortado por esos ancestros, así
  // que su posición se calcula en coordenadas de viewport en vez de con
  // `absolute` relativo al botón.
  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const left = align === 'left' ? rect.left : rect.right - DROPDOWN_WIDTH;
      const clampedLeft = Math.min(
        Math.max(left, VIEWPORT_MARGIN),
        window.innerWidth - DROPDOWN_WIDTH - VIEWPORT_MARGIN,
      );
      setPosition({ top: rect.bottom + GAP, left: clampedLeft });
    };

    updatePosition();

    // Reposicionar continuamente sería más código del que vale la pena para
    // un selector de sidebar — más simple y predecible: cerrar si el usuario
    // hace scroll (el botón se movió) o redimensiona la ventana.
    const handleScroll = () => setOpen(false);
    const handleResize = () => setOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open, align]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
      setSearch('');
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
    <div className='relative'>
      <button
        ref={buttonRef}
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        title={selectedStore ? selectedStore.name : 'Todas las tiendas'}
        className={clsx(
          'flex w-48 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
          selectedStoreId
            ? 'bg-primary text-white'
            : 'border border-neutral-gray/40 bg-white text-neutral-dark/70',
        )}
      >
        <SimpleIcon name='bx-store' size={16} className='text-inherit shrink-0' />
        <span className='min-w-0 flex-1 truncate text-center'>
          {selectedStore ? selectedStore.name : 'Todas las tiendas'}
        </span>
        <SimpleIcon
          name={open ? 'bx-chevron-up' : 'bx-chevron-down'}
          size={16}
          className='text-inherit shrink-0'
        />
      </button>

      {open && position
        ? createPortal(
            <div
              ref={dropdownRef}
              className='fixed z-[100] w-72 rounded-[1.35rem] border border-neutral-gray/40 bg-white shadow-lg'
              style={{ top: position.top, left: position.left }}
            >
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
                      <span className='min-w-0 flex-1 truncate text-left'>{store.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default StoreSearchSelector;
