import { useAuditManagement } from '@/application/useCases/audit/useAuditManagement';
import { AuditManagementView } from '@/presentation/ui/organisms/audit/AuditManagementView';

const AuditPage = () => {
  const auditManagement = useAuditManagement();

  return (
    <AuditManagementView
      logs={auditManagement.logs}
      action={auditManagement.action}
      entity={auditManagement.entity}
      userId={auditManagement.userId}
      loading={auditManagement.loading}
      error={auditManagement.error}
      onActionChange={auditManagement.setAction}
      onEntityChange={auditManagement.setEntity}
      onUserIdChange={auditManagement.setUserId}
    />
  );
};

export default AuditPage;
