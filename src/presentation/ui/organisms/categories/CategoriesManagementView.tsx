import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface CategoriesManagementViewProps {
  categories: ICategory[];
  name: string;
  editingId: string | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onSubmit: () => Promise<boolean>;
  onEdit: (category: ICategory) => void;
  onToggleStatus: (category: ICategory) => Promise<void>;
  onReset: () => void;
  onReload: () => Promise<void>;
}

export const CategoriesManagementView = ({
  categories,
  name,
  editingId,
  loading,
  submitting,
  error,
  onNameChange,
  onSubmit,
  onEdit,
  onToggleStatus,
  onReset,
  onReload,
}: CategoriesManagementViewProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <Box className="space-y-8">
      <Box className="flex flex-col gap-3">
        <Typography variant="h1" className="text-3xl font-bold">
          Categorías
        </Typography>
        <Typography className="max-w-2xl text-neutral-dark/70">
          Administra la estructura base del catálogo. Desde aquí puedes crear,
          editar y activar o desactivar categorías visibles para productos.
        </Typography>
      </Box>

      <Box className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
          <Typography variant="h2" className="text-xl font-semibold">
            {editingId ? 'Editar categoría' : 'Nueva categoría'}
          </Typography>
          <Typography className="mt-2 text-sm text-neutral-dark/65">
            Usa nombres claros y evita duplicados.
          </Typography>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Ej. Electrónica"
              disabled={submitting}
            />

            {error ? (
              <Box className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </Box>
            ) : null}

            <Box className="flex gap-3">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Crear categoría'}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onReset}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              ) : null}
            </Box>
          </form>
        </Box>

        <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
          <Box className="mb-5 flex items-center justify-between">
            <Typography variant="h2" className="text-xl font-semibold">
              Categorías registradas
            </Typography>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void onReload()}
              disabled={loading || submitting}
            >
              Recargar
            </Button>
          </Box>

          {loading ? (
            <Typography>Cargando categorías...</Typography>
          ) : categories.length === 0 ? (
            <Box className="rounded-2xl border border-dashed border-neutral-gray/40 bg-background px-6 py-10 text-center">
              <Typography>No hay categorías creadas todavía.</Typography>
            </Box>
          ) : (
            <Box className="space-y-3">
              {categories.map((category) => (
                <Box
                  key={category.id}
                  className="flex flex-col gap-4 rounded-2xl border border-neutral-gray/20 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <Box>
                    <Typography variant="h3" className="text-lg font-semibold">
                      {category.name}
                    </Typography>
                    <Typography className="mt-1 text-sm text-neutral-dark/65">
                      Estado:{' '}
                      <span
                        className={
                          category.isActive ? 'text-success' : 'text-error'
                        }
                      >
                        {category.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </Typography>
                  </Box>

                  <Box className="flex gap-3">
                    <Button
                      type="button"
                      variant="outlinePrimary"
                      onClick={() => onEdit(category)}
                      disabled={submitting}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant={category.isActive ? 'danger' : 'secondary'}
                      onClick={() => void onToggleStatus(category)}
                      disabled={submitting}
                    >
                      {category.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
