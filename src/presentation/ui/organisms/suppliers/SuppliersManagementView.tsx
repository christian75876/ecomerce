import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { SupplierFormState } from '@/application/useCases/suppliers/useSuppliersManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface SuppliersManagementViewProps {
  suppliers: ISupplier[];
  form: SupplierFormState;
  editingId: string | null;
  search: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onSearchChange: (value: string) => void;
  onFormChange: <K extends keyof SupplierFormState>(key: K, value: SupplierFormState[K]) => void;
  onSubmit: () => Promise<boolean>;
  onEdit: (supplier: ISupplier) => void;
  onToggleStatus: (supplier: ISupplier) => Promise<void>;
  onReset: () => void;
}

export const SuppliersManagementView = ({
  suppliers,
  form,
  editingId,
  search,
  loading,
  submitting,
  error,
  onSearchChange,
  onFormChange,
  onSubmit,
  onEdit,
  onToggleStatus,
  onReset,
}: SuppliersManagementViewProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <Box className='space-y-8'>
      <Box>
        <Typography variant='h1' className='text-3xl font-bold'>
          Proveedores
        </Typography>
        <Typography className='mt-2 text-neutral-dark/70'>
          Registra proveedores para abastecimiento y cuentas por pagar.
        </Typography>
      </Box>
      <Box className='grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]'>
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-xl font-semibold'>
            {editingId ? 'Editar proveedor' : 'Nuevo proveedor'}
          </Typography>
          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            {(['name', 'document', 'phone', 'email', 'address'] as const).map((field) => (
              <Box key={field}>
                <Label htmlFor={field}>{field}</Label>
                <Input
                  id={field}
                  value={form[field]}
                  onChange={(event) => onFormChange(field, event.target.value)}
                  disabled={submitting}
                />
              </Box>
            ))}
            <Box>
              <Label htmlFor='notes'>Observaciones</Label>
              <textarea
                id='notes'
                value={form.notes}
                onChange={(event) => onFormChange('notes', event.target.value)}
                className='min-h-24 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
              />
            </Box>
            {error ? <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</Box> : null}
            <Box className='flex gap-3'>
              <Button type='submit' variant='primary' disabled={submitting}>
                {submitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear proveedor'}
              </Button>
              {editingId ? <Button type='button' variant='outline' onClick={onReset}>Cancelar</Button> : null}
            </Box>
          </form>
        </Box>
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Box className='flex items-center justify-between gap-4'>
            <Typography variant='h2' className='text-xl font-semibold'>
              Proveedores registrados
            </Typography>
            <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder='Buscar proveedor' className='max-w-72' />
          </Box>
          <Box className='mt-5 space-y-3'>
            {loading ? <Typography>Cargando proveedores...</Typography> : suppliers.map((supplier) => (
              <Box key={supplier.id} className='rounded-2xl border border-neutral-gray/20 px-5 py-4'>
                <Typography variant='h3' className='text-lg font-semibold'>{supplier.name}</Typography>
                <Typography className='mt-1 text-sm text-neutral-dark/65'>
                  {supplier.email || 'Sin email'} · {supplier.isActive ? 'Activo' : 'Inactivo'}
                </Typography>
                <Box className='mt-4 flex gap-3'>
                  <Button type='button' variant='outlinePrimary' onClick={() => onEdit(supplier)}>Editar</Button>
                  <Button type='button' variant={supplier.isActive ? 'danger' : 'secondary'} onClick={() => void onToggleStatus(supplier)}>
                    {supplier.isActive ? 'Inactivar' : 'Activar'}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
