import { useSuppliersManagement } from '@/application/useCases/suppliers/useSuppliersManagement';
import { SuppliersManagementView } from '@/presentation/ui/organisms/suppliers/SuppliersManagementView';

const SuppliersPage = () => {
  const s = useSuppliersManagement();

  return (
    <SuppliersManagementView
      suppliers={s.suppliers}
      suppliersPage={s.suppliersPage}
      suppliersTotalPages={s.suppliersTotalPages}
      onSuppliersPageChange={s.goToSuppliersPage}
      form={s.form}
      editingId={s.editingId}
      search={s.search}
      loading={s.loading}
      submitting={s.submitting}
      error={s.error}
      onSearchChange={s.setSearch}
      onFormChange={s.updateForm}
      onSubmit={s.submitForm}
      onEdit={s.startEditing}
      onToggleStatus={s.toggleStatus}
      onReset={s.resetForm}
    />
  );
};

export default SuppliersPage;
