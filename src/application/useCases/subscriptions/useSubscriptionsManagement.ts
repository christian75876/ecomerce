import { useEffect, useState, useMemo } from 'react';
import {
  SubscriptionsRepository,
  IRegisterPaymentDto,
  ICreatePlanDto,
} from '@/infrastructure/repositories/api/subscriptions/SubscriptionsRepository';
import type {
  ISubscriptionAdminDashboard,
  ISubscriptionPlan,
  IStoreWithSubscriptionStatus,
} from '@/application/dtos/subscriptions/SubscriptionResponse';

export type StatusFilter = 'all' | 'ACTIVE' | 'EXPIRED' | 'NEVER';

export const useSubscriptionsManagement = () => {
  const [dashboard, setDashboard] = useState<ISubscriptionAdminDashboard | null>(null);
  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string; label: string } | null>(null);

  const loadDashboard = async (from?: string, to?: string) => {
    setError(null);
    try {
      const res = await SubscriptionsRepository.getDashboard(from, to);
      setDashboard(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
    }
  };

  const loadPlans = async () => {
    try {
      const res = await SubscriptionsRepository.getPlans();
      setPlans(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los planes');
    }
  };

  const load = async (from?: string, to?: string) => {
    setLoading(true);
    await Promise.all([loadDashboard(from, to), loadPlans()]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyDateRange = (range: { from: string; to: string; label: string } | null) => {
    setDateRange(range);
    void loadDashboard(range?.from, range?.to);
  };

  const registerPayment = async (dto: IRegisterPaymentDto) => {
    setSubmitting(true);
    setError(null);
    try {
      await SubscriptionsRepository.registerPayment(dto);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el pago');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const cancelSubscription = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await SubscriptionsRepository.cancelSubscription(id);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar la suscripción');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const createPlan = async (dto: ICreatePlanDto) => {
    setSubmitting(true);
    setError(null);
    try {
      await SubscriptionsRepository.createPlan(dto);
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el plan');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const updatePlan = async (id: string, dto: Partial<ISubscriptionPlan>) => {
    setSubmitting(true);
    setError(null);
    try {
      await SubscriptionsRepository.updatePlan(id, dto);
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el plan');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStores = useMemo<IStoreWithSubscriptionStatus[]>(() => {
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
    plans,
    loading,
    submitting,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateRange,
    applyDateRange,
    filteredStores,
    loadDashboard,
    loadPlans,
    registerPayment,
    cancelSubscription,
    createPlan,
    updatePlan,
  };
};
