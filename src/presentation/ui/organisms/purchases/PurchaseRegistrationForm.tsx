import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { PurchaseItemForm } from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import FeaturePanel from '@/presentation/ui/templates/feature/FeaturePanel';
import PurchaseItemCard from './PurchaseItemCard';

interface PurchaseRegistrationFormProps {
  suppliers: ISupplier[];
  stores: IStore[];
  products: IProduct[];
  supplierId: string;
  storeId: string;
  purchaseDate: string;
  paidAmount: string;
  note: string;
  items: PurchaseItemForm[];
  submitting: boolean;
  error: string | null;
  onSupplierChange: (value: string) => void;
  onStoreChange: (value: string) => void;
  onPurchaseDateChange: (value: string) => void;
  onPaidAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onItemChange: (
    index: number,
    key: keyof PurchaseItemForm,
    value: string,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => Promise<boolean>;
  onOpenSupplierModal: () => void;
  onOpenProductModal: (index: number) => void;
}

const PurchaseRegistrationForm = ({
  suppliers,
  stores,
  products,
  supplierId,
  storeId,
  purchaseDate,
  paidAmount,
  note,
  items,
  submitting,
  error,
  onSupplierChange,
  onStoreChange,
  onPurchaseDateChange,
  onPaidAmountChange,
  onNoteChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  onOpenSupplierModal,
  onOpenProductModal,
}: PurchaseRegistrationFormProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <FeaturePanel
      title='Registrar compra'
      subtitle='Registra abastecimientos, crea proveedor o producto inline y aumenta el stock con trazabilidad.'
      className='h-fit'
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <Box>
          <Box className='mb-2 flex items-center justify-between gap-3'>
            <Label htmlFor='purchase-supplier'>Proveedor</Label>
            <Button
              type='button'
              variant='ghost'
              onClick={onOpenSupplierModal}
            >
              Crear proveedor
            </Button>
          </Box>
          <select
            id='purchase-supplier'
            value={supplierId}
            onChange={(event) => onSupplierChange(event.target.value)}
            className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
          >
            <option value=''>Selecciona proveedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </Box>

        <Box>
          <Label htmlFor='purchase-store'>Tienda</Label>
          <select
            id='purchase-store'
            value={storeId}
            onChange={(event) => onStoreChange(event.target.value)}
            className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
          >
            <option value=''>Selecciona tienda</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </Box>

        <Box className='grid gap-4 md:grid-cols-2'>
          <Box>
            <Label htmlFor='purchase-date'>Fecha</Label>
            <Input
              id='purchase-date'
              type='datetime-local'
              value={purchaseDate}
              onChange={(event) => onPurchaseDateChange(event.target.value)}
            />
          </Box>
          <Box>
            <Label htmlFor='purchase-paid'>Abono inicial</Label>
            <Input
              id='purchase-paid'
              type='number'
              min='0'
              step='0.01'
              value={paidAmount}
              onChange={(event) => onPaidAmountChange(event.target.value)}
            />
          </Box>
        </Box>

        <Box>
          <Label htmlFor='purchase-note'>Observación</Label>
          <Input
            id='purchase-note'
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
          />
        </Box>

        <Box className='space-y-3'>
          <Typography variant='h3' className='text-lg font-semibold'>
            Ítems
          </Typography>
          {items.map((item, index) => (
            <PurchaseItemCard
              key={`${item.productId}-${index}`}
              item={item}
              index={index}
              storeId={storeId}
              products={products}
              itemsCount={items.length}
              onItemChange={onItemChange}
              onRemoveItem={onRemoveItem}
              onOpenProductModal={onOpenProductModal}
            />
          ))}
          <Button type='button' variant='outlinePrimary' onClick={onAddItem}>
            Agregar ítem
          </Button>
        </Box>

        {error ? (
          <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
            {error}
          </Box>
        ) : null}

        <Button type='submit' variant='primary' disabled={submitting}>
          {submitting ? 'Guardando...' : 'Registrar compra'}
        </Button>
      </form>
    </FeaturePanel>
  );
};

export default PurchaseRegistrationForm;
