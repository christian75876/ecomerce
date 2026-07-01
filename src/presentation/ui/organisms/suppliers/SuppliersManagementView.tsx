import { useEffect, useState } from 'react';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { SupplierFormState } from '@/application/useCases/suppliers/useSuppliersManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

const FIELD_LABELS: Record<keyof Omit<SupplierFormState, 'notes'>, string> = {
  name: 'Nombre *',
  document: 'NIT / Cédula',
  phone: 'Teléfono',
  email: 'Correo',
  address: 'Dirección',
};

interface SuppliersManagementViewProps {
  suppliers: ISupplier[];
  suppliersPage: number;
  suppliersTotalPages: number;
  onSuppliersPageChange: (page: number) => void;
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
  suppliersPage,
  suppliersTotalPages,
  onSuppliersPageChange,
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
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (editingId) setShowForm(true);
  }, [editingId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await onSubmit();
    if (ok) setShowForm(false);
  };

  const handleReset = () => {
    onReset();
    setShowForm(false);
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
        {/* ── Left panel: button or form ───────────────────────── */}
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          {!showForm ? (
            <Box className='flex flex-col items-center justify-center py-10 text-center'>
              <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10'>
                <i className='bx bx-buildings text-2xl text-primary' />
              </div>
              <Typography variant='h2' className='text-lg font-semibold'>
                Agregar proveedor
              </Typography>
              <Typography className='mt-1 text-sm text-slate-400'>
                Registra un nuevo proveedor con sus datos de contacto.
              </Typography>
              <button
                type='button'
                onClick={() => setShowForm(true)}
                className='mt-5 flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90'
              >
                <i className='bx bx-plus text-base' />
                Nuevo proveedor
              </button>
            </Box>
          ) : (
            <>
              <Box className='flex items-center justify-between'>
                <Typography variant='h2' className='text-xl font-semibold'>
                  {editingId ? 'Editar proveedor' : 'Nuevo proveedor'}
                </Typography>
                <button
                  type='button'
                  onClick={handleReset}
                  className='flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50'
                >
                  <i className='bx bx-x text-sm' /> Cancelar
                </button>
              </Box>
              <form onSubmit={(e) => void handleSubmit(e)} className='mt-6 space-y-4'>
                {(Object.keys(FIELD_LABELS) as Array<keyof typeof FIELD_LABELS>).map((field) => (
                  <Box key={field}>
                    <Label htmlFor={field}>{FIELD_LABELS[field]}</Label>
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
                    disabled={submitting}
                    className='min-h-24 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60'
                  />
                </Box>
                {error ? (
                  <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                    {error}
                  </Box>
                ) : null}
                <Button type='submit' variant='primary' disabled={submitting} className='w-full'>
                  {submitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear proveedor'}
                </Button>
              </form>
            </>
          )}
        </Box>

        {/* ── List panel ──────────────────────────────────────── */}
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Box className='flex items-center justify-between gap-4'>
            <Typography variant='h2' className='text-xl font-semibold'>
              Proveedores registrados
            </Typography>
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder='Buscar proveedor...'
              className='max-w-64'
            />
          </Box>

          <Box className='mt-5 space-y-3'>
            {loading ? (
              <Typography className='py-8 text-center text-sm text-slate-400'>
                Cargando proveedores...
              </Typography>
            ) : suppliers.length === 0 ? (
              <Typography className='py-8 text-center text-sm text-slate-400'>
                {search ? 'Sin resultados para esa búsqueda.' : 'Aún no hay proveedores registrados.'}
              </Typography>
            ) : (
              suppliers.map((supplier) => (
                <Box
                  key={supplier.id}
                  className='rounded-2xl border border-neutral-gray/20 px-5 py-4 transition hover:border-primary/20 hover:bg-primary/5'
                >
                  <Box className='flex items-start justify-between gap-3'>
                    <Box className='min-w-0'>
                      <Box className='flex items-center gap-2'>
                        <Typography variant='h3' className='truncate text-base font-semibold'>
                          {supplier.name}
                        </Typography>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            supplier.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {supplier.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </Box>
                      <Typography className='mt-0.5 truncate text-sm text-neutral-dark/60'>
                        {[supplier.email, supplier.phone, supplier.document]
                          .filter(Boolean)
                          .join(' · ') || 'Sin datos de contacto'}
                      </Typography>
                      {supplier.address ? (
                        <Typography className='mt-0.5 truncate text-xs text-slate-400'>
                          <i className='bx bx-map-pin mr-0.5' />
                          {supplier.address}
                        </Typography>
                      ) : null}
                      {supplier.notes ? (
                        <Typography className='mt-1 line-clamp-2 text-xs text-slate-500'>
                          <i className='bx bx-note mr-0.5 text-slate-400' />
                          {supplier.notes}
                        </Typography>
                      ) : null}
                    </Box>
                    <Box className='flex flex-shrink-0 gap-2'>
                      <button
                        type='button'
                        onClick={() => onEdit(supplier)}
                        className='rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10'
                      >
                        <i className='bx bx-edit-alt mr-1' />
                        Editar
                      </button>
                      <button
                        type='button'
                        onClick={() => void onToggleStatus(supplier)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                          supplier.isActive
                            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {supplier.isActive ? 'Inactivar' : 'Activar'}
                      </button>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {suppliersTotalPages > 1 && (
            <div className='mt-4 flex items-center justify-between border-t border-slate-100 pt-3'>
              <button
                type='button'
                disabled={suppliersPage <= 1}
                onClick={() => onSuppliersPageChange(suppliersPage - 1)}
                className='flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <i className='bx bx-chevron-left' /> Anterior
              </button>
              <span className='text-xs text-slate-400'>
                Página {suppliersPage} de {suppliersTotalPages}
              </span>
              <button
                type='button'
                disabled={suppliersPage >= suppliersTotalPages}
                onClick={() => onSuppliersPageChange(suppliersPage + 1)}
                className='flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                Siguiente <i className='bx bx-chevron-right' />
              </button>
            </div>
          )}
        </Box>
      </Box>
    </Box>
  );
};
