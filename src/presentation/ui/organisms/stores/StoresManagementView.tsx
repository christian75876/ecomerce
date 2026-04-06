import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { StoreFormState } from '@/application/useCases/stores/useStoresManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface StoresManagementViewProps {
  stores: IStore[];
  form: StoreFormState;
  editingId: string | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onFormChange: <K extends keyof StoreFormState>(key: K, value: StoreFormState[K]) => void;
  onSubmit: () => Promise<boolean>;
  onEdit: (store: IStore) => void;
  onReset: () => void;
}

export const StoresManagementView = ({
  stores,
  form,
  editingId,
  loading,
  submitting,
  error,
  onFormChange,
  onSubmit,
  onEdit,
  onReset,
}: StoresManagementViewProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <Box className='space-y-8'>
      <Box>
        <Typography variant='h1' className='text-3xl font-bold'>
          Tiendas
        </Typography>
        <Typography className='mt-2 text-neutral-dark/70'>
          Configura nombre, slug y branding visible en el marketplace.
        </Typography>
      </Box>

      <Box className='grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]'>
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-xl font-semibold'>
            {editingId ? 'Editar tienda' : 'Nueva tienda'}
          </Typography>

          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            {(['name', 'slug', 'logoUrl', 'bannerUrl', 'primaryColor', 'secondaryColor', 'phone', 'email'] as const).map((field) => (
              <Box key={field}>
                <Label htmlFor={field}>
                  {{
                    name: 'Nombre',
                    slug: 'Slug',
                    logoUrl: 'Logo URL',
                    bannerUrl: 'Banner URL',
                    primaryColor: 'Color principal',
                    secondaryColor: 'Color secundario',
                    phone: 'Teléfono',
                    email: 'Email',
                  }[field]}
                </Label>
                <Input
                  id={field}
                  value={form[field]}
                  onChange={(event) => onFormChange(field, event.target.value)}
                  disabled={submitting}
                />
              </Box>
            ))}
            <Box>
              <Label htmlFor='description'>Descripción</Label>
              <textarea
                id='description'
                value={form.description}
                onChange={(event) => onFormChange('description', event.target.value)}
                className='min-h-28 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
              />
            </Box>
            <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
              <input
                type='checkbox'
                checked={form.isActive}
                onChange={(event) => onFormChange('isActive', event.target.checked)}
                disabled={submitting}
              />
              Tienda activa y visible en el marketplace
            </label>
            {error ? (
              <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </Box>
            ) : null}
            <Box className='flex gap-3'>
              <Button type='submit' variant='primary' disabled={submitting}>
                {submitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear tienda'}
              </Button>
              {editingId ? (
                <Button type='button' variant='outline' onClick={onReset}>
                  Cancelar
                </Button>
              ) : null}
            </Box>
          </form>
        </Box>

        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-xl font-semibold'>
            Tiendas registradas
          </Typography>
          <Box className='mt-5 space-y-3'>
            {loading ? (
              <Typography>Cargando tiendas...</Typography>
            ) : (
              stores.map((store) => (
                <Box key={store.id} className='rounded-2xl border border-neutral-gray/20 px-5 py-4'>
                  <Typography variant='h3' className='text-lg font-semibold'>
                    {store.name}
                  </Typography>
                  <Typography className='mt-1 text-sm text-neutral-dark/65'>
                    /{store.slug} · {store.isActive ? 'Activa' : 'Inactiva'}
                  </Typography>
                  <Box className='mt-3 flex gap-2'>
                    {store.primaryColor ? (
                      <span
                        className='h-6 w-6 rounded-full border border-neutral-gray/20'
                        style={{ backgroundColor: store.primaryColor }}
                      />
                    ) : null}
                    {store.secondaryColor ? (
                      <span
                        className='h-6 w-6 rounded-full border border-neutral-gray/20'
                        style={{ backgroundColor: store.secondaryColor }}
                      />
                    ) : null}
                  </Box>
                  <Button
                    type='button'
                    variant='outlinePrimary'
                    className='mt-4'
                    onClick={() => onEdit(store)}
                  >
                    Editar
                  </Button>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
