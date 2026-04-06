import { useCallback, useEffect, useState } from 'react';
import { IAuditLog } from '@/application/dtos/audit/response/AuditResponse';
import { AuditRepository } from '@/infrastructure/repositories/api/audit/AuditRepository';

export const useAuditManagement = () => {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuditRepository.getAuditLogs({
        action: action || undefined,
        entity: entity || undefined,
        userId: userId || undefined,
      });
      setLogs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar auditoría');
    } finally {
      setLoading(false);
    }
  }, [action, entity, userId]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return {
    logs,
    action,
    entity,
    userId,
    loading,
    error,
    setAction,
    setEntity,
    setUserId,
    reload: loadLogs,
  };
};
