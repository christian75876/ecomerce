import { useEffect, useState } from 'react';
import {
  IDashboardAnalytics,
  IDashboardAnalyticsQuery,
} from '@/application/dtos/dashboard/response/DashboardResponse';
import { DashboardRepository } from '@/infrastructure/repositories/api/dashboard/DashboardRepository';

export const useDashboardSummary = () => {
  const buildDefaultRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);

    return {
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
    };
  };

  const [summary, setSummary] = useState<IDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IDashboardAnalyticsQuery>({
    ...buildDefaultRange(),
    criticalStockThreshold: 5,
    rotationDays: 30,
  });

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await DashboardRepository.getAnalytics(filters);
        setSummary(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No fue posible cargar el dashboard',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadSummary();
  }, [filters]);

  const updateFilter = <K extends keyof IDashboardAnalyticsQuery>(
    key: K,
    value: IDashboardAnalyticsQuery[K],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      ...buildDefaultRange(),
      criticalStockThreshold: 5,
      rotationDays: 30,
      storeId: undefined,
    });
  };

  return {
    summary,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
  };
};
