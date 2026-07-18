import { IAuditLog } from '@/application/dtos/audit/response/AuditResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import PaginationControls from '@/presentation/ui/molecules/common/PaginationControls';

interface AuditManagementViewProps {
  logs: IAuditLog[];
  action: string;
  entity: string;
  userId: string;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onActionChange: (value: string) => void;
  onEntityChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onChangePage: (page: number) => void | Promise<void>;
}

export const AuditManagementView = ({
  logs,
  action,
  entity,
  userId,
  loading,
  error,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onActionChange,
  onEntityChange,
  onUserIdChange,
  onChangePage,
}: AuditManagementViewProps) => (
  <Box className='space-y-8'>
    <Box>
      <Typography variant='h1' className='text-3xl font-bold'>Auditoría</Typography>
      <Typography className='mt-2 text-neutral-dark/70'>
        Consulta acciones críticas por usuario, acción o entidad.
      </Typography>
    </Box>
    <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
      <Box className='grid gap-3 md:grid-cols-3'>
        <Input value={action} onChange={(event) => onActionChange(event.target.value)} placeholder='Acción' />
        <Input value={entity} onChange={(event) => onEntityChange(event.target.value)} placeholder='Entidad' />
        <Input value={userId} onChange={(event) => onUserIdChange(event.target.value)} placeholder='Usuario' />
      </Box>
      {error ? <Box className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</Box> : null}
      <Box className='mt-6 space-y-3'>
        {loading ? <Typography>Cargando auditoría...</Typography> : logs.map((log) => (
          <Box key={log.id} className='rounded-2xl border border-neutral-gray/20 px-5 py-4'>
            <Typography variant='h3' className='text-lg font-semibold'>{log.action}</Typography>
            <Typography className='mt-1 text-sm text-neutral-dark/65'>
              {log.entity} · ref {log.referenceId || '-'} · usuario {log.userId ?? '-'}
            </Typography>
            <Typography className='mt-2 text-sm text-neutral-dark/75'>
              {log.detail || 'Sin detalle'}
            </Typography>
          </Box>
        ))}
      </Box>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        loading={loading}
        onChangePage={onChangePage}
      />
    </Box>
  </Box>
);
