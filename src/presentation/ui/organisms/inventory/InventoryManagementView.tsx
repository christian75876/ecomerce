import { useState } from 'react';
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
import FeatureMetricCard from '@/presentation/ui/templates/feature/FeatureMetricCard';
import FeaturePanel from '@/presentation/ui/templates/feature/FeaturePanel';
import FeatureScreen from '@/presentation/ui/templates/feature/FeatureScreen';
import FeatureScreenHeader from '@/presentation/ui/templates/feature/FeatureScreenHeader';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { Pagination } from '@/presentation/ui/molecules/common/Pagination';
import { CurrencyInput } from '@/presentation/ui/atoms/input/CurrencyInput';

// ── SearchCombobox ────────────────────────────────────────────────────────────
const SearchCombobox = ({
  items,
  value,
  onChange,
  placeholder,
  allLabel,
  disabled,
}: {
  items: { id: string; label: string; secondary?: string | null }[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  allLabel?: string;
  disabled?: boolean;
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const allItems = allLabel ? [{ id: '', label: allLabel, secondary: undefined }, ...items] : items;
  const selected = allItems.find(i => i.id === value) ?? null;

  const filtered = query.trim()
    ? allItems.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        (i.secondary ?? '').toLowerCase().includes(query.toLowerCase()),
      )
    : allItems;

  return (
    <div className='relative'>
      {selected && !allLabel ? (
        <div className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
          <span className='flex-1 text-sm text-slate-700'>{selected.label}</span>
          <button
            type='button'
            onClick={() => onChange('')}
            disabled={disabled}
            className='text-slate-400 transition hover:text-red-500 disabled:opacity-50'
          >
            <i className='bx bx-x text-base' />
          </button>
        </div>
      ) : (
        <>
          <div className='relative'>
            <i className='bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400' />
            <input
              value={open ? query : (selected?.label ?? '')}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={e => { if (selected) e.target.select(); setOpen(true); }}
              onBlur={() => setTimeout(() => { setOpen(false); setQuery(''); }, 200)}
              placeholder={placeholder}
              disabled={disabled}
              className='w-full rounded-2xl border border-gray-300 bg-white py-3 pl-9 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:opacity-50'
            />
          </div>
          {open && (
            <div className='absolute z-30 mt-1 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
              <div className='max-h-52 overflow-y-auto'>
                {filtered.slice(0, 12).map(item => (
                  <button
                    key={item.id || '__all__'}
                    type='button'
                    onMouseDown={() => { onChange(item.id); setQuery(''); setOpen(false); }}
                    className={`flex w-full flex-col px-4 py-2.5 text-left text-sm transition hover:bg-primary/5 ${value === item.id ? 'font-semibold text-primary' : 'text-slate-700'}`}
                  >
                    <span>{item.label}</span>
                    {item.secondary ? <span className='text-xs text-slate-400'>{item.secondary}</span> : null}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className='px-4 py-3 text-xs text-slate-400'>Sin resultados</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── SegmentedToggle ───────────────────────────────────────────────────────────
function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: T; label: string; icon?: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className='flex rounded-2xl border border-slate-200 bg-slate-100 p-1 gap-1'>
      {options.map(opt => (
        <button
          key={opt.value}
          type='button'
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
            value === opt.value
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.icon ? <i className={`bx ${opt.icon} text-base`} /> : null}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

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
  inventoryPagination: { page: number; totalPages: number; totalItems: number; itemsPerPage: number; goToPage: (p: number) => void };
  movementsPagination: { page: number; totalPages: number; totalItems: number; itemsPerPage: number; goToPage: (p: number) => void };
  batchesPagination: { page: number; totalPages: number; totalItems: number; itemsPerPage: number; goToPage: (p: number) => void };
  expiringPagination: { page: number; totalPages: number; totalItems: number; itemsPerPage: number; goToPage: (p: number) => void };
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
  inventoryPagination,
  movementsPagination,
  batchesPagination,
  expiringPagination,
}: InventoryManagementViewProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  const lowStockAlerts = inventory.filter(
    (item) => item.lowStockThreshold != null && item.stock <= item.lowStockThreshold,
  );

  return (
    <FeatureScreen>
      <FeatureScreenHeader
        title='Inventario y lotes'
        description='El inventario ahora se calcula por lotes. Cada ingreso crea una capa con costo, proveedor y vencimiento opcional, y el stock total del producto sale de sus existencias disponibles.'
      />

      <Box className='grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]'>
        <FeaturePanel
          title={movementType === 'IN' ? 'Nuevo ingreso por lote' : 'Ajuste de inventario'}
        >
          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <Box>
              <Label htmlFor='inventory-product'>Producto</Label>
              <SearchCombobox
                items={products.map(p => ({ id: p.id, label: p.name, secondary: p.sku }))}
                value={productId}
                onChange={onProductChange}
                placeholder='Buscar producto…'
                disabled={submitting}
              />
            </Box>

            <Box className='grid gap-4 md:grid-cols-2'>
              <Box>
                <Label htmlFor='movement-type'>Operación</Label>
                <SegmentedToggle
                  options={[
                    { value: 'IN' as const, label: 'Ingreso', icon: 'bx-plus-circle' },
                    { value: 'ADJUSTMENT' as const, label: 'Ajuste', icon: 'bx-slider' },
                  ]}
                  value={movementType}
                  onChange={onMovementTypeChange}
                  disabled={submitting}
                />
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
                    <CurrencyInput
                      id='entry-unit-cost'
                      value={unitCost}
                      onChange={onUnitCostChange}
                      disabled={submitting}
                      className='w-full rounded-2xl border border-gray-300 bg-white py-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:opacity-50'
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
                    <SearchCombobox
                      items={suppliers.map(s => ({ id: s.id, label: s.name }))}
                      value={supplierId}
                      onChange={onSupplierChange}
                      placeholder='Sin proveedor específico'
                      allLabel='Sin proveedor específico'
                      disabled={submitting}
                    />
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
        </FeaturePanel>

        <Box className='space-y-6'>
          <Box className='grid gap-4 lg:grid-cols-4'>
            <FeatureMetricCard
              label='Productos con stock'
              value={inventory.filter((item) => item.stock > 0).length}
            />
            <FeatureMetricCard
              label='Lotes activos'
              value={batches.filter((batch) => batch.availableQuantity > 0).length}
            />
            <FeatureMetricCard
              label='Próximos vencimientos'
              value={expiringPagination.totalItems}
            />
            <Box className={`rounded-2xl border px-5 py-4 ${lowStockAlerts.length > 0 ? 'border-red-200 bg-red-50' : 'border-neutral-gray/20 bg-white'}`}>
              <Typography className={`text-xs font-medium ${lowStockAlerts.length > 0 ? 'text-red-500' : 'text-neutral-dark/55'}`}>
                Alertas de stock bajo
              </Typography>
              <Typography variant='h2' className={`mt-1 text-3xl font-bold ${lowStockAlerts.length > 0 ? 'text-red-600' : 'text-neutral-dark'}`}>
                {lowStockAlerts.length}
              </Typography>
            </Box>
          </Box>

          <FeaturePanel title='Inventario general'>
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
                    {inventory.map((item) => {
                      const isLow = item.lowStockThreshold != null && item.stock <= item.lowStockThreshold;
                      return (
                      <tr key={item.productId} className={`border-b border-neutral-gray/30 last:border-b-0 ${isLow ? 'bg-red-50/60' : ''}`}>
                        <td className='px-3 py-3'>
                          <div className='flex items-center gap-2 font-semibold'>
                            {item.productName}
                            {isLow ? (
                              <span className='inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600'>
                                <i className='bx bx-error-circle' />
                                Stock bajo
                              </span>
                            ) : null}
                          </div>
                          <div className='text-neutral-dark/60'>
                            {item.sku} · {item.isPerishable ? 'Perecedero' : 'No perecedero'}
                          </div>
                        </td>
                        <td className={`px-3 py-3 font-semibold tabular-nums ${isLow ? 'text-red-600' : ''}`}>
                          {item.stock}
                          {item.lowStockThreshold != null ? (
                            <span className='ml-1 text-xs font-normal text-slate-400'>/ mín {item.lowStockThreshold}</span>
                          ) : null}
                        </td>
                        <td className='px-3 py-3'>{item.activeBatchCount}</td>
                        <td className='px-3 py-3'>
                          {item.nextExpiration
                            ? new Date(item.nextExpiration).toLocaleDateString('es-CO')
                            : 'Sin vencimiento'}
                        </td>
                        <td className='px-3 py-3'>{formatCurrencyCOP(item.inventoryValue)}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              <Pagination
                currentPage={inventoryPagination.page}
                totalPages={inventoryPagination.totalPages}
                totalItems={inventoryPagination.totalItems}
                itemsPerPage={inventoryPagination.itemsPerPage}
                onPageChange={inventoryPagination.goToPage}
                className='mt-4'
              />
            </Box>
          </FeaturePanel>

          {/* Low stock alerts panel */}
          {lowStockAlerts.length > 0 ? (
            <FeaturePanel title={`Alertas de stock bajo (${lowStockAlerts.length})`}>
              <Box className='mt-5 space-y-2'>
                {lowStockAlerts.map((item) => (
                  <Box
                    key={item.productId}
                    className='flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3'
                  >
                    <i className='bx bx-error-circle flex-shrink-0 text-xl text-red-500' aria-hidden='true' />
                    <Box className='min-w-0 flex-1'>
                      <Typography className='truncate font-semibold text-red-700'>{item.productName}</Typography>
                      <Typography className='text-xs text-red-500'>
                        SKU: {item.sku} · Stock actual: <strong>{item.stock}</strong> · Mínimo: {item.lowStockThreshold}
                      </Typography>
                    </Box>
                    <span className='flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600'>
                      Reponer
                    </span>
                  </Box>
                ))}
              </Box>
            </FeaturePanel>
          ) : null}

          <Box className='grid gap-6 xl:grid-cols-2'>
            <FeaturePanel title='Lotes y vencimientos'>
              <Box className='mt-5 space-y-3'>
                {batches.length === 0 ? (
                  <Typography>No hay lotes registrados.</Typography>
                ) : (
                  batches.map((batch) => (
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
                  ))
                )}
                <Pagination
                  currentPage={batchesPagination.page}
                  totalPages={batchesPagination.totalPages}
                  totalItems={batchesPagination.totalItems}
                  itemsPerPage={batchesPagination.itemsPerPage}
                  onPageChange={batchesPagination.goToPage}
                  className='pt-2'
                />
              </Box>
            </FeaturePanel>

            <FeaturePanel title='Alertas de vencimiento'>
              <Box className='mt-5 space-y-3'>
                {expiringBatches.length === 0 ? (
                  <Typography>No hay lotes próximos a vencer.</Typography>
                ) : (
                  expiringBatches.map((batch) => (
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
                <Pagination
                  currentPage={expiringPagination.page}
                  totalPages={expiringPagination.totalPages}
                  totalItems={expiringPagination.totalItems}
                  itemsPerPage={expiringPagination.itemsPerPage}
                  onPageChange={expiringPagination.goToPage}
                  className='pt-2'
                />
              </Box>
            </FeaturePanel>
          </Box>

          <FeaturePanel title='Movimientos recientes'>
            <Box className='mt-5 space-y-3'>
              {loading ? (
                <Typography>Cargando movimientos...</Typography>
              ) : movements.length === 0 ? (
                <Typography>No hay movimientos registrados todavía.</Typography>
              ) : (
                movements.map((movement) => (
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
              <Pagination
                currentPage={movementsPagination.page}
                totalPages={movementsPagination.totalPages}
                totalItems={movementsPagination.totalItems}
                itemsPerPage={movementsPagination.itemsPerPage}
                onPageChange={movementsPagination.goToPage}
                className='mt-4'
              />
            </Box>
          </FeaturePanel>
        </Box>
      </Box>
    </FeatureScreen>
  );
};
