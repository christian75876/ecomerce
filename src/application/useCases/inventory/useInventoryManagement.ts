import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useAdminStore } from '@/shared/contexts/AdminStoreContext';

export const useInventoryManagement = () => {
  const { selectedStoreId: contextStoreId } = useAdminStore();
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

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products],
  );

  const loadScreen = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        productsResponse,
        suppliersResponse,
        inventoryResponse,
        movementsResponse,
        batchesResponse,
        expiringResponse,
      ] =
        await Promise.all([
          ProductRepository.getProducts(),
          SuppliersRepository.getSuppliers(),
          InventoryRepository.getInventory(contextStoreId),
          InventoryRepository.getMovements(),
          InventoryRepository.getBatches({ storeId: contextStoreId }),
          InventoryRepository.getExpiring(30, contextStoreId),
        ]);

      setProducts((productsResponse.data as unknown as { items?: IProduct[] }).items ?? []);
      setSuppliers(
        ((suppliersResponse.data as unknown as { items?: ISupplier[] }).items ?? []).filter(
          (s) => s.isActive,
        ),
      );
      setInventory((inventoryResponse.data as unknown as { items?: IInventoryItem[] }).items ?? []);
      setMovements((movementsResponse.data as unknown as { items?: IInventoryMovement[] }).items ?? []);
      setBatches((batchesResponse.data as unknown as { items?: IInventoryBatch[] }).items ?? []);
      setExpiringBatches((expiringResponse.data as unknown as { items?: IInventoryBatch[] }).items ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible cargar el módulo de inventario',
      );
    } finally {
      setLoading(false);
    }
  }, [contextStoreId]);

  useEffect(() => {
    void loadScreen();
  }, [loadScreen]);

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
      await loadScreen();
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible registrar el movimiento',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const quickCreateProduct = async (payload: {
    name: string;
    description: string;
    sku?: string;
    price: number;
    categoryId: string;
    storeId?: string;
  }): Promise<IProduct | null> => {
    try {
      const response = await ProductRepository.createProduct({
        name: payload.name.trim(),
        description: payload.description.trim() || payload.name.trim(),
        sku: payload.sku?.trim() ?? '',
        price: payload.price,
        categoryId: payload.categoryId,
        storeId: payload.storeId || undefined,
        isActive: true,
      });
      const updated = await ProductRepository.getProducts();
      setProducts((updated.data as unknown as { items?: IProduct[] }).items ?? []);
      return response.data;
    } catch {
      return null;
    }
  };

  const quickCreateSupplier = async (name: string): Promise<ISupplier | null> => {
    try {
      const response = await SuppliersRepository.createSupplier({ name });
      // Reload suppliers so the new one appears in the dropdown
      const updated = await SuppliersRepository.getSuppliers();
      setSuppliers(
        ((updated.data as unknown as { items?: ISupplier[] }).items ?? []).filter(
          (s) => s.isActive,
        ),
      );
      return response.data;
    } catch {
      return null;
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
    quickCreateProduct,
    quickCreateSupplier,
  };
};
