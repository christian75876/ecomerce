import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IAsyncOption } from '@/application/dtos/common/AsyncOption';
import { PurchaseItemForm } from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import FeaturePanel from '@/presentation/ui/templates/feature/FeaturePanel';
import PurchaseItemCard from './PurchaseItemCard';
import AsyncSearchSelect from '@/presentation/ui/molecules/common/AsyncSearchSelect';

interface PurchaseRegistrationFormProps {
  stores: IStore[];
  supplierId: string;
  selectedSupplierOption: IAsyncOption | null;
  storeId: string;
  purchaseDate: string;
  paidAmount: string;
  note: string;
  items: PurchaseItemForm[];
  submitting: boolean;
  error: string | null;
  onSupplierSelect: (option: IAsyncOption | null) => void;
  onStoreChange: (value: string) => void;
  onPurchaseDateChange: (value: string) => void;
  onPaidAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onItemChange: <K extends keyof PurchaseItemForm>(
    index: number,
    key: K,
    value: PurchaseItemForm[K],
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => Promise<boolean>;
  onOpenSupplierModal: () => void;
  onOpenProductModal: (index: number) => void;
  loadSupplierOptions: (params: {
    search: string;
    page: number;
  }) => Promise<{
    items: IAsyncOption[];
    currentPage: number;
    totalPages: number;
  }>;
  loadProductOptions: (params: {
    search: string;
    page: number;
  }) => Promise<{
    items: IAsyncOption[];
    currentPage: number;
    totalPages: number;
  }>;
  onProductSelect: (index: number, option: IAsyncOption | null) => void;
}

const PurchaseRegistrationForm = ({
  stores,
  supplierId,
  selectedSupplierOption,
  storeId,
  purchaseDate,
  paidAmount,
  note,
  items,
  submitting,
  error,
  onSupplierSelect,
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
  loadSupplierOptions,
  loadProductOptions,
  onProductSelect,
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
          <AsyncSearchSelect
            value={supplierId}
            selectedLabel={selectedSupplierOption?.label}
            placeholder='Buscar proveedor'
            emptyLabel='No hay proveedores para esa búsqueda'
            loadOptions={loadSupplierOptions}
            onChange={onSupplierSelect}
            disabled={submitting}
          />
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
              itemsCount={items.length}
              onItemChange={onItemChange}
              onRemoveItem={onRemoveItem}
              onOpenProductModal={onOpenProductModal}
              loadProductOptions={loadProductOptions}
              onProductSelect={onProductSelect}
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
