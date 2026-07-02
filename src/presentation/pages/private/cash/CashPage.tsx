import { useCashManagement } from '@/application/useCases/cash/useCashManagement';
import { CashManagementView } from '@/presentation/ui/organisms/cash/CashManagementView';

const CashPage = () => {
  const cashManagement = useCashManagement();

  return (
    <CashManagementView
      sessions={cashManagement.sessions}
      stores={cashManagement.stores}
      selectedSessionId={cashManagement.selectedSessionId}
      movements={cashManagement.movements}
      storeId={cashManagement.storeId}
      openingAmount={cashManagement.openingAmount}
      closingAmount={cashManagement.closingAmount}
      movementType={cashManagement.movementType}
      movementAmount={cashManagement.movementAmount}
      movementReason={cashManagement.movementReason}
      loading={cashManagement.loading}
      submitting={cashManagement.submitting}
      error={cashManagement.error}
      onSelectSession={cashManagement.setSelectedSessionId}
      onStoreChange={cashManagement.setStoreId}
      onOpeningAmountChange={cashManagement.setOpeningAmount}
      onClosingAmountChange={cashManagement.setClosingAmount}
      onMovementTypeChange={cashManagement.setMovementType}
      onMovementAmountChange={cashManagement.setMovementAmount}
      onMovementReasonChange={cashManagement.setMovementReason}
      onOpenSession={cashManagement.openSession}
      onCloseSession={cashManagement.closeSession}
      onCreateMovement={cashManagement.createMovement}
    />
  );
};

export default CashPage;
