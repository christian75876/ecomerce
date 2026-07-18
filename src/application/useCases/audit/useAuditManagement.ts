import { useCallback, useEffect, useState } from 'react';
import { IAuditLog } from '@/application/dtos/audit/response/AuditResponse';
import { AuditRepository } from '@/infrastructure/repositories/api/audit/AuditRepository';

const ITEMS_PER_PAGE = 20;

export const useAuditManagement = () => {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await AuditRepository.getAuditLogs({
          action: action || undefined,
          entity: entity || undefined,
          userId: userId || undefined,
          page,
          limit: ITEMS_PER_PAGE,
        });
        const { items, pagination } = response.data;
        setLogs(items);
        setCurrentPage(pagination.currentPage);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.totalItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No fue posible cargar auditoría');
      } finally {
        setLoading(false);
      }
    },
    [action, entity, userId],
  );

  useEffect(() => {
    void loadLogs(1);
  }, [loadLogs]);

  const changePage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    await loadLogs(page);
  };

  return {
    logs,
    action,
    entity,
    userId,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: ITEMS_PER_PAGE,
    setAction,
    setEntity,
    setUserId,
    reload: () => loadLogs(1),
    changePage,
  };
};
