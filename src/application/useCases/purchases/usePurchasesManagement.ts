import { useEffect, useState } from 'react';
import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { PurchasesRepository } from '@/infrastructure/repositories/api/purchases/PurchasesRepository';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';

export type PurchaseItemForm = {
  productId: string;
  quantity: string;
  unitCost: string;
};

const emptyItem: PurchaseItemForm = {
  productId: '',
  quantity: '1',
  unitCost: '',
};

export const usePurchasesManagement = () => {
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<PurchaseItemForm[]>([emptyItem]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScreen = async () => {
    setLoading(true);
    setError(null);
    try {
      const [purchasesResponse, suppliersResponse, storesResponse, productsResponse] =
        await Promise.all([
          PurchasesRepository.getPurchases(),
          SuppliersRepository.getSuppliers(),
          StoresRepository.getStores(),
          ProductRepository.getProducts(),
        ]);
      setPurchases(purchasesResponse.data);
      setSuppliers(suppliersResponse.data.filter((item) => item.isActive));
      setStores(storesResponse.data.filter((item) => item.isActive));
      setProducts(productsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar compras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadScreen();
  }, []);

  const updateItem = (index: number, key: keyof PurchaseItemForm, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const addItem = () => setItems((current) => [...current, emptyItem]);
  const removeItem = (index: number) =>
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const resetForm = () => {
    setSupplierId('');
    setStoreId('');
    setPurchaseDate('');
    setPaidAmount('');
    setNote('');
    setItems([emptyItem]);
  };

  const availableProducts = products.filter(
    (product) => !storeId || product.storeId === storeId,
  );

  const submitForm = async () => {
    if (!supplierId || !storeId || !purchaseDate) {
      setError('Proveedor, tienda y fecha son obligatorios');
      return false;
    }

    const normalizedItems = items
      .filter((item) => item.productId && item.quantity && item.unitCost)
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
      }));

    if (normalizedItems.length === 0) {
      setError('Debes agregar al menos un ítem válido');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await PurchasesRepository.createPurchase({
        supplierId,
        storeId,
        purchaseDate,
        paidAmount: paidAmount ? Number(paidAmount) : undefined,
        note: note.trim() || undefined,
        items: normalizedItems,
      });
      resetForm();
      await loadScreen();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible registrar compra');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    purchases,
    suppliers,
    stores,
    products: availableProducts,
    supplierId,
    storeId,
    purchaseDate,
    paidAmount,
    note,
    items,
    loading,
    submitting,
    error,
    setSupplierId,
    setStoreId,
    setPurchaseDate,
    setPaidAmount,
    setNote,
    updateItem,
    addItem,
    removeItem,
    submitForm,
    reload: loadScreen,
  };
};
