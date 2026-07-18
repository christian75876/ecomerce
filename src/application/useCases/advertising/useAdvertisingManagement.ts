import { useEffect, useState, useMemo } from 'react';
import {
  AdvertisingRepository,
  IRegisterAdvertisementDto,
} from '@/infrastructure/repositories/api/advertising/AdvertisingRepository';
import type {
  IAdvertisingDashboard,
  IStoreWithAdStatus,
} from '@/application/dtos/advertising/AdvertisingResponse';

export type AdStatusFilter = 'all' | 'ACTIVE' | 'EXPIRED' | 'NEVER';

export const useAdvertisingManagement = () => {
  const [dashboard, setDashboard] = useState<IAdvertisingDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdStatusFilter>('all');

  const loadDashboard = async () => {
    setError(null);
    try {
      const res = await AdvertisingRepository.getDashboard();
      setDashboard((res as unknown as { data: IAdvertisingDashboard }).data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
    }
  };

  const load = async () => {
    setLoading(true);
    await loadDashboard();
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerAdvertisement = async (dto: IRegisterAdvertisementDto) => {
    setSubmitting(true);
    setError(null);
    try {
      await AdvertisingRepository.registerAdvertisement(dto);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el pago de publicidad');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAdvertisement = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await AdvertisingRepository.cancelAdvertisement(id);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar la publicidad');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStores = useMemo<IStoreWithAdStatus[]>(() => {
    if (!dashboard?.storesWithStatus) return [];
    return dashboard.storesWithStatus.filter((entry) => {
      const matchesSearch = search.trim()
        ? entry.store.name.toLowerCase().includes(search.trim().toLowerCase())
        : true;
      const matchesStatus = statusFilter === 'all' ? true : entry.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dashboard, search, statusFilter]);

  return {
    dashboard,
    loading,
    submitting,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredStores,
    loadDashboard,
    registerAdvertisement,
    cancelAdvertisement,
  };
};
