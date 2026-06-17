import { useInventoryManagement } from '@/application/useCases/inventory/useInventoryManagement';
import { InventoryManagementView } from '@/presentation/ui/organisms/inventory/InventoryManagementView';
import { useAdminStoreFilterContext } from '@/shared/context/AdminStoreFilterContext';

const InventoryPage = () => {
  const { selectedStoreId } = useAdminStoreFilterContext();
  const inventoryManagement = useInventoryManagement(selectedStoreId);

  return (
    <InventoryManagementView
      products={inventoryManagement.products}
      suppliers={inventoryManagement.suppliers}
      inventory={inventoryManagement.inventory}
      movements={inventoryManagement.movements}
      batches={inventoryManagement.batches}
      expiringBatches={inventoryManagement.expiringBatches}
      selectedProduct={inventoryManagement.selectedProduct}
      productId={inventoryManagement.productId}
      movementType={inventoryManagement.movementType}
      quantity={inventoryManagement.quantity}
      unitCost={inventoryManagement.unitCost}
      supplierId={inventoryManagement.supplierId}
      batchCode={inventoryManagement.batchCode}
      expiresAt={inventoryManagement.expiresAt}
      note={inventoryManagement.note}
      loading={inventoryManagement.loading}
      submitting={inventoryManagement.submitting}
      error={inventoryManagement.error}
      onProductChange={inventoryManagement.setProductId}
      onMovementTypeChange={inventoryManagement.setMovementType}
      onQuantityChange={inventoryManagement.setQuantity}
      onUnitCostChange={inventoryManagement.setUnitCost}
      onSupplierChange={inventoryManagement.setSupplierId}
      onBatchCodeChange={inventoryManagement.setBatchCode}
      onExpiresAtChange={inventoryManagement.setExpiresAt}
      onNoteChange={inventoryManagement.setNote}
      onSubmit={inventoryManagement.submitForm}
    />
  );
};

export default InventoryPage;
