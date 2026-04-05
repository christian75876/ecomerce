import { useEffect, useState } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';

export const useCategoriesManagement = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    categories,
    name,
    editingId,
    loading,
    submitting,
    error,
    setName,
    submitForm,
    startEditing,
    toggleStatus,
    resetForm,
    reload: loadCategories,
  };
};
