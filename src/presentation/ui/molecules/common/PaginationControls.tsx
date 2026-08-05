import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  loading?: boolean;
  onChangePage: (page: number) => void | Promise<void>;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  loading = false,
  onChangePage,
}: PaginationControlsProps) => {
  return (
    <Box className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <Typography className='text-sm text-neutral-dark/65'>
        {loading ? 'Cargando...' : `${totalItems} ${totalItems === 1 ? 'registro' : 'registros'} · página ${currentPage} de ${totalPages} · ${itemsPerPage} por página`}
      </Typography>

      <Box className='flex items-center gap-3'>
        <Button
          type='button'
          variant='outline'
          disabled={currentPage <= 1 || loading}
          onClick={() => void onChangePage(currentPage - 1)}
        >
          Anterior
        </Button>
        <Button
          type='button'
          variant='outline'
          disabled={currentPage >= totalPages || loading}
          onClick={() => void onChangePage(currentPage + 1)}
        >
          Siguiente
        </Button>
      </Box>
    </Box>
  );
};

export default PaginationControls;
