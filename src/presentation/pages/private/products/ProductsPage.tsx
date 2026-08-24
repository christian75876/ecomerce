import { useProductsManagement } from '@/application/useCases/products/useProductsManagement';
import { ProductsManagementView } from '@/presentation/ui/organisms/products/ProductsManagementView';

const ProductsPage = () => {
  const pm = useProductsManagement();

  return (
    <ProductsManagementView
      isSeller={pm.isSeller}
      products={pm.products}
      categories={pm.categories}
      stores={pm.stores}
      suppliers={pm.suppliers}
      menuCategories={pm.menuCategories}
      form={pm.form}
      editingId={pm.editingId}
      isDirty={pm.isDirty}
      search={pm.search}
      selectedCategoryId={pm.selectedCategoryId}
      loading={pm.loading}
      submitting={pm.submitting}
      error={pm.error}
      fieldErrors={pm.fieldErrors}
      imagePreview={pm.imagePreview}
      gallery={pm.gallery}
      gallerySubmitting={pm.gallerySubmitting}
      galleryError={pm.galleryError}
      variants={pm.variants}
      variantSizes={pm.variantSizes}
      variantColors={pm.variantColors}
      variantCombinations={pm.variantCombinations}
      variantSubmitting={pm.variantSubmitting}
      variantError={pm.variantError}
      onAddVariantSize={pm.addVariantSize}
      onRemoveVariantSize={pm.removeVariantSize}
      onAddVariantColor={pm.addVariantColor}
      onRemoveVariantColor={pm.removeVariantColor}
      onUpdateCombination={pm.updateCombination}
      onSaveVariants={pm.saveVariants}
      videos={pm.videos}
      pendingVideos={pm.pendingVideos}
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
      pendingGalleryPreviews={pm.pendingGalleryPreviews}
      onPendingGalleryAdd={pm.addPendingGalleryFiles}
      onPendingGalleryRemove={pm.removePendingGalleryFile}
      onVideoUrlChange={pm.setVideoUrl}
      onVideoTitleChange={pm.setVideoTitle}
      onAddVideo={pm.addVideo}
      onRemovePendingVideo={pm.removePendingVideo}
      onRemoveVideo={pm.removeVideo}
      onSubmit={pm.submitForm}
      onEdit={pm.startEditing}
      onToggleStatus={pm.toggleStatus}
      restockingProduct={pm.restockingProduct}
      restockSubmitting={pm.restockSubmitting}
      restockError={pm.restockError}
      onOpenRestock={pm.openRestock}
      onCloseRestock={pm.closeRestock}
      onRestock={pm.restockProduct}
      onReset={pm.resetForm}
      onQuickCreateCategory={pm.quickCreateCategory}
      onQuickCreateSupplier={pm.quickCreateSupplier}
      currentPage={pm.currentPage}
      totalPages={pm.totalPages}
      totalItems={pm.totalItems}
      itemsPerPage={pm.itemsPerPage}
      onChangePage={pm.changePage}
    />
  );
};

export default ProductsPage;
