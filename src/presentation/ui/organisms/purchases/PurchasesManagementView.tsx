import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { PurchaseItemForm } from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface PurchasesManagementViewProps {
  purchases: IPurchase[];
  suppliers: ISupplier[];
  stores: IStore[];
  products: IProduct[];
  supplierId: string;
  storeId: string;
  purchaseDate: string;
  paidAmount: string;
  note: string;
  items: PurchaseItemForm[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onSupplierChange: (value: string) => void;
  onStoreChange: (value: string) => void;
  onPurchaseDateChange: (value: string) => void;
  onPaidAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onItemChange: (index: number, key: keyof PurchaseItemForm, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => Promise<boolean>;
}

export const PurchasesManagementView = ({
  purchases,
  suppliers,
  stores,
  products,
  supplierId,
  storeId,
  purchaseDate,
  paidAmount,
  note,
  items,
  loading,
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
}: PurchasesManagementViewProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <Box className='space-y-8'>
      <Box>
        <Typography variant='h1' className='text-3xl font-bold'>Compras</Typography>
        <Typography className='mt-2 text-neutral-dark/70'>
          Registra abastecimientos a proveedor y aumenta el stock con trazabilidad.
        </Typography>
      </Box>
      <Box className='grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]'>
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Box>
              <Label htmlFor='purchase-supplier'>Proveedor</Label>
              <select id='purchase-supplier' value={supplierId} onChange={(event) => onSupplierChange(event.target.value)} className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'>
                <option value=''>Selecciona proveedor</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </Box>
            <Box>
              <Label htmlFor='purchase-store'>Tienda</Label>
              <select id='purchase-store' value={storeId} onChange={(event) => onStoreChange(event.target.value)} className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'>
                <option value=''>Selecciona tienda</option>
                {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
              </select>
            </Box>
            <Box className='grid gap-4 md:grid-cols-2'>
              <Box>
                <Label htmlFor='purchase-date'>Fecha</Label>
                <Input id='purchase-date' type='datetime-local' value={purchaseDate} onChange={(event) => onPurchaseDateChange(event.target.value)} />
              </Box>
              <Box>
                <Label htmlFor='purchase-paid'>Abono inicial</Label>
                <Input id='purchase-paid' type='number' min='0' step='0.01' value={paidAmount} onChange={(event) => onPaidAmountChange(event.target.value)} />
              </Box>
            </Box>
            <Box>
              <Label htmlFor='purchase-note'>Observación</Label>
              <Input id='purchase-note' value={note} onChange={(event) => onNoteChange(event.target.value)} />
            </Box>
            <Box className='space-y-3'>
              <Typography variant='h3' className='text-lg font-semibold'>Ítems</Typography>
              {items.map((item, index) => (
                <Box key={`${item.productId}-${index}`} className='grid gap-3 rounded-2xl border border-neutral-gray/20 p-4'>
                  <select value={item.productId} onChange={(event) => onItemChange(index, 'productId', event.target.value)} className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'>
                    <option value=''>{storeId ? 'Selecciona producto de la tienda' : 'Selecciona primero una tienda'}</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                  </select>
                  <Box className='grid gap-3 md:grid-cols-2'>
                    <Input type='number' min='1' value={item.quantity} onChange={(event) => onItemChange(index, 'quantity', event.target.value)} placeholder='Cantidad' />
                    <Input type='number' min='0' step='0.01' value={item.unitCost} onChange={(event) => onItemChange(index, 'unitCost', event.target.value)} placeholder='Costo unitario' />
                  </Box>
                  {items.length > 1 ? <Button type='button' variant='danger' onClick={() => onRemoveItem(index)}>Eliminar ítem</Button> : null}
                </Box>
              ))}
              <Button type='button' variant='outlinePrimary' onClick={onAddItem}>Agregar ítem</Button>
            </Box>
            {error ? <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</Box> : null}
            <Button type='submit' variant='primary' disabled={submitting}>
              {submitting ? 'Guardando...' : 'Registrar compra'}
            </Button>
          </form>
        </Box>
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-xl font-semibold'>Compras registradas</Typography>
          <Box className='mt-5 space-y-3'>
            {loading ? <Typography>Cargando compras...</Typography> : purchases.map((purchase) => (
              <Box key={purchase.id} className='rounded-2xl border border-neutral-gray/20 px-5 py-4'>
                <Typography variant='h3' className='text-lg font-semibold'>{purchase.supplier.name}</Typography>
                <Typography className='mt-1 text-sm text-neutral-dark/65'>
                  {purchase.store.name} · Total ${Number(purchase.total).toFixed(2)} · Saldo ${Number(purchase.balance).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
