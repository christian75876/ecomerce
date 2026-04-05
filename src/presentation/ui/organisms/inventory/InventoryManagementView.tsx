import { IInventoryItem, IInventoryMovement } from '@/application/dtos/inventory/response/InventoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface InventoryManagementViewProps {
  products: IProduct[];
  inventory: IInventoryItem[];
  movements: IInventoryMovement[];
  productId: string;
  movementType: 'IN' | 'ADJUSTMENT';
  quantity: string;
  note: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onProductChange: (value: string) => void;
  onMovementTypeChange: (value: 'IN' | 'ADJUSTMENT') => void;
  onQuantityChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => Promise<boolean>;
}

export const InventoryManagementView = ({
  products,
  inventory,
  movements,
  productId,
  movementType,
  quantity,
  note,
  loading,
  submitting,
  error,
  onProductChange,
  onMovementTypeChange,
  onQuantityChange,
  onNoteChange,
  onSubmit,
}: InventoryManagementViewProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <Box className="space-y-8">
      <Box className="flex flex-col gap-3">
        <Typography variant="h1" className="text-3xl font-bold">
          Inventario
        </Typography>
        <Typography className="max-w-3xl text-neutral-dark/70">
          El stock se calcula por movimientos. Desde aquí registras entradas y
          ajustes, y puedes auditar el historial reciente por producto.
        </Typography>
      </Box>

      <Box className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
          <Typography variant="h2" className="text-xl font-semibold">
            Nuevo movimiento
          </Typography>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Box>
              <Label htmlFor="inventory-product">Producto</Label>
              <select
                id="inventory-product"
                value={productId}
                onChange={(event) => onProductChange(event.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </Box>

            <Box className="grid gap-4 md:grid-cols-2">
              <Box>
                <Label htmlFor="movement-type">Tipo</Label>
                <select
                  id="movement-type"
                  value={movementType}
                  onChange={(event) =>
                    onMovementTypeChange(event.target.value as 'IN' | 'ADJUSTMENT')
                  }
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="IN">IN</option>
                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                </select>
              </Box>

              <Box>
                <Label htmlFor="movement-quantity">
                  Cantidad {movementType === 'ADJUSTMENT' ? '(usa negativo o positivo)' : ''}
                </Label>
                <Input
                  id="movement-quantity"
                  type="number"
                  value={quantity}
                  onChange={(event) => onQuantityChange(event.target.value)}
                  disabled={submitting}
                />
              </Box>
            </Box>

            <Box>
              <Label htmlFor="movement-note">Nota</Label>
              <Input
                id="movement-note"
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                disabled={submitting}
                placeholder="Motivo del movimiento"
              />
            </Box>

            {error ? (
              <Box className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </Box>
            ) : null}

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Registrar movimiento'}
            </Button>
          </form>
        </Box>

        <Box className="space-y-6">
          <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
            <Typography variant="h2" className="text-xl font-semibold">
              Stock actual
            </Typography>
            <Box className="mt-5 space-y-3">
              {loading ? (
                <Typography>Cargando inventario...</Typography>
              ) : inventory.length === 0 ? (
                <Typography>No hay productos con movimientos todavía.</Typography>
              ) : (
                inventory.map((item) => (
                  <Box
                    key={item.productId}
                    className="flex flex-col gap-2 rounded-2xl border border-neutral-gray/20 px-5 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <Box>
                      <Typography variant="h3" className="text-lg font-semibold">
                        {item.productName}
                      </Typography>
                      <Typography className="text-sm text-neutral-dark/65">
                        SKU: {item.sku} · {item.category ?? 'Sin categoría'}
                      </Typography>
                    </Box>
                    <Box className="text-right">
                      <Typography className="text-sm text-neutral-dark/65">
                        Stock actual
                      </Typography>
                      <Typography variant="h3" className="text-2xl font-bold">
                        {item.stock}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
            <Typography variant="h2" className="text-xl font-semibold">
              Historial de movimientos
            </Typography>
            <Box className="mt-5 space-y-3">
              {loading ? (
                <Typography>Cargando movimientos...</Typography>
              ) : movements.length === 0 ? (
                <Typography>No hay movimientos registrados todavía.</Typography>
              ) : (
                movements.slice(0, 12).map((movement) => (
                  <Box
                    key={movement.id}
                    className="rounded-2xl border border-neutral-gray/20 px-5 py-4"
                  >
                    <Box className="flex flex-wrap items-center justify-between gap-3">
                      <Typography variant="h3" className="text-lg font-semibold">
                        {movement.product.name}
                      </Typography>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {movement.movementType}
                      </span>
                    </Box>
                    <Typography className="mt-2 text-sm text-neutral-dark/70">
                      Delta: {movement.quantityDelta > 0 ? '+' : ''}
                      {movement.quantityDelta} · SKU: {movement.product.sku}
                    </Typography>
                    <Typography className="mt-1 text-sm text-neutral-dark/65">
                      {movement.note || 'Sin nota'}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
