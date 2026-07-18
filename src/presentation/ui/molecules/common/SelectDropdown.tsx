import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectPagedResult {
  items: SelectOption[];
  currentPage: number;
  totalPages: number;
}

interface BaseProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onCreateClick?: () => void;
  createLabel?: string;
  onChange: (value: string) => void;
  className?: string;
}

interface StaticProps extends BaseProps {
  options: SelectOption[];
  loadOptions?: never;
  selectedLabel?: never;
}

interface AsyncProps extends BaseProps {
  loadOptions: (params: { search: string; page: number }) => Promise<SelectPagedResult>;
  selectedLabel?: string;
  options?: never;
}

type SelectDropdownProps = StaticProps | AsyncProps;

interface PanelRect {
  top: number;
  bottom: number;
  left: number;
  width: number;
  openUpward: boolean;
}

const PANEL_MAX_HEIGHT = 320;
const OFFSET = 6;

const SelectDropdown = ({
  value,
  placeholder = 'Selecciona una opción',
  disabled = false,
  onCreateClick,
  createLabel = '+ Nuevo',
  onChange,
  className = '',
  ...rest
}: SelectDropdownProps) => {
  const isAsync = 'loadOptions' in rest && typeof rest.loadOptions === 'function';

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [rect, setRect] = useState<PanelRect | null>(null);

  // async state
  const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // static: client-side filter
  const staticOptions = isAsync ? [] : ((rest as StaticProps).options ?? []);
  const filtered = useMemo(() => {
    if (isAsync) return asyncOptions;
    if (!search.trim()) return staticOptions;
    const q = search.toLowerCase();
    return staticOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [isAsync, asyncOptions, staticOptions, search]);

  const selectedLabel = useMemo(() => {
    if (isAsync) return (rest as AsyncProps).selectedLabel ?? '';
    return staticOptions.find((o) => o.value === value)?.label ?? '';
  }, [isAsync, rest, staticOptions, value]);

  // ─── rect ────────────────────────────────────────────────────────────────
  const computeRect = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUpward = spaceBelow < PANEL_MAX_HEIGHT + OFFSET && r.top > PANEL_MAX_HEIGHT;
    setRect({
      top: r.bottom + OFFSET,
      bottom: window.innerHeight - r.top + OFFSET,
      left: r.left,
      width: r.width,
      openUpward,
    });
  }, []);

  // ─── async load ──────────────────────────────────────────────────────────
  const loadPage = useCallback(
    async (page: number, term: string, append: boolean) => {
      if (!isAsync) return;
      setLoading(true);
      try {
        const res = await (rest as AsyncProps).loadOptions({ search: term, page });
        setAsyncOptions((prev) => (append ? [...prev, ...res.items] : res.items));
        setCurrentPage(res.currentPage);
        setTotalPages(res.totalPages);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAsync, (rest as AsyncProps).loadOptions],
  );

  // debounced search / open trigger for async
  useEffect(() => {
    if (!isOpen || !isAsync) return;
    const t = window.setTimeout(() => void loadPage(1, search, false), 250);
    return () => window.clearTimeout(t);
  }, [isOpen, isAsync, search, loadPage]);

  // ─── outside click + reposition ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      if (isAsync) setAsyncOptions([]);
      return;
    }

    const onOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setIsOpen(false);
      }
    };
    const onRepos = () => computeRect();

    document.addEventListener('mousedown', onOutside);
    window.addEventListener('scroll', onRepos, true);
    window.addEventListener('resize', onRepos);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      window.removeEventListener('scroll', onRepos, true);
      window.removeEventListener('resize', onRepos);
    };
  }, [isOpen, isAsync, computeRect]);

  // ─── infinite scroll ─────────────────────────────────────────────────────
  const handleListScroll = () => {
    if (!isAsync || !listRef.current || loading || currentPage >= totalPages) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 48) {
      void loadPage(currentPage + 1, search, true);
    }
  };

  const handleOpen = () => {
    if (disabled) return;
    computeRect();
    setIsOpen((prev) => !prev);
  };

  // ─── panel ───────────────────────────────────────────────────────────────
  const panel =
    isOpen && rect
      ? createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: rect.openUpward ? undefined : rect.top,
              bottom: rect.openUpward ? rect.bottom : undefined,
              left: rect.left,
              width: rect.width,
              zIndex: 99999,
              maxHeight: PANEL_MAX_HEIGHT,
            }}
            className='flex flex-col overflow-hidden rounded-2xl border border-neutral-gray/20 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
          >
            {/* Search */}
            <div className='flex-shrink-0 border-b border-neutral-gray/10 px-3 pt-3 pb-2'>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Buscar...'
                className='w-full rounded-xl border border-neutral-gray/30 px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              />
            </div>

            {/* Options list */}
            <div
              ref={listRef}
              onScroll={handleListScroll}
              className='flex-1 overflow-y-auto'
            >
              {/* "empty / none" row for non-required selects */}
              <button
                type='button'
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(''); setIsOpen(false); }}
                className={`w-full px-4 py-3 text-left text-sm transition hover:bg-neutral-gray/5 ${
                  !value ? 'font-medium text-primary' : 'text-neutral-dark/40'
                }`}
              >
                {placeholder}
              </button>

              {filtered.map((opt) => (
                <button
                  key={opt.value}
                  type='button'
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full px-4 py-3 text-left text-sm font-medium transition hover:bg-primary/5 hover:text-primary ${
                    opt.value === value ? 'bg-primary/8 text-primary' : 'text-neutral-dark'
                  }`}
                >
                  {opt.label}
                </button>
              ))}

              {loading ? (
                <p className='px-4 py-3 text-center text-sm text-neutral-dark/40'>
                  Cargando...
                </p>
              ) : !loading && filtered.length === 0 && search ? (
                <p className='px-4 py-6 text-center text-sm text-neutral-dark/40'>
                  Sin resultados para "{search}"
                </p>
              ) : null}
            </div>

            {/* Create button */}
            {onCreateClick ? (
              <div className='flex-shrink-0 border-t border-neutral-gray/10 p-2'>
                <button
                  type='button'
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setIsOpen(false); onCreateClick(); }}
                  className='flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/8'
                >
                  <i className='bx bx-plus text-base' aria-hidden='true' />
                  {createLabel}
                </button>
              </div>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`relative w-full ${className}`}>
      <button
        ref={triggerRef}
        type='button'
        disabled={disabled}
        onClick={handleOpen}
        className='flex w-full items-center justify-between rounded-2xl border border-neutral-gray/80 bg-white/90 px-4 py-3.5 text-left text-sm shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60'
      >
        <span className={selectedLabel ? 'text-neutral-dark' : 'text-neutral-dark/35'}>
          {selectedLabel || placeholder}
        </span>
        <i
          className={`bx bx-chevron-down text-base text-neutral-dark/45 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden='true'
        />
      </button>
      {panel}
    </div>
  );
};

export default SelectDropdown;
