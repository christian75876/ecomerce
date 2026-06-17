import { useCallback, useEffect, useState } from 'react';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import type { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { getAuthenticatedRole, isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';

const STORAGE_KEY = 'admin_store_filter';

export function useAdminStoreFilter() {
  const role = getAuthenticatedRole();
  const isSeller = role === 'seller';
  const authenticated = isAuthenticated();
  const [stores, setStores] = useState<IStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? null;
  });

  useEffect(() => {
    if (!authenticated) return;

    const loadStores = async () => {
      try {
        const res = isSeller
          ? await StoresRepository.getMyStores()
          : await StoresRepository.getStores();
        const nextStores = res.data ?? [];
        setStores(nextStores);
        setSelectedStoreId((current) => {
          if (current && nextStores.some((store) => store.id === current)) {
            return current;
          }

          if (isSeller && nextStores.length > 0) {
            localStorage.setItem(STORAGE_KEY, nextStores[0].id);
            return nextStores[0].id;
          }

          localStorage.removeItem(STORAGE_KEY);
          return null;
        });
      } catch {
        setStores([]);
      }
    };

    void loadStores();
  }, [isSeller, authenticated]);

  const selectStore = useCallback((id: string | null) => {
    setSelectedStoreId(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null;

  return { stores, selectedStoreId, selectedStore, selectStore };
}
