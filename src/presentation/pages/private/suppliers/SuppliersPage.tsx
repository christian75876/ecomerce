import { useSuppliersManagement } from '@/application/useCases/suppliers/useSuppliersManagement';
import { SuppliersManagementView } from '@/presentation/ui/organisms/suppliers/SuppliersManagementView';

const SuppliersPage = () => {
  const suppliersManagement = useSuppliersManagement();

  return (
    <SuppliersManagementView
      suppliers={suppliersManagement.suppliers}
      form={suppliersManagement.form}
      editingId={suppliersManagement.editingId}
      search={suppliersManagement.search}
      loading={suppliersManagement.loading}
      submitting={suppliersManagement.submitting}
      error={suppliersManagement.error}
      onSearchChange={suppliersManagement.setSearch}
      onFormChange={suppliersManagement.updateForm}
      onSubmit={suppliersManagement.submitForm}
      onEdit={suppliersManagement.startEditing}
      onToggleStatus={suppliersManagement.toggleStatus}
      onReset={suppliersManagement.resetForm}
    />
  );
};

export default SuppliersPage;
