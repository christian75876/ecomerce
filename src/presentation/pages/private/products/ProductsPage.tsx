import { useProductsManagement } from '@/application/useCases/products/useProductsManagement';
import { ProductsManagementView } from '@/presentation/ui/organisms/products/ProductsManagementView';

const ProductsPage = () => {
  const productsManagement = useProductsManagement();

  return (
    <ProductsManagementView
      products={productsManagement.products}
      categories={productsManagement.categories}
      stores={productsManagement.stores}
      suppliers={productsManagement.suppliers}
      form={productsManagement.form}
      editingId={productsManagement.editingId}
      search={productsManagement.search}
      selectedCategoryId={productsManagement.selectedCategoryId}
      loading={productsManagement.loading}
      submitting={productsManagement.submitting}
      error={productsManagement.error}
      onSearchChange={productsManagement.setSearch}
      onCategoryFilterChange={productsManagement.setSelectedCategoryId}
      onFormChange={productsManagement.updateForm}
      onSubmit={productsManagement.submitForm}
      onEdit={productsManagement.startEditing}
      onToggleStatus={productsManagement.toggleStatus}
      onReset={productsManagement.resetForm}
    />
  );
};

export default ProductsPage;
