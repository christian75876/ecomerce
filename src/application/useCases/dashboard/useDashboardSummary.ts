import { useEffect, useState } from 'react';
import { IDashboardSummary } from '@/application/dtos/dashboard/response/DashboardResponse';
import { DashboardRepository } from '@/infrastructure/repositories/api/dashboard/DashboardRepository';

export const useDashboardSummary = () => {
  const [summary, setSummary] = useState<IDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await DashboardRepository.getSummary();
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
  }, []);

  return {
    summary,
    loading,
    error,
  };
};
