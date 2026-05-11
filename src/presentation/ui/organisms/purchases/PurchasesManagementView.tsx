import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import {
  InlineProductForm,
  InlineSupplierForm,
  PurchaseItemForm,
} from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

interface PurchasesManagementViewProps {
  purchases: IPurchase[];
  suppliers: ISupplier[];
  stores: IStore[];
  categories: ICategory[];
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
  isSupplierModalOpen: boolean;
  isProductModalOpen: boolean;
  supplierForm: InlineSupplierForm;
  productForm: InlineProductForm;
  supplierSubmitting: boolean;
  productSubmitting: boolean;
  modalError: string | null;
  onSupplierChange: (value: string) => void;
  onStoreChange: (value: string) => void;
  onPurchaseDateChange: (value: string) => void;
  onPaidAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onItemChange: (index: number, key: keyof PurchaseItemForm, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => Promise<boolean>;
  onOpenSupplierModal: () => void;
  onCloseSupplierModal: () => void;
  onOpenProductModal: (index: number) => void;
  onCloseProductModal: () => void;
  onSupplierFormChange: (key: keyof InlineSupplierForm, value: string) => void;
  onProductFormChange: <K extends keyof InlineProductForm>(key: K, value: InlineProductForm[K]) => void;
  onCreateSupplier: () => Promise<boolean>;
  onCreateProduct: () => Promise<boolean>;
}

export const PurchasesManagementView = ({
  purchases,
  suppliers,
  stores,
  categories,
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
  isSupplierModalOpen,
  isProductModalOpen,
  supplierForm,
  productForm,
  supplierSubmitting,
  productSubmitting,
  modalError,
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
  onCloseSupplierModal,
  onOpenProductModal,
  onCloseProductModal,
  onSupplierFormChange,
  onProductFormChange,
  onCreateSupplier,
  onCreateProduct,
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
              <Box className='mb-2 flex items-center justify-between gap-3'>
                <Label htmlFor='purchase-supplier'>Proveedor</Label>
                <Button type='button' variant='ghost' onClick={onOpenSupplierModal}>
                  Crear proveedor
                </Button>
              </Box>
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
                  <Box className='flex flex-col gap-3 sm:flex-row sm:items-end'>
                    <Box className='flex-1'>
                      <Label>Producto</Label>
                      <select value={item.productId} onChange={(event) => onItemChange(index, 'productId', event.target.value)} className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'>
                        <option value=''>{storeId ? 'Selecciona producto de la tienda' : 'Selecciona primero una tienda'}</option>
                        {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                      </select>
                    </Box>
                    <Button type='button' variant='outlinePrimary' onClick={() => onOpenProductModal(index)} disabled={!storeId}>
                      Crear producto
                    </Button>
                  </Box>
                  <Box className='grid gap-3 md:grid-cols-2'>
                    <Input type='number' min='1' value={item.quantity} onChange={(event) => onItemChange(index, 'quantity', event.target.value)} placeholder='Cantidad' />
                    <Input type='number' min='0' step='0.01' value={item.unitCost} onChange={(event) => onItemChange(index, 'unitCost', event.target.value)} placeholder='Costo unitario' />
                  </Box>
                  <Box className='grid gap-3 md:grid-cols-2'>
                    <Input
                      type='date'
                      value={item.expiresAt}
                      onChange={(event) => onItemChange(index, 'expiresAt', event.target.value)}
                      placeholder='Vencimiento'
                    />
                    <Input
                      value={item.batchCode}
                      onChange={(event) => onItemChange(index, 'batchCode', event.target.value)}
                      placeholder='Código de lote'
                    />
                  </Box>
                  {item.productId ? (
                    <Box className='rounded-2xl border border-neutral-gray/20 bg-background px-4 py-3'>
                      <Typography className='text-sm text-neutral-dark/65'>
                        {products.find((product) => product.id === item.productId)?.isPerishable
                          ? 'Producto perecedero: el vencimiento es obligatorio.'
                          : 'Producto no perecedero: el vencimiento es opcional.'}
                      </Typography>
                      <Typography className='mt-1 text-sm text-neutral-dark/65'>
                        Catálogo:{' '}
                        {products.find((product) => product.id === item.productId)?.showStock
                          ? 'muestra disponibilidad/stock'
                          : 'oculta stock al comprador'}
                        {' · '}
                        Tienda:{' '}
                        {products.find((product) => product.id === item.productId)?.store?.name ?? 'Sin tienda'}
                      </Typography>
                    </Box>
                  ) : null}
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
                  {purchase.store.name} · Total {formatCurrencyCOP(purchase.total)} · Saldo {formatCurrencyCOP(purchase.balance)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {isSupplierModalOpen ? (
        <Box className='fixed inset-0 z-[90] flex items-center justify-center bg-neutral-dark/45 px-4 backdrop-blur-sm'>
          <Box className='w-full max-w-2xl rounded-[1.75rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]'>
            <Box className='flex items-start justify-between gap-4'>
              <Box>
                <Typography variant='h2' className='text-xl font-semibold'>Nuevo proveedor</Typography>
                <Typography className='mt-2 text-sm text-neutral-dark/65'>
                  Créalo aquí mismo y úsalo de inmediato en la compra.
                </Typography>
              </Box>
              <Button type='button' variant='ghost' onClick={onCloseSupplierModal}>Cerrar</Button>
            </Box>
            <Box className='mt-6 grid gap-4 md:grid-cols-2'>
              <Input value={supplierForm.name} onChange={(event) => onSupplierFormChange('name', event.target.value)} placeholder='Nombre del proveedor' />
              <Input value={supplierForm.document} onChange={(event) => onSupplierFormChange('document', event.target.value)} placeholder='Documento o NIT' />
              <Input value={supplierForm.phone} onChange={(event) => onSupplierFormChange('phone', event.target.value)} placeholder='Teléfono' />
              <Input value={supplierForm.email} onChange={(event) => onSupplierFormChange('email', event.target.value)} placeholder='Correo' />
              <Input value={supplierForm.address} onChange={(event) => onSupplierFormChange('address', event.target.value)} placeholder='Dirección' />
              <Input value={supplierForm.notes} onChange={(event) => onSupplierFormChange('notes', event.target.value)} placeholder='Observaciones' />
            </Box>
            {modalError ? <Box className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{modalError}</Box> : null}
            <Box className='mt-6 flex flex-wrap gap-3'>
              <Button type='button' variant='primary' onClick={() => void onCreateSupplier()} disabled={supplierSubmitting}>
                {supplierSubmitting ? 'Guardando...' : 'Guardar proveedor'}
              </Button>
              <Button type='button' variant='outline' onClick={onCloseSupplierModal} disabled={supplierSubmitting}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      ) : null}

      {isProductModalOpen ? (
        <Box className='fixed inset-0 z-[90] flex items-center justify-center bg-neutral-dark/45 px-4 backdrop-blur-sm'>
          <Box className='w-full max-w-3xl rounded-[1.75rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]'>
            <Box className='flex items-start justify-between gap-4'>
              <Box>
                <Typography variant='h2' className='text-xl font-semibold'>Nuevo producto para la compra</Typography>
                <Typography className='mt-2 text-sm text-neutral-dark/65'>
                  Crea el producto con su información comercial y luego agrégalo de inmediato al ítem actual.
                </Typography>
              </Box>
              <Button type='button' variant='ghost' onClick={onCloseProductModal}>Cerrar</Button>
            </Box>
            <Box className='mt-6 grid gap-4 md:grid-cols-2'>
              <Input value={productForm.name} onChange={(event) => onProductFormChange('name', event.target.value)} placeholder='Nombre del producto' />
              <Input value={productForm.sku} onChange={(event) => onProductFormChange('sku', event.target.value)} placeholder='SKU' />
              <Input value={productForm.price} onChange={(event) => onProductFormChange('price', event.target.value)} placeholder='Precio de venta' type='number' min='0' step='0.01' />
              <select value={productForm.categoryId} onChange={(event) => onProductFormChange('categoryId', event.target.value)} className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'>
                <option value=''>Selecciona categoría</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <Box className='md:col-span-2'>
                <Input value={productForm.description} onChange={(event) => onProductFormChange('description', event.target.value)} placeholder='Descripción del producto' />
              </Box>
              <Box className='md:col-span-2'>
                <Input value={productForm.imageUrl} onChange={(event) => onProductFormChange('imageUrl', event.target.value)} placeholder='URL de imagen principal' />
              </Box>
            </Box>
            <Box className='mt-4 grid gap-3 md:grid-cols-3'>
              <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
                <input type='checkbox' checked={productForm.showStock} onChange={(event) => onProductFormChange('showStock', event.target.checked)} />
                Mostrar en catálogo
              </label>
              <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
                <input type='checkbox' checked={productForm.isPerishable} onChange={(event) => onProductFormChange('isPerishable', event.target.checked)} />
                Producto perecedero
              </label>
              <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
                <input type='checkbox' checked={productForm.trackBatches} onChange={(event) => onProductFormChange('trackBatches', event.target.checked)} />
                Gestionar por lotes
              </label>
            </Box>
            {modalError ? <Box className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{modalError}</Box> : null}
            <Box className='mt-6 flex flex-wrap gap-3'>
              <Button type='button' variant='primary' onClick={() => void onCreateProduct()} disabled={productSubmitting}>
                {productSubmitting ? 'Guardando...' : 'Guardar producto'}
              </Button>
              <Button type='button' variant='outline' onClick={onCloseProductModal} disabled={productSubmitting}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};
