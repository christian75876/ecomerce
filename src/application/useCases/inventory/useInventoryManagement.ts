import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/application/useCases/common/usePagination';
import {
  IInventoryBatch,
  IInventoryItem,
  IInventoryMovement,
} from '@/application/dtos/inventory/response/InventoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { InventoryRepository } from '@/infrastructure/repositories/api/inventory/InventoryRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';

export const useInventoryManagement = (filterStoreId?: string | null) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [inventory, setInventory] = useState<IInventoryItem[]>([]);
  const [movements, setMovements] = useState<IInventoryMovement[]>([]);
  const [batches, setBatches] = useState<IInventoryBatch[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<IInventoryBatch[]>([]);
  const [productId, setProductId] = useState('');
  const [movementType, setMovementType] = useState<'IN' | 'ADJUSTMENT'>('IN');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inventoryPagination = usePagination(20);
  const movementsPagination = usePagination(20);
  const batchesPagination = usePagination(20);
  const expiringPagination = usePagination(20);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products],
  );

  // ── individual loaders ──────────────────────────────────────────────────────

  const loadInventorySummary = useCallback(async (page: number, limit: number) => {
    const res = await InventoryRepository.getInventory(page, limit);
    setInventory(res.data.items);
    inventoryPagination.updateMeta(res.data.pagination);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStoreId]);

  const loadMovements = useCallback(async (page: number, limit: number) => {
    const res = await InventoryRepository.getMovements(undefined, page, limit);
    setMovements(res.data.items);
    movementsPagination.updateMeta(res.data.pagination);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStoreId]);

  const loadBatches = useCallback(async (page: number, limit: number) => {
    const res = await InventoryRepository.getBatches(
      filterStoreId
        ? { storeId: filterStoreId, page, limit }
        : { page, limit },
    );
    setBatches(res.data.items);
    batchesPagination.updateMeta(res.data.pagination);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStoreId]);

  const loadExpiring = useCallback(async (page: number, limit: number) => {
    const res = await InventoryRepository.getExpiring(30, filterStoreId ?? undefined, page, limit);
    setExpiringBatches(res.data.items);
    expiringPagination.updateMeta(res.data.pagination);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStoreId]);

  // ── initial full load ───────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        ProductRepository.getProducts({ limit: 200 }),
        SuppliersRepository.getSuppliers(),
      ]);
      setProducts(productsRes.data.items);
      setSuppliers(suppliersRes.data.filter((s) => s.isActive));

      await Promise.all([
        loadInventorySummary(1, inventoryPagination.limit),
        loadMovements(1, movementsPagination.limit),
        loadBatches(1, batchesPagination.limit),
        loadExpiring(1, expiringPagination.limit),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar el módulo de inventario',
      );
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStoreId]);

  // ── effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!loading) void loadInventorySummary(inventoryPagination.page, inventoryPagination.limit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryPagination.page]);

  useEffect(() => {
    if (!loading) void loadMovements(movementsPagination.page, movementsPagination.limit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movementsPagination.page]);

  useEffect(() => {
    if (!loading) void loadBatches(batchesPagination.page, batchesPagination.limit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchesPagination.page]);

  useEffect(() => {
    if (!loading) void loadExpiring(expiringPagination.page, expiringPagination.limit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiringPagination.page]);

  // ── form ────────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setProductId('');
    setMovementType('IN');
    setQuantity('');
    setUnitCost('');
    setSupplierId('');
    setBatchCode('');
    setExpiresAt('');
    setNote('');
  };

  const submitForm = async () => {
    if (!productId || !quantity) {
      setError('Selecciona producto y cantidad');
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (movementType === 'IN') {
        await InventoryRepository.createEntry({
          productId,
          supplierId: supplierId || undefined,
          quantity: Number(quantity),
          unitCost: Number(unitCost || selectedProduct?.cost || 0),
          expiresAt: expiresAt || undefined,
          batchCode: batchCode.trim() || undefined,
          note: note.trim() || undefined,
        });
      } else {
        await InventoryRepository.createMovement({
          productId,
          movementType,
          quantity: Number(quantity),
          note: note.trim() || undefined,
        });
      }

      resetForm();
      await loadAll();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible registrar el movimiento',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
    setProductId,
    setMovementType,
    setQuantity,
    setUnitCost,
    setSupplierId,
    setBatchCode,
    setExpiresAt,
    setNote,
    submitForm,
    inventoryPagination,
    movementsPagination,
    batchesPagination,
    expiringPagination,
  };
};
