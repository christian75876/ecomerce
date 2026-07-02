import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { IAsyncOption } from '@/application/dtos/common/AsyncOption';

interface AsyncSearchSelectProps {
  value: string;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  selectedLabel?: string;
  loadOptions: (params: {
    search: string;
    page: number;
  }) => Promise<{
    items: IAsyncOption[];
    currentPage: number;
    totalPages: number;
  }>;
  onChange: (option: IAsyncOption | null) => void;
}

const AsyncSearchSelect = ({
  value,
  placeholder = 'Buscar...',
  emptyLabel = 'Sin resultados',
  disabled = false,
  selectedLabel,
  loadOptions,
  onChange,
}: AsyncSearchSelectProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<IAsyncOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<IAsyncOption | null>(null);

  const loadPage = useCallback(async (page: number, term: string, append: boolean) => {
    setLoading(true);
    try {
      const response = await loadOptions({ search: term, page });
      setOptions((current) =>
        append ? [...current, ...response.items] : response.items,
      );
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } finally {
      setLoading(false);
    }
  }, [loadOptions]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void loadPage(1, search, false);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [isOpen, search, loadPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedText = useMemo(() => {
    if (selectedOption?.id === value) {
      return selectedOption.label;
    }
    return selectedLabel ?? '';
  }, [selectedLabel, selectedOption, value]);

  const handleScroll = () => {
    if (!listRef.current || loading || currentPage >= totalPages) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 48) {
      void loadPage(currentPage + 1, search, true);
    }
  };

  return (
    <Box className='relative w-full' ref={containerRef}>
      <button
        type='button'
        disabled={disabled}
        className='flex w-full items-center justify-between rounded-2xl border border-neutral-gray/80 bg-white/90 px-4 py-3.5 text-left shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60'
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={selectedText ? 'text-neutral-dark' : 'text-neutral-dark/35'}>
          {selectedText || placeholder}
        </span>
        <span className='text-neutral-dark/45'>▾</span>
      </button>

      {isOpen ? (
        <Box className='absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-3xl border border-neutral-gray/20 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.14)]'>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={placeholder}
            autoFocus
          />

          <Box
            ref={listRef}
            onScroll={handleScroll}
            className='mt-3 max-h-64 space-y-2 overflow-y-auto'
          >
            {options.map((option) => (
              <button
                key={option.id}
                type='button'
                className='block w-full rounded-2xl border border-transparent px-4 py-3 text-left transition hover:border-primary/15 hover:bg-primary/5'
                onClick={() => {
                  setSelectedOption(option);
                  setIsOpen(false);
                  onChange(option);
                }}
              >
                <Typography className='font-semibold'>{option.label}</Typography>
                {option.secondary ? (
                  <Typography className='mt-1 text-xs text-neutral-dark/55'>
                    {option.secondary}
                  </Typography>
                ) : null}
                {option.helper ? (
                  <Typography className='mt-1 text-xs text-neutral-dark/55'>
                    {option.helper}
                  </Typography>
                ) : null}
              </button>
            ))}

            {!loading && options.length === 0 ? (
              <Box className='rounded-2xl border border-dashed border-neutral-gray/20 px-4 py-6 text-center'>
                <Typography className='text-sm text-neutral-dark/60'>
                  {emptyLabel}
                </Typography>
              </Box>
            ) : null}

            {loading ? (
              <Typography className='px-2 py-2 text-sm text-neutral-dark/55'>
                Cargando...
              </Typography>
            ) : null}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default AsyncSearchSelect;
