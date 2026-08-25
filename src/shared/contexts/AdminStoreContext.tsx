import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';

interface IAdminStoreContext {
  selectedStoreId: string | undefined;
  selectedStore: IStore | undefined;
  stores: IStore[];
  setSelectedStoreId: (id: string | undefined) => void;
  loadStores: () => void;
}

const AdminStoreContext = createContext<IAdminStoreContext>({
  selectedStoreId: undefined,
  selectedStore: undefined,
  stores: [],
  setSelectedStoreId: () => {},
  loadStores: () => {},
});

export const useAdminStore = () => useContext(AdminStoreContext);

export const AdminStoreProvider = ({ children }: { children: ReactNode }) => {
  const [stores, setStores] = useState<IStore[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(undefined);

  const loadStores = useCallback(() => {
    if (loaded || getAuthenticatedRole() !== 'admin') return;
    setLoaded(true);
    const load = async () => {
      try {
        const res = await StoresRepository.getStores({ active: true });
        setStores(res.data);
      } catch {
        setLoaded(false);
      }
    };
    void load();
  }, [loaded]);

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  const value = useMemo(
    () => ({ selectedStoreId, selectedStore, stores, setSelectedStoreId, loadStores }),
    [selectedStoreId, selectedStore, stores, loadStores],
  );

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  );
};
