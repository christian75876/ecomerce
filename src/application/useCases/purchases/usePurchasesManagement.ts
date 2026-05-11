import { useEffect, useState } from 'react';
import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { PurchasesRepository } from '@/infrastructure/repositories/api/purchases/PurchasesRepository';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';

export type PurchaseItemForm = {
  productId: string;
  quantity: string;
  unitCost: string;
  expiresAt: string;
  batchCode: string;
};

export type InlineSupplierForm = {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export type InlineProductForm = {
  name: string;
  description: string;
  sku: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  showStock: boolean;
  isPerishable: boolean;
  trackBatches: boolean;
};

const emptyItem: PurchaseItemForm = {
  productId: '',
  quantity: '1',
  unitCost: '',
  expiresAt: '',
  batchCode: '',
};

const emptySupplierForm: InlineSupplierForm = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

const emptyProductForm: InlineProductForm = {
  name: '',
  description: '',
  sku: '',
  price: '',
  categoryId: '',
  imageUrl: '',
  showStock: true,
  isPerishable: false,
  trackBatches: true,
};

export const usePurchasesManagement = () => {
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<PurchaseItemForm[]>([emptyItem]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState<InlineSupplierForm>(emptySupplierForm);
  const [productForm, setProductForm] = useState<InlineProductForm>(emptyProductForm);
  const [supplierSubmitting, setSupplierSubmitting] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [productTargetIndex, setProductTargetIndex] = useState<number | null>(null);

  const loadScreen = async () => {
    setLoading(true);
    setError(null);
    try {
      const [purchasesResponse, suppliersResponse, storesResponse, productsResponse, categoriesResponse] =
        await Promise.all([
          PurchasesRepository.getPurchases(),
          SuppliersRepository.getSuppliers(),
          StoresRepository.getStores(),
          ProductRepository.getProducts(),
          CategoriesRepository.getCategories(true),
        ]);
      setPurchases(purchasesResponse.data);
      setSuppliers(suppliersResponse.data.filter((item) => item.isActive));
      setStores(storesResponse.data.filter((item) => item.isActive));
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
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

  const resetSupplierModal = () => {
    setSupplierForm(emptySupplierForm);
    setModalError(null);
    setIsSupplierModalOpen(false);
  };

  const resetProductModal = () => {
    setProductForm(emptyProductForm);
    setModalError(null);
    setIsProductModalOpen(false);
    setProductTargetIndex(null);
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
        expiresAt: item.expiresAt || undefined,
        batchCode: item.batchCode.trim() || undefined,
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

  const updateSupplierForm = (key: keyof InlineSupplierForm, value: string) => {
    setSupplierForm((current) => ({ ...current, [key]: value }));
  };

  const updateProductForm = <K extends keyof InlineProductForm>(
    key: K,
    value: InlineProductForm[K],
  ) => {
    setProductForm((current) => ({ ...current, [key]: value }));
  };

  const openSupplierModal = () => {
    setModalError(null);
    setIsSupplierModalOpen(true);
  };

  const openProductModal = (index: number) => {
    setModalError(null);
    setProductTargetIndex(index);
    setIsProductModalOpen(true);
  };

  const createSupplierInline = async () => {
    if (!supplierForm.name.trim()) {
      setModalError('El nombre del proveedor es obligatorio');
      return false;
    }

    setSupplierSubmitting(true);
    setModalError(null);

    try {
      const response = await SuppliersRepository.createSupplier({
        name: supplierForm.name.trim(),
        document: supplierForm.document.trim() || undefined,
        phone: supplierForm.phone.trim() || undefined,
        email: supplierForm.email.trim() || undefined,
        address: supplierForm.address.trim() || undefined,
        notes: supplierForm.notes.trim() || undefined,
      });

      setSuppliers((current) => [...current, response.data]);
      setSupplierId(response.data.id);
      resetSupplierModal();
      return true;
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'No fue posible crear el proveedor',
      );
      return false;
    } finally {
      setSupplierSubmitting(false);
    }
  };

  const createProductInline = async () => {
    if (!storeId) {
      setModalError('Selecciona primero la tienda de la compra');
      return false;
    }

    if (
      !productForm.name.trim() ||
      !productForm.description.trim() ||
      !productForm.sku.trim() ||
      !productForm.price ||
      !productForm.categoryId
    ) {
      setModalError('Completa nombre, descripción, SKU, precio y categoría');
      return false;
    }

    setProductSubmitting(true);
    setModalError(null);

    try {
      const response = await ProductRepository.createProduct({
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        sku: productForm.sku.trim(),
        price: Number(productForm.price),
        categoryId: productForm.categoryId,
        storeId,
        supplierId: supplierId || undefined,
        imageUrl: productForm.imageUrl.trim() || undefined,
        showStock: productForm.showStock,
        isPerishable: productForm.isPerishable,
        trackBatches: productForm.trackBatches,
        isActive: true,
      });

      setProducts((current) => [...current, response.data]);
      if (productTargetIndex !== null) {
        updateItem(productTargetIndex, 'productId', response.data.id);
      }
      resetProductModal();
      return true;
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'No fue posible crear el producto',
      );
      return false;
    } finally {
      setProductSubmitting(false);
    }
  };

  return {
    purchases,
    suppliers,
    stores,
    categories,
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
    isSupplierModalOpen,
    isProductModalOpen,
    supplierForm,
    productForm,
    supplierSubmitting,
    productSubmitting,
    modalError,
    setSupplierId,
    setStoreId,
    setPurchaseDate,
    setPaidAmount,
    setNote,
    updateItem,
    addItem,
    removeItem,
    submitForm,
    openSupplierModal,
    openProductModal,
    closeSupplierModal: resetSupplierModal,
    closeProductModal: resetProductModal,
    updateSupplierForm,
    updateProductForm,
    createSupplierInline,
    createProductInline,
    reload: loadScreen,
  };
};
