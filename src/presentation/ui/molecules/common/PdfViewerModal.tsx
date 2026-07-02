interface PdfViewerModalProps {
  url: string;
  onClose: () => void;
}

const PdfViewerModal = ({ url, onClose }: PdfViewerModalProps) => {
  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm'>
      {/* Header */}
      <div className='flex flex-shrink-0 items-center gap-3 border-b border-white/10 bg-slate-900 px-4 py-3'>
        <i className='bx bxs-file-pdf text-xl text-red-400' aria-hidden='true' />
        <span className='flex-1 truncate text-sm font-semibold text-white'>Carta / Menú PDF</span>
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10'
        >
          <i className='bx bx-link-external' aria-hidden='true' />
          Nueva pestaña
        </a>
        <button
          type='button'
          onClick={onClose}
          aria-label='Cerrar visor'
          className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white'
        >
          <i className='bx bx-x text-xl' aria-hidden='true' />
        </button>
      </div>

      {/* PDF iframe */}
      <div className='min-h-0 flex-1'>
        <iframe
          src={url}
          className='h-full w-full border-0'
          title='Menú PDF'
        />
      </div>

      {/* Mobile hint */}
      <div className='flex flex-shrink-0 items-center justify-center gap-1.5 bg-slate-900 py-2 text-xs text-white/40'>
        <i className='bx bx-info-circle' aria-hidden='true' />
        Si no carga en móvil, usa "Nueva pestaña"
      </div>
    </div>
  );
};

export default PdfViewerModal;
