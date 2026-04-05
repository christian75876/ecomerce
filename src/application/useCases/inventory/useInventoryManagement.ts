import { useEffect, useState } from 'react';
import { IInventoryItem, IInventoryMovement } from '@/application/dtos/inventory/response/InventoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { InventoryRepository } from '@/infrastructure/repositories/api/inventory/InventoryRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';

export const useInventoryManagement = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [inventory, setInventory] = useState<IInventoryItem[]>([]);
  const [movements, setMovements] = useState<IInventoryMovement[]>([]);
  const [productId, setProductId] = useState('');
  const [movementType, setMovementType] = useState<'IN' | 'ADJUSTMENT'>('IN');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScreen = async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsResponse, inventoryResponse, movementsResponse] =
        await Promise.all([
          ProductRepository.getProducts(),
          InventoryRepository.getInventory(),
          InventoryRepository.getMovements(),
        ]);

      setProducts(productsResponse.data);
      setInventory(inventoryResponse.data);
      setMovements(movementsResponse.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible cargar el módulo de inventario',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadScreen();
  }, []);

  const resetForm = () => {
    setProductId('');
    setMovementType('IN');
    setQuantity('');
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
      await InventoryRepository.createMovement({
        productId,
        movementType,
        quantity: Number(quantity),
        note: note.trim() || undefined,
      });

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

  return {
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
    setProductId,
    setMovementType,
    setQuantity,
    setNote,
    submitForm,
  };
};
