import { useStoresManagement } from '@/application/useCases/stores/useStoresManagement';
import { StoresManagementView } from '@/presentation/ui/organisms/stores/StoresManagementView';

const StoresPage = () => {
  const storesManagement = useStoresManagement();

  return (
    <StoresManagementView
      stores={storesManagement.stores}
      form={storesManagement.form}
      editingId={storesManagement.editingId}
      loading={storesManagement.loading}
      submitting={storesManagement.submitting}
      error={storesManagement.error}
      onFormChange={storesManagement.updateForm}
      onSubmit={storesManagement.submitForm}
      onEdit={storesManagement.startEditing}
      onReset={storesManagement.resetForm}
    />
  );
};

export default StoresPage;
