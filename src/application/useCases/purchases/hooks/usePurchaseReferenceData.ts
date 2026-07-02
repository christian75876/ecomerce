import { useState } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';

export const usePurchaseReferenceData = () => {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferenceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [suppliersResponse, storesResponse, categoriesResponse] =
        await Promise.all([
          SuppliersRepository.getSuppliers(),
          StoresRepository.getStores(),
          CategoriesRepository.getCategories(true),
        ]);

      setSuppliers(suppliersResponse.data.filter((item) => item.isActive));
      setStores(storesResponse.data.filter((item) => item.isActive));
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar compras',
      );
    } finally {
      setLoading(false);
    }
  };

  const appendSupplier = (supplier: ISupplier) => {
    setSuppliers((current) => [...current, supplier]);
  };

  return {
    suppliers,
    stores,
    categories,
    loading,
    error,
    loadReferenceData,
    appendSupplier,
  };
};
