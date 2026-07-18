import { useEffect, useState } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';

export const useCategoriesManagement = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Products panel
  const [viewingCategory, setViewingCategory] = useState<ICategory | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<IProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await CategoriesRepository.getCategories();
      setCategories(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible cargar las categorías',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setEditingId(null);
  };

  const submitForm = async () => {
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        await CategoriesRepository.updateCategory(editingId, {
          name: name.trim(),
        });
      } else {
        await CategoriesRepository.createCategory({
          name: name.trim(),
          isActive: true,
        });
      }

      resetForm();
      await loadCategories();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible guardar la categoría',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (category: ICategory) => {
    setEditingId(category.id);
    setName(category.name);
    setError(null);
  };

  const toggleStatus = async (category: ICategory) => {
    setSubmitting(true);
    setError(null);

    try {
      await CategoriesRepository.updateCategory(category.id, {
        isActive: !category.isActive,
      });
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar el estado de la categoría',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const loadCategoryProducts = async (categoryId: string) => {
    setProductsLoading(true);
    try {
      const response = await ProductRepository.getProducts({ categoryId, limit: 500 });
      const data = response.data as unknown as { items?: IProduct[] };
      setCategoryProducts(data.items ?? []);
    } catch {
      setCategoryProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const openProductsPanel = async (category: ICategory) => {
    setViewingCategory(category);
    await loadCategoryProducts(category.id);
  };

  const closeProductsPanel = () => {
    setViewingCategory(null);
    setCategoryProducts([]);
  };

  const toggleCategoryProduct = async (product: IProduct) => {
    setProductsLoading(true);
    try {
      await ProductRepository.updateStatus(product.id, !product.isActive);
      if (viewingCategory) {
        await loadCategoryProducts(viewingCategory.id);
      }
    } catch {
      // ignore — product list will still reflect last known state
    } finally {
      setProductsLoading(false);
    }
  };

  const filteredCategories = search.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : categories;

  return {
    categories: filteredCategories,
    search,
    name,
    editingId,
    loading,
    submitting,
    error,
    viewingCategory,
    categoryProducts,
    productsLoading,
    setSearch,
    setName,
    submitForm,
    startEditing,
    toggleStatus,
    resetForm,
    reload: loadCategories,
    openProductsPanel,
    closeProductsPanel,
    toggleCategoryProduct,
  };
};
