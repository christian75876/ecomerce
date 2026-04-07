import {
  IInventoryBatch,
  IInventoryItem,
  IInventoryMovement,
} from '@/application/dtos/inventory/response/InventoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface InventoryManagementViewProps {
  products: IProduct[];
  suppliers: ISupplier[];
  inventory: IInventoryItem[];
  movements: IInventoryMovement[];
  batches: IInventoryBatch[];
  expiringBatches: IInventoryBatch[];
  selectedProduct: IProduct | null;
  productId: string;
  movementType: 'IN' | 'ADJUSTMENT';
  quantity: string;
  unitCost: string;
  supplierId: string;
  batchCode: string;
  expiresAt: string;
  note: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onProductChange: (value: string) => void;
  onMovementTypeChange: (value: 'IN' | 'ADJUSTMENT') => void;
  onQuantityChange: (value: string) => void;
  onUnitCostChange: (value: string) => void;
  onSupplierChange: (value: string) => void;
  onBatchCodeChange: (value: string) => void;
  onExpiresAtChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => Promise<boolean>;
}

export const InventoryManagementView = ({
  products,
  suppliers,
  inventory,
  movements,
  batches,
  expiringBatches,
  selectedProduct,
  productId,
  movementType,
  quantity,
  unitCost,
  supplierId,
  batchCode,
  expiresAt,
  note,
  loading,
  submitting,
  error,
  onProductChange,
  onMovementTypeChange,
  onQuantityChange,
  onUnitCostChange,
  onSupplierChange,
  onBatchCodeChange,
  onExpiresAtChange,
  onNoteChange,
  onSubmit,
}: InventoryManagementViewProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <Box className='space-y-8'>
      <Box className='flex flex-col gap-3'>
        <Typography variant='h1' className='text-3xl font-bold'>
          Inventario y lotes
        </Typography>
        <Typography className='max-w-4xl text-neutral-dark/70'>
          El inventario ahora se calcula por lotes. Cada ingreso crea una capa con costo,
          proveedor y vencimiento opcional, y el stock total del producto sale de sus
          existencias disponibles.
        </Typography>
      </Box>

      <Box className='grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]'>
        <Box className='surface-card p-6'>
          <Typography variant='h2' className='text-xl font-semibold'>
            {movementType === 'IN' ? 'Nuevo ingreso por lote' : 'Ajuste de inventario'}
          </Typography>

          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <Box>
              <Label htmlFor='inventory-product'>Producto</Label>
              <select
                id='inventory-product'
                value={productId}
                onChange={(event) => onProductChange(event.target.value)}
                disabled={submitting}
                className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
              >
                <option value=''>Selecciona un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </Box>

            <Box className='grid gap-4 md:grid-cols-2'>
              <Box>
                <Label htmlFor='movement-type'>Operación</Label>
                <select
                  id='movement-type'
                  value={movementType}
                  onChange={(event) =>
                    onMovementTypeChange(event.target.value as 'IN' | 'ADJUSTMENT')
                  }
                  disabled={submitting}
                  className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
                >
                  <option value='IN'>Ingreso</option>
                  <option value='ADJUSTMENT'>Ajuste</option>
                </select>
              </Box>

              <Box>
                <Label htmlFor='movement-quantity'>
                  Cantidad {movementType === 'ADJUSTMENT' ? '(negativa o positiva)' : ''}
                </Label>
                <Input
                  id='movement-quantity'
                  type='number'
                  value={quantity}
                  onChange={(event) => onQuantityChange(event.target.value)}
                  disabled={submitting}
                />
              </Box>
            </Box>

            {movementType === 'IN' ? (
              <>
                <Box className='grid gap-4 md:grid-cols-2'>
                  <Box>
                    <Label htmlFor='entry-unit-cost'>Costo unitario</Label>
                    <Input
                      id='entry-unit-cost'
                      type='number'
                      min='0'
                      step='0.01'
                      value={unitCost}
                      onChange={(event) => onUnitCostChange(event.target.value)}
                      disabled={submitting}
                    />
                  </Box>
                  <Box>
                    <Label htmlFor='entry-batch-code'>Lote</Label>
                    <Input
                      id='entry-batch-code'
                      value={batchCode}
                      onChange={(event) => onBatchCodeChange(event.target.value)}
                      disabled={submitting}
                      placeholder='Ej. R57-240730'
                    />
                  </Box>
                </Box>

                <Box className='grid gap-4 md:grid-cols-2'>
                  <Box>
                    <Label htmlFor='entry-supplier'>Proveedor</Label>
                    <select
                      id='entry-supplier'
                      value={supplierId}
                      onChange={(event) => onSupplierChange(event.target.value)}
                      disabled={submitting}
                      className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
                    >
                      <option value=''>Sin proveedor específico</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </Box>

                  <Box>
                    <Label htmlFor='entry-expires-at'>
                      Vencimiento {selectedProduct?.isPerishable ? '(obligatorio)' : '(opcional)'}
                    </Label>
                    <Input
                      id='entry-expires-at'
                      type='date'
                      value={expiresAt}
                      onChange={(event) => onExpiresAtChange(event.target.value)}
                      disabled={submitting}
                    />
                  </Box>
                </Box>
              </>
            ) : null}

            <Box>
              <Label htmlFor='movement-note'>Nota</Label>
              <Input
                id='movement-note'
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                disabled={submitting}
                placeholder='Motivo del movimiento'
              />
            </Box>

            {selectedProduct ? (
              <Box className='rounded-2xl border border-neutral-gray/30 bg-background px-4 py-4 text-sm text-neutral-dark/75'>
                <strong>{selectedProduct.name}</strong>
                <div>SKU: {selectedProduct.sku}</div>
                <div>
                  Tipo: {selectedProduct.isPerishable ? 'Perecedero' : 'No perecedero'} ·
                  Lotes: {selectedProduct.trackBatches ? ' Sí' : ' No'}
                </div>
              </Box>
            ) : null}

            {error ? (
              <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </Box>
            ) : null}

            <Button type='submit' variant='primary' disabled={submitting}>
              {submitting ? 'Guardando...' : movementType === 'IN' ? 'Registrar lote' : 'Aplicar ajuste'}
            </Button>
          </form>
        </Box>

        <Box className='space-y-6'>
          <Box className='grid gap-4 lg:grid-cols-3'>
            <Box className='surface-card p-5'>
              <Typography variant='span' className='text-neutral-dark/55'>
                Productos con stock
              </Typography>
              <Typography variant='h2' className='mt-3 text-3xl'>
                {inventory.filter((item) => item.stock > 0).length}
              </Typography>
            </Box>
            <Box className='surface-card p-5'>
              <Typography variant='span' className='text-neutral-dark/55'>
                Lotes activos
              </Typography>
              <Typography variant='h2' className='mt-3 text-3xl'>
                {batches.filter((batch) => batch.availableQuantity > 0).length}
              </Typography>
            </Box>
            <Box className='surface-card p-5'>
              <Typography variant='span' className='text-neutral-dark/55'>
                Próximos vencimientos
              </Typography>
              <Typography variant='h2' className='mt-3 text-3xl'>
                {expiringBatches.length}
              </Typography>
            </Box>
          </Box>

          <Box className='surface-card p-6'>
            <Typography variant='h2' className='text-xl font-semibold'>
              Inventario general
            </Typography>
            <Box className='mt-5 overflow-x-auto'>
              {loading ? (
                <Typography>Cargando inventario...</Typography>
              ) : (
                <table className='min-w-full text-left text-sm'>
                  <thead>
                    <tr className='border-b border-neutral-gray/50 text-neutral-dark/55'>
                      <th className='px-3 py-3'>Producto</th>
                      <th className='px-3 py-3'>Stock</th>
                      <th className='px-3 py-3'>Lotes</th>
                      <th className='px-3 py-3'>Próximo vencimiento</th>
                      <th className='px-3 py-3'>Valor inventario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.productId} className='border-b border-neutral-gray/30 last:border-b-0'>
                        <td className='px-3 py-3'>
                          <div className='font-semibold'>{item.productName}</div>
                          <div className='text-neutral-dark/60'>
                            {item.sku} · {item.isPerishable ? 'Perecedero' : 'No perecedero'}
                          </div>
                        </td>
                        <td className='px-3 py-3'>{item.stock}</td>
                        <td className='px-3 py-3'>{item.activeBatchCount}</td>
                        <td className='px-3 py-3'>
                          {item.nextExpiration
                            ? new Date(item.nextExpiration).toLocaleDateString('es-CO')
                            : 'Sin vencimiento'}
                        </td>
                        <td className='px-3 py-3'>{formatCurrencyCOP(item.inventoryValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Box>
          </Box>

          <Box className='grid gap-6 xl:grid-cols-2'>
            <Box className='surface-card p-6'>
              <Typography variant='h2' className='text-xl font-semibold'>
                Lotes y vencimientos
              </Typography>
              <Box className='mt-5 space-y-3'>
                {batches.slice(0, 10).map((batch) => (
                  <Box key={batch.id} className='rounded-2xl border border-neutral-gray/20 px-4 py-4'>
                    <Box className='flex items-start justify-between gap-4'>
                      <Box>
                        <Typography variant='h3'>{batch.product.name}</Typography>
                        <Typography className='text-sm text-neutral-dark/65'>
                          Lote: {batch.batchCode || 'Sin código'} · {batch.product.sku}
                        </Typography>
                      </Box>
                      <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'>
                        {batch.status}
                      </span>
                    </Box>
                    <Typography className='mt-2 text-sm text-neutral-dark/70'>
                      Disponible: {batch.availableQuantity}/{batch.initialQuantity} ·
                      Costo: {formatCurrencyCOP(batch.unitCost)}
                    </Typography>
                    <Typography className='mt-1 text-sm text-neutral-dark/65'>
                      Vence: {batch.expiresAt ? new Date(batch.expiresAt).toLocaleDateString('es-CO') : 'No aplica'} ·
                      Proveedor: {batch.supplier?.name ?? 'No definido'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box className='surface-card p-6'>
              <Typography variant='h2' className='text-xl font-semibold'>
                Alertas de vencimiento
              </Typography>
              <Box className='mt-5 space-y-3'>
                {expiringBatches.length === 0 ? (
                  <Typography>No hay lotes próximos a vencer.</Typography>
                ) : (
                  expiringBatches.slice(0, 8).map((batch) => (
                    <Box key={batch.id} className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4'>
                      <Typography variant='h3'>{batch.product.name}</Typography>
                      <Typography className='mt-1 text-sm text-neutral-dark/70'>
                        {batch.availableQuantity} unidades · vence el{' '}
                        {batch.expiresAt
                          ? new Date(batch.expiresAt).toLocaleDateString('es-CO')
                          : 'sin fecha'}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>

          <Box className='surface-card p-6'>
            <Typography variant='h2' className='text-xl font-semibold'>
              Movimientos recientes
            </Typography>
            <Box className='mt-5 space-y-3'>
              {loading ? (
                <Typography>Cargando movimientos...</Typography>
              ) : movements.length === 0 ? (
                <Typography>No hay movimientos registrados todavía.</Typography>
              ) : (
                movements.slice(0, 12).map((movement) => (
                  <Box key={movement.id} className='rounded-2xl border border-neutral-gray/20 px-5 py-4'>
                    <Box className='flex flex-wrap items-center justify-between gap-3'>
                      <Typography variant='h3' className='text-lg font-semibold'>
                        {movement.product.name}
                      </Typography>
                      <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'>
                        {movement.movementType}
                      </span>
                    </Box>
                    <Typography className='mt-2 text-sm text-neutral-dark/70'>
                      Delta: {movement.quantityDelta > 0 ? '+' : ''}
                      {movement.quantityDelta} · Lote: {movement.batch?.batchCode || 'N/D'}
                    </Typography>
                    <Typography className='mt-1 text-sm text-neutral-dark/65'>
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
