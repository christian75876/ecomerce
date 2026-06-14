import { useEffect, useState } from 'react';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import { MenuCategoriesRepository } from '@/infrastructure/repositories/api/menu-categories/MenuCategoriesRepository';

export const useMenuCategories = (storeId: string | null) => {
  const [categories, setCategories] = useState<IMenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await MenuCategoriesRepository.getByStore(storeId);
      setCategories(resp.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [storeId]);

  const create = async (name: string, sortOrder = 0) => {
    if (!storeId) return;
    setSubmitting(true);
    setError(null);
    try {
      await MenuCategoriesRepository.create({ storeId, name: name.trim(), sortOrder });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const update = async (id: string, name: string, sortOrder?: number) => {
    setSubmitting(true);
    setError(null);
    try {
      await MenuCategoriesRepository.update(id, { name: name.trim(), sortOrder });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await MenuCategoriesRepository.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar categoría');
    } finally {
      setSubmitting(false);
    }
  };

  return { categories, loading, submitting, error, create, update, remove, reload: load };
};
