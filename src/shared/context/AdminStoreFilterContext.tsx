import { createContext, useContext } from 'react';
import { useAdminStoreFilter } from '@/shared/hooks/useAdminStoreFilter';
import type { IStore } from '@/application/dtos/stores/response/StoreResponse';

interface AdminStoreFilterContextValue {
  stores: IStore[];
  selectedStoreId: string | null;
  selectedStore: IStore | null;
  selectStore: (id: string | null) => void;
}

const AdminStoreFilterContext = createContext<AdminStoreFilterContextValue>({
  stores: [],
  selectedStoreId: null,
  selectedStore: null,
  selectStore: () => undefined,
});

export function AdminStoreFilterProvider({ children }: { children: React.ReactNode }) {
  const value = useAdminStoreFilter();
  return (
    <AdminStoreFilterContext.Provider value={value}>
      {children}
    </AdminStoreFilterContext.Provider>
  );
}

export function useAdminStoreFilterContext() {
  return useContext(AdminStoreFilterContext);
}
