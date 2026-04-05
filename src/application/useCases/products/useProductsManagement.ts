import { useCallback, useEffect, useState } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import {
  ICreateProductRequest,
} from '@/application/dtos/products/request/ProductRequest';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';

export type ProductFormState = {
  name: string;
  description: string;
  sku: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  showStock: boolean;
};

export const initialProductFormState: ProductFormState = {
  name: '',
  description: '',
  sku: '',
  price: '',
  categoryId: '',
  imageUrl: '',
  showStock: false,
};

export const useProductsManagement = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
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
    void Promise.all([loadCategories(), loadProducts()]).catch((err: unknown) => {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar el módulo',
      );
      setLoading(false);
    });
  }, [loadCategories, loadProducts]);

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
      !currentForm.categoryId
    ) {
      setError('Completa nombre, descripción, SKU, precio y categoría');
      return null;
    }

    if (Number(currentForm.price) < 0) {
      setError('El precio no puede ser negativo');
      return null;
    }

    return {
      name: currentForm.name.trim(),
      description: currentForm.description.trim(),
      sku: currentForm.sku.trim(),
      price: Number(currentForm.price),
      categoryId: currentForm.categoryId,
      imageUrl: currentForm.imageUrl.trim() || undefined,
      showStock: currentForm.showStock,
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
      categoryId: product.categoryId,
      imageUrl: product.imageUrl ?? '',
      showStock: product.showStock,
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
