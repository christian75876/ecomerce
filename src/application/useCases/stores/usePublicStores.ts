import { useEffect, useState } from 'react';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';

export const usePublicStores = () => {
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await StoresRepository.getStores({ active: true });
        setStores(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'No fue posible cargar tiendas',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadStores();
  }, []);

  return { stores, loading, error };
};
