import { useCategoriesManagement } from '@/application/useCases/categories/useCategoriesManagement';
import { CategoriesManagementView } from '@/presentation/ui/organisms/categories/CategoriesManagementView';

const CategoriesPage = () => {
  const categoriesManagement = useCategoriesManagement();

  return (
    <CategoriesManagementView
      categories={categoriesManagement.categories}
      name={categoriesManagement.name}
      editingId={categoriesManagement.editingId}
      loading={categoriesManagement.loading}
      submitting={categoriesManagement.submitting}
      error={categoriesManagement.error}
      onNameChange={categoriesManagement.setName}
      onSubmit={categoriesManagement.submitForm}
      onEdit={categoriesManagement.startEditing}
      onToggleStatus={categoriesManagement.toggleStatus}
      onReset={categoriesManagement.resetForm}
      onReload={categoriesManagement.reload}
    />
  );
};

export default CategoriesPage;
