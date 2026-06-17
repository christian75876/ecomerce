interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {totalItems != null && startItem != null && endItem != null ? (
        <p className='text-xs text-slate-500'>
          Mostrando <span className='font-semibold text-slate-700'>{startItem}–{endItem}</span> de{' '}
          <span className='font-semibold text-slate-700'>{totalItems}</span> resultados
        </p>
      ) : null}
      <div className='flex items-center gap-1'>
        <button
          type='button'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500 transition hover:bg-slate-50 disabled:opacity-40'
          aria-label='Página anterior'
        >
          <i className='bx bx-chevron-left text-base' />
        </button>

        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className='flex h-8 w-6 items-center justify-center text-xs text-slate-400'>
              …
            </span>
          ) : (
            <button
              key={p}
              type='button'
              onClick={() => onPageChange(p as number)}
              className={`flex h-8 min-w-[2rem] items-center justify-center rounded-xl border px-2 text-xs font-semibold transition ${
                currentPage === p
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type='button'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500 transition hover:bg-slate-50 disabled:opacity-40'
          aria-label='Página siguiente'
        >
          <i className='bx bx-chevron-right text-base' />
        </button>
      </div>
    </div>
  );
};
