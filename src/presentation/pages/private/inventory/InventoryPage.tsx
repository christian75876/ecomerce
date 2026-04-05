import { useInventoryManagement } from '@/application/useCases/inventory/useInventoryManagement';
import { InventoryManagementView } from '@/presentation/ui/organisms/inventory/InventoryManagementView';

const InventoryPage = () => {
  const inventoryManagement = useInventoryManagement();

  return (
    <InventoryManagementView
      products={inventoryManagement.products}
      inventory={inventoryManagement.inventory}
      movements={inventoryManagement.movements}
      productId={inventoryManagement.productId}
      movementType={inventoryManagement.movementType}
      quantity={inventoryManagement.quantity}
      note={inventoryManagement.note}
      loading={inventoryManagement.loading}
      submitting={inventoryManagement.submitting}
      error={inventoryManagement.error}
      onProductChange={inventoryManagement.setProductId}
      onMovementTypeChange={inventoryManagement.setMovementType}
      onQuantityChange={inventoryManagement.setQuantity}
      onNoteChange={inventoryManagement.setNote}
      onSubmit={inventoryManagement.submitForm}
    />
  );
};

export default InventoryPage;
