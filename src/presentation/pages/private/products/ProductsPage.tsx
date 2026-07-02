import { useProductsManagement } from '@/application/useCases/products/useProductsManagement';
import { ProductsManagementView } from '@/presentation/ui/organisms/products/ProductsManagementView';

const ProductsPage = () => {
  const pm = useProductsManagement();

  return (
    <ProductsManagementView
      products={pm.products}
      categories={pm.categories}
      stores={pm.stores}
      suppliers={pm.suppliers}
      menuCategories={pm.menuCategories}
      form={pm.form}
      editingId={pm.editingId}
      search={pm.search}
      selectedCategoryId={pm.selectedCategoryId}
      loading={pm.loading}
      submitting={pm.submitting}
      error={pm.error}
      imagePreview={pm.imagePreview}
      gallery={pm.gallery}
      gallerySubmitting={pm.gallerySubmitting}
      galleryError={pm.galleryError}
      videos={pm.videos}
      videoUrl={pm.videoUrl}
      videoTitle={pm.videoTitle}
      videoSubmitting={pm.videoSubmitting}
      videoError={pm.videoError}
      onSearchChange={pm.setSearch}
      onCategoryFilterChange={pm.setSelectedCategoryId}
      onFormChange={pm.updateForm}
      onImageFileChange={pm.setImageFile}
      onGalleryImageUpload={pm.uploadGalleryImages}
      onGalleryImageRemove={pm.removeGalleryImage}
      onGalleryImageReorder={pm.reorderGallery}
      onVideoUrlChange={pm.setVideoUrl}
      onVideoTitleChange={pm.setVideoTitle}
      onAddVideo={pm.addVideo}
      onRemoveVideo={pm.removeVideo}
      onSubmit={pm.submitForm}
      onEdit={pm.startEditing}
      onToggleStatus={pm.toggleStatus}
      onReset={pm.resetForm}
    />
  );
};

export default ProductsPage;
