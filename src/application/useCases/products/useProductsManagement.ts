import { useCallback, useEffect, useState } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import {
  ICreateProductRequest,
} from '@/application/dtos/products/request/ProductRequest';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';

export type ProductFormState = {
  name: string;
  description: string;
  sku: string;
  price: string;
  cost: string;
  categoryId: string;
  storeId: string;
  supplierId: string;
  initialStock: string;
  imageUrl: string;
  showStock: boolean;
  isPerishable: boolean;
  trackBatches: boolean;
  initialExpiresAt: string;
};

export const initialProductFormState: ProductFormState = {
  name: '',
  description: '',
  sku: '',
  price: '',
  cost: '',
  categoryId: '',
  storeId: '',
  supplierId: '',
  initialStock: '',
  imageUrl: '',
  showStock: false,
  isPerishable: false,
  trackBatches: true,
  initialExpiresAt: '',
};

export const useProductsManagement = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [form, setForm] = useState<ProductFormState>(initialProductFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const response = await CategoriesRepository.getCategories(true);
    setCategories(response.data);
  }, []);

  const loadStores = useCallback(async () => {
    const response = await StoresRepository.getStores({ active: true });
    setStores(response.data);
  }, []);

  const loadSuppliers = useCallback(async () => {
    const response = await SuppliersRepository.getSuppliers();
    setSuppliers(response.data.filter((supplier) => supplier.isActive));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductRepository.getProducts({
        search: search || undefined,
        categoryId: selectedCategoryId || undefined,
      });
      setProducts(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar los productos',
      );
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategoryId]);

  useEffect(() => {
    void Promise.all([loadCategories(), loadStores(), loadSuppliers()]).catch((err: unknown) => {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar el módulo',
      );
      setLoading(false);
    });
  }, [loadCategories, loadStores, loadSuppliers]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const updateForm = <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialProductFormState);
    setEditingId(null);
  };

  const buildPayload = (currentForm: ProductFormState): ICreateProductRequest | null => {
    if (
      !currentForm.name.trim() ||
      !currentForm.description.trim() ||
      !currentForm.sku.trim() ||
      !currentForm.price ||
      !currentForm.categoryId ||
      !currentForm.storeId
    ) {
      setError('Completa nombre, descripción, SKU, precio, categoría y tienda');
      return null;
    }

    if (Number(currentForm.price) < 0) {
      setError('El precio no puede ser negativo');
      return null;
    }

    if (currentForm.cost && Number(currentForm.cost) < 0) {
      setError('El costo no puede ser negativo');
      return null;
    }

    if (currentForm.initialStock && Number(currentForm.initialStock) < 0) {
      setError('El stock inicial no puede ser negativo');
      return null;
    }

    if (
      currentForm.isPerishable &&
      currentForm.initialStock &&
      Number(currentForm.initialStock) > 0 &&
      !currentForm.initialExpiresAt
    ) {
      setError('Los productos perecederos requieren vencimiento para el stock inicial');
      return null;
    }

    return {
      name: currentForm.name.trim(),
      description: currentForm.description.trim(),
      sku: currentForm.sku.trim(),
      price: Number(currentForm.price),
      categoryId: currentForm.categoryId,
      storeId: currentForm.storeId,
      supplierId: currentForm.supplierId || undefined,
      cost: currentForm.cost ? Number(currentForm.cost) : undefined,
      initialStock: currentForm.initialStock
        ? Number(currentForm.initialStock)
        : undefined,
      imageUrl: currentForm.imageUrl.trim() || undefined,
      showStock: currentForm.showStock,
      isPerishable: currentForm.isPerishable,
      trackBatches: currentForm.trackBatches,
      initialExpiresAt: currentForm.initialExpiresAt || undefined,
      isActive: true,
    };
  };

  const submitForm = async () => {
    const payload = buildPayload(form);
    if (!payload) {
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        await ProductRepository.updateProduct(editingId, payload);
      } else {
        await ProductRepository.createProduct(payload);
      }

      resetForm();
      await loadProducts();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible guardar el producto',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (product: IProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: String(product.price),
      cost: product.cost ? String(product.cost) : '',
      categoryId: product.categoryId,
      storeId: product.storeId ?? '',
      supplierId: product.supplierId ?? '',
      initialStock: '',
      imageUrl: product.imageUrl ?? '',
      showStock: product.showStock,
      isPerishable: product.isPerishable,
      trackBatches: product.trackBatches,
      initialExpiresAt: '',
    });
    setError(null);
  };

  const toggleStatus = async (product: IProduct) => {
    setSubmitting(true);
    setError(null);

    try {
      await ProductRepository.updateStatus(product.id, !product.isActive);
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar el estado del producto',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    products,
    categories,
    stores,
    suppliers,
    form,
    editingId,
    search,
    selectedCategoryId,
    loading,
    submitting,
    error,
    setSearch,
    setSelectedCategoryId,
    updateForm,
    submitForm,
    startEditing,
    toggleStatus,
    resetForm,
  };
};
