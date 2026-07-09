import { useCategoriesManagement } from '@/application/useCases/categories/useCategoriesManagement';
import { CategoriesManagementView } from '@/presentation/ui/organisms/categories/CategoriesManagementView';

const CategoriesPage = () => {
  const cm = useCategoriesManagement();

  return (
    <CategoriesManagementView
      categories={cm.categories}
      name={cm.name}
      editingId={cm.editingId}
      loading={cm.loading}
      submitting={cm.submitting}
      error={cm.error}
      viewingCategory={cm.viewingCategory}
      categoryProducts={cm.categoryProducts}
      productsLoading={cm.productsLoading}
      onNameChange={cm.setName}
      onSubmit={cm.submitForm}
      onEdit={cm.startEditing}
      onToggleStatus={cm.toggleStatus}
      onReset={cm.resetForm}
      onReload={cm.reload}
      onViewProducts={cm.openProductsPanel}
      onCloseProducts={cm.closeProductsPanel}
      onToggleProduct={cm.toggleCategoryProduct}
    />
  );
};

export default CategoriesPage;
