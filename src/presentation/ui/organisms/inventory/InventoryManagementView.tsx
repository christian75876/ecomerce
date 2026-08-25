import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IInventoryBatch,
  IInventoryItem,
  IInventoryMovement,
} from '@/application/dtos/inventory/response/InventoryResponse';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { QuickCreateModal } from '@/presentation/ui/molecules/common/QuickCreateModal';
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
import { truncateText } from '@/shared/utils/truncateText';
import { formatThousands } from '@/shared/utils/formatThousands';
import SelectDropdown from '@/presentation/ui/molecules/common/SelectDropdown';

const QuickCreateProductModal = ({
  onConfirm,
  onClose,
}: {
  onConfirm: (payload: {
    name: string;
    description: string;
    sku?: string;
    price: number;
    categoryId: string;
    storeId?: string;
  }) => Promise<void>;
  onClose: () => void;
}) => {
  const isSeller = getAuthenticatedRole() === 'seller';
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [storeId, setStoreId] = useState('');

  useEffect(() => {
    const load = async () => {
      setDataLoading(true);
      try {
        const [catResp, storeResp] = await Promise.all([
          CategoriesRepository.getCategories(true),
          isSeller
            ? StoresRepository.getMyStores()
            : StoresRepository.getStores({ active: true }),
        ]);
        setCategories(catResp.data);
        const storeList = storeResp.data;
        setStores(storeList);
        if (isSeller && storeList.length > 0) setStoreId(storeList[0].id);
      } catch {
        // non-fatal — user can still type
      } finally {
        setDataLoading(false);
      }
    };
    void load();
  }, [isSeller]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) return;
    setSaving(true);
    await onConfirm({
      name,
      description,
      sku: sku.trim() || undefined,
      price: Number(price),
      categoryId,
      storeId: storeId || undefined,
    });
    setSaving(false);
  };

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-neutral-dark/50 px-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-neutral-gray/20 px-6 py-4'>
          <h2 className='text-lg font-bold text-neutral-dark'>Nuevo producto</h2>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full text-neutral-dark/50 hover:bg-neutral-gray/20'
          >
            <i className='bx bx-x text-xl' aria-hidden='true' />
          </button>
        </div>

        <div className='overflow-y-auto p-6'>
          {dataLoading ? (
            <p className='py-8 text-center text-sm text-neutral-dark/55'>Cargando...</p>
          ) : (
            <form id='quick-product-form' onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-neutral-dark'>
                  Nombre <span className='text-red-500'>*</span>
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Ej. Camiseta talla M'
                  disabled={saving}
                  className='w-full rounded-xl border border-neutral-gray/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-neutral-dark'>
                    Precio <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    min='0'
                    step='0.01'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder='0.00'
                    disabled={saving}
                    className='w-full rounded-xl border border-neutral-gray/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-neutral-dark'>SKU</label>
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder='Opcional'
                    disabled={saving}
                    className='w-full rounded-xl border border-neutral-gray/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-neutral-dark'>
                  Categoría <span className='text-red-500'>*</span>
                </label>
                <SelectDropdown
                  value={categoryId}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder='Selecciona una categoría'
                  disabled={saving}
                  onChange={(v) => setCategoryId(v)}
                />
              </div>

              {!isSeller ? (
                <div>
                  <label className='mb-1 block text-sm font-medium text-neutral-dark'>Tienda</label>
                  <SelectDropdown
                    value={storeId}
                    options={stores.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder='Sin tienda'
                    disabled={saving}
                    onChange={(v) => setStoreId(v)}
                  />
                </div>
              ) : (
                <div className='rounded-xl border border-neutral-gray/20 bg-background px-4 py-3 text-sm text-neutral-dark'>
                  <span className='text-neutral-dark/55'>Tienda: </span>
                  {stores[0]?.name ?? '—'}
                </div>
              )}

              <div>
                <label className='mb-1 block text-sm font-medium text-neutral-dark'>
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Opcional — se usa el nombre si se deja vacío'
                  disabled={saving}
                  rows={2}
                  className='w-full resize-none rounded-xl border border-neutral-gray/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
            </form>
          )}
        </div>

        <div className='border-t border-neutral-gray/20 px-6 py-4'>
          <div className='flex gap-2'>
            <button
              type='submit'
              form='quick-product-form'
              disabled={saving || dataLoading || !name.trim() || !price || !categoryId}
              className='flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
            >
              {saving ? 'Creando...' : 'Crear producto'}
            </button>
            <button
              type='button'
              onClick={onClose}
              disabled={saving}
              className='rounded-xl border border-neutral-gray/30 px-4 py-2.5 text-sm font-semibold text-neutral-dark/70 transition hover:bg-neutral-gray/10'
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};


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
  onQuickCreateSupplier: (name: string) => Promise<ISupplier | null>;
  onQuickCreateProduct: (payload: {
    name: string;
    description: string;
    sku?: string;
    price: number;
    categoryId: string;
    storeId?: string;
  }) => Promise<IProduct | null>;
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
  onQuickCreateSupplier,
  onQuickCreateProduct,
}: InventoryManagementViewProps) => {
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);

  // Inventory table filters (client-side)
  const [invSearch, setInvSearch] = useState('');
  const [invStockFilter, setInvStockFilter] = useState<'all' | 'with' | 'low' | 'out'>('all');
  const [invTypeFilter, setInvTypeFilter] = useState<'all' | 'perishable' | 'non-perishable'>('all');

  const filteredInventory = inventory.filter((item) => {
    if (invSearch.trim()) {
      const q = invSearch.trim().toLowerCase();
      if (
        !item.productName.toLowerCase().includes(q) &&
        !(item.sku ?? '').toLowerCase().includes(q) &&
        !(item.category ?? '').toLowerCase().includes(q)
      ) return false;
    }
    if (invStockFilter === 'out' && item.stock !== 0) return false;
    if (invStockFilter === 'with' && item.stock <= 0) return false;
    if (invStockFilter === 'low' && !(item.lowStockThreshold != null && item.stock <= item.lowStockThreshold)) return false;
    if (invTypeFilter === 'perishable' && !item.isPerishable) return false;
    if (invTypeFilter === 'non-perishable' && item.isPerishable) return false;
    return true;
  });

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

      <Box className='grid grid-cols-1 gap-6 xl:grid-cols-[430px_minmax(0,1fr)]'>
        <FeaturePanel
          title={movementType === 'IN' ? 'Nuevo ingreso por lote' : 'Ajuste de inventario'}
        >
          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <Box>
              <Label htmlFor='inventory-product'>Producto</Label>
              <SelectDropdown
                value={productId}
                options={products.map((p) => ({
                  value: p.id,
                  label: `${p.name}${p.sku ? ` (${p.sku})` : ''}`,
                }))}
                placeholder='Selecciona un producto'
                disabled={submitting}
                onCreateClick={() => setShowCreateProductModal(true)}
                createLabel='+ Nuevo producto'
                onChange={(v) => onProductChange(v)}
              />
            </Box>

            <Box className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Box>
                <Label htmlFor='movement-type'>Operación</Label>
                <SelectDropdown
                  value={movementType}
                  options={[
                    { value: 'IN', label: 'Ingreso' },
                    { value: 'ADJUSTMENT', label: 'Ajuste' },
                  ]}
                  disabled={submitting}
                  onChange={(v) => onMovementTypeChange(v as 'IN' | 'ADJUSTMENT')}
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
                <Box className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <Box>
                    <Label htmlFor='entry-unit-cost'>Costo unitario</Label>
                    <div className='relative'>
                      <span className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-sm text-slate-400'>$</span>
                      <input
                        id='entry-unit-cost'
                        type='text'
                        inputMode='numeric'
                        value={formatThousands(unitCost)}
                        onChange={(event) => onUnitCostChange(event.target.value.replace(/\D/g, ''))}
                        disabled={submitting}
                        placeholder='0'
                        className='w-full rounded-xl border border-neutral-gray/30 py-2.5 pl-7 pr-4 text-sm text-neutral-dark placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60'
                      />
                    </div>
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

                <Box className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <Box>
                    <Label htmlFor='entry-supplier'>Proveedor</Label>
                    <SelectDropdown
                      value={supplierId}
                      options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                      placeholder='Sin proveedor específico'
                      disabled={submitting}
                      onCreateClick={() => setShowCreateSupplierModal(true)}
                      createLabel='+ Nuevo proveedor'
                      onChange={(v) => onSupplierChange(v)}
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
              <Box className='flex items-center gap-3 rounded-2xl border border-neutral-gray/30 bg-background px-4 py-4 text-sm text-neutral-dark/75'>
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className='h-14 w-14 flex-shrink-0 rounded-xl object-cover'
                  />
                ) : (
                  <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-gray/15'>
                    <i className='bx bx-image text-2xl text-neutral-dark/30' aria-hidden='true' />
                  </div>
                )}
                <div className='min-w-0'>
                  <strong className='block truncate'>{selectedProduct.name}</strong>
                  <div>SKU: {selectedProduct.sku}</div>
                  <div>
                    Tipo: {selectedProduct.isPerishable ? 'Perecedero' : 'No perecedero'} ·
                    Lotes: {selectedProduct.trackBatches ? ' Sí' : ' No'}
                  </div>
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

        <Box className='min-w-0 space-y-6'>
          <Box className='grid min-w-0 grid-cols-2 gap-4 lg:grid-cols-4'>
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
              value={expiringBatches.length}
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
            {/* Search + filters */}
            <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
              <div className='relative flex-1'>
                <i className='bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-neutral-dark/40' aria-hidden='true' />
                <input
                  type='text'
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  placeholder='Buscar por nombre, SKU o categoría...'
                  className='w-full rounded-2xl border border-neutral-gray/80 bg-white/90 py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
                />
                {invSearch ? (
                  <button
                    type='button'
                    onClick={() => setInvSearch('')}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark/40 transition hover:text-neutral-dark'
                    aria-label='Limpiar búsqueda'
                  >
                    <i className='bx bx-x text-base' aria-hidden='true' />
                  </button>
                ) : null}
              </div>

              {/* Stock filter pills */}
              <div className='flex flex-wrap gap-1.5'>
                {(
                  [
                    { key: 'all', label: 'Todos' },
                    { key: 'with', label: 'Con stock' },
                    { key: 'low', label: 'Stock bajo' },
                    { key: 'out', label: 'Sin stock' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type='button'
                    onClick={() => setInvStockFilter(key)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      invStockFilter === key
                        ? 'bg-primary text-white'
                        : 'bg-neutral-gray/15 text-neutral-dark/60 hover:bg-neutral-gray/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Type filter pills */}
              <div className='flex flex-wrap gap-1.5'>
                {(
                  [
                    { key: 'all', label: 'Todos' },
                    { key: 'perishable', label: 'Perecedero' },
                    { key: 'non-perishable', label: 'No perecedero' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type='button'
                    onClick={() => setInvTypeFilter(key)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      invTypeFilter === key
                        ? 'bg-accent text-white'
                        : 'bg-neutral-gray/15 text-neutral-dark/60 hover:bg-neutral-gray/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Box className='mt-4'>
              {loading ? (
                <div className='space-y-3'>
                  <div className='h-12 skeleton rounded-2xl' />
                  <div className='h-12 skeleton rounded-2xl' />
                  <div className='h-12 skeleton rounded-2xl' />
                  <div className='h-12 skeleton rounded-2xl' />
                  <div className='h-12 skeleton rounded-2xl' />
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className='rounded-2xl border border-dashed border-neutral-gray/40 bg-background px-6 py-10 text-center'>
                  <p className='text-sm text-neutral-dark/55'>
                    {inventory.length === 0
                      ? 'No hay productos en el inventario.'
                      : 'No se encontraron productos con los filtros aplicados.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile — tarjetas apiladas */}
                  <div className='space-y-2.5 md:hidden'>
                    {filteredInventory.map((item) => {
                      const isLow = item.lowStockThreshold != null && item.stock <= item.lowStockThreshold;
                      return (
                        <Box
                          key={item.productId}
                          className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${isLow ? 'border-red-200 bg-red-50/60' : 'border-neutral-gray/20'}`}
                        >
                          <div
                            className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                              isLow ? 'bg-red-100 text-red-600' : 'bg-neutral-gray/10 text-neutral-dark/50'
                            }`}
                          >
                            <i className='bx bx-package text-lg' aria-hidden='true' />
                          </div>

                          <div className='min-w-0 flex-1'>
                            <div className='flex items-start justify-between gap-2'>
                              <p
                                className='min-w-0 flex-1 truncate font-semibold text-neutral-dark'
                                title={item.productName}
                              >
                                {truncateText(item.productName, 35)}
                              </p>
                              {isLow ? (
                                <span className='flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600'>
                                  Stock bajo
                                </span>
                              ) : null}
                            </div>
                            <p className='mt-0.5 truncate text-xs text-neutral-dark/50'>
                              {item.sku} · {item.category ?? 'Sin categoría'}
                            </p>

                            <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-dark/60'>
                              <span>
                                Stock:{' '}
                                <strong className={isLow ? 'font-bold text-red-600' : 'font-semibold text-neutral-dark'}>
                                  {item.stock}
                                </strong>
                                {item.lowStockThreshold != null ? (
                                  <span className='text-neutral-dark/40'> /mín {item.lowStockThreshold}</span>
                                ) : null}
                              </span>
                              <span>
                                Lotes: <strong className='font-semibold text-neutral-dark'>{item.activeBatchCount}</strong>
                              </span>
                              <span>
                                Vence:{' '}
                                <strong className='font-semibold text-neutral-dark'>
                                  {item.nextExpiration
                                    ? new Date(item.nextExpiration).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })
                                    : '—'}
                                </strong>
                              </span>
                            </div>

                            <p className='mt-1.5 text-sm font-bold text-primary'>
                              {formatCurrencyCOP(item.inventoryValue)}
                            </p>
                          </div>
                        </Box>
                      );
                    })}
                  </div>

                  {/* Desktop/tablet — tabla */}
                  <div className='hidden overflow-x-auto md:block'>
                    <table className='min-w-full text-left text-sm'>
                      <thead>
                        <tr className='border-b border-neutral-gray/50 text-neutral-dark/55'>
                          <th className='px-3 py-3'>Producto</th>
                          <th className='px-3 py-3'>Categoría</th>
                          <th className='px-3 py-3'>Stock</th>
                          <th className='px-3 py-3'>Lotes</th>
                          <th className='px-3 py-3'>Próximo vencimiento</th>
                          <th className='px-3 py-3'>Valor inventario</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInventory.map((item) => {
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
                            <td className='px-3 py-3 text-neutral-dark/65'>{item.category ?? '—'}</td>
                            <td className={`px-3 py-3 font-semibold tabular-nums ${isLow ? 'text-red-600' : ''}`}>
                              {item.stock}
                              {item.lowStockThreshold != null ? (
                                <span className='ml-1 text-xs font-normal text-slate-400'>/ mín {item.lowStockThreshold}</span>
                              ) : null}
                            </td>
                            <td className='px-3 py-3'>{item.activeBatchCount}</td>
                            <td className='px-3 py-3'>
                              {item.nextExpiration
                                ? new Date(item.nextExpiration).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })
                                : 'Sin vencimiento'}
                            </td>
                            <td className='px-3 py-3'>{formatCurrencyCOP(item.inventoryValue)}</td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Box>
            {!loading && filteredInventory.length > 0 ? (
              <p className='mt-2 text-right text-xs text-neutral-dark/40'>
                {filteredInventory.length} de {inventory.length} productos
              </p>
            ) : null}
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
                      <Typography className='truncate font-semibold text-red-700' title={item.productName}>
                        {truncateText(item.productName, 35)}
                      </Typography>
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

          <Box className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
            <FeaturePanel title='Lotes y vencimientos'>
              <Box className='mt-5 space-y-3'>
                {batches.length === 0 && !loading ? (
                  <Box className='flex flex-col items-center rounded-2xl border border-dashed border-neutral-gray/30 py-12 text-center'>
                    <i className='bx bx-package mb-3 text-4xl text-neutral-dark/20' aria-hidden='true' />
                    <Typography className='font-semibold text-neutral-dark/50'>Sin lotes registrados</Typography>
                    <Typography className='mt-1 text-sm text-neutral-dark/35'>Los lotes aparecerán aquí al agregarlos al inventario.</Typography>
                  </Box>
                ) : batches.slice(0, 10).map((batch) => (
                  <Box key={batch.id} className='rounded-2xl border border-neutral-gray/20 px-4 py-4'>
                    <Box className='flex items-start justify-between gap-4'>
                      <Box className='min-w-0 flex-1'>
                        <Typography variant='h3' className='truncate' title={batch.product.name}>
                          {truncateText(batch.product.name, 35)}
                        </Typography>
                        <Typography className='text-sm text-neutral-dark/65'>
                          Lote: {batch.batchCode || 'Sin código'}
                        </Typography>
                      </Box>
                      <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'>
                        {{ ACTIVE: 'Activo', DEPLETED: 'Agotado', EXPIRED: 'Vencido' }[batch.status as string] ?? batch.status}
                      </span>
                    </Box>
                    <Typography className='mt-2 text-sm text-neutral-dark/70'>
                      Disponible: {batch.availableQuantity}/{batch.initialQuantity} ·
                      Costo: {formatCurrencyCOP(batch.unitCost)}
                    </Typography>
                    <Typography className='mt-1 text-sm text-neutral-dark/65'>
                      Vence: {batch.expiresAt ? new Date(batch.expiresAt).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' }) : 'No aplica'} ·
                      Proveedor: {batch.supplier?.name ?? 'No definido'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </FeaturePanel>

            <FeaturePanel title='Alertas de vencimiento'>
              <Box className='mt-5 space-y-3'>
                {expiringBatches.length === 0 ? (
                  <Typography>No hay lotes próximos a vencer.</Typography>
                ) : (
                  expiringBatches.slice(0, 8).map((batch) => (
                    <Box key={batch.id} className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4'>
                      <Typography variant='h3' className='truncate' title={batch.product.name}>
                        {truncateText(batch.product.name, 35)}
                      </Typography>
                      <Typography className='mt-1 text-sm text-neutral-dark/70'>
                        {batch.availableQuantity} unidades · vence el{' '}
                        {batch.expiresAt
                          ? new Date(batch.expiresAt).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })
                          : 'sin fecha'}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </FeaturePanel>
          </Box>

          <FeaturePanel title='Movimientos recientes'>
            <Box className='mt-5 space-y-3'>
              {loading ? (
                <>
                  <div className='h-10 skeleton rounded-2xl' />
                  <div className='h-10 skeleton rounded-2xl' />
                  <div className='h-10 skeleton rounded-2xl' />
                </>
              ) : movements.length === 0 ? (
                <Typography>No hay movimientos registrados todavía.</Typography>
              ) : (
                movements.slice(0, 12).map((movement) => (
                  <Box key={movement.id} className='rounded-2xl border border-neutral-gray/20 px-5 py-4'>
                    <Box className='flex items-center justify-between gap-3'>
                      <Typography
                        variant='h3'
                        className='min-w-0 flex-1 truncate text-lg font-semibold'
                        title={movement.product.name}
                      >
                        {truncateText(movement.product.name, 35)}
                      </Typography>
                      <span className='flex-shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'>
                        {{ IN: 'Ingreso', OUT: 'Salida', ADJUSTMENT: 'Ajuste', SALE: 'Venta', ORDER: 'Pedido', RETURN: 'Devolución' }[movement.movementType as string] ?? movement.movementType}
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
          </FeaturePanel>
        </Box>
      </Box>

      {showCreateProductModal ? (
        <QuickCreateProductModal
          onClose={() => setShowCreateProductModal(false)}
          onConfirm={async (payload) => {
            const created = await onQuickCreateProduct(payload);
            if (created) onProductChange(created.id);
            setShowCreateProductModal(false);
          }}
        />
      ) : null}

      {showCreateSupplierModal ? (
        <QuickCreateModal
          title='Nuevo proveedor'
          placeholder='Ej. Distribuidora ABC'
          onClose={() => setShowCreateSupplierModal(false)}
          onConfirm={async (name) => {
            const created = await onQuickCreateSupplier(name);
            if (created) onSupplierChange(created.id);
            setShowCreateSupplierModal(false);
          }}
        />
      ) : null}
    </FeatureScreen>
  );
};
