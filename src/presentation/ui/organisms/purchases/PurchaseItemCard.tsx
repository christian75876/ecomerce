import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { PurchaseItemForm } from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Card from '@/presentation/ui/atoms/card/SimpleCard';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface PurchaseItemCardProps {
  item: PurchaseItemForm;
  index: number;
  storeId: string;
  products: IProduct[];
  itemsCount: number;
  onItemChange: (
    index: number,
    key: keyof PurchaseItemForm,
    value: string,
  ) => void;
  onRemoveItem: (index: number) => void;
  onOpenProductModal: (index: number) => void;
}

const PurchaseItemCard = ({
  item,
  index,
  storeId,
  products,
  itemsCount,
  onItemChange,
  onRemoveItem,
  onOpenProductModal,
}: PurchaseItemCardProps) => {
  const selectedProduct =
    products.find((product) => product.id === item.productId) ?? null;

  return (
    <Card className='rounded-2xl border border-neutral-gray/20 p-4 hover:translate-y-0 hover:shadow-none'>
      <Box className='grid gap-3'>
        <Box className='flex flex-col gap-3 sm:flex-row sm:items-end'>
          <Box className='flex-1'>
            <Label>Producto</Label>
            <select
              value={item.productId}
              onChange={(event) =>
                onItemChange(index, 'productId', event.target.value)
              }
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value=''>
                {storeId
                  ? 'Selecciona producto de la tienda'
                  : 'Selecciona primero una tienda'}
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </Box>
          <Button
            type='button'
            variant='outlinePrimary'
            onClick={() => onOpenProductModal(index)}
            disabled={!storeId}
          >
            Crear producto
          </Button>
        </Box>

        <Box className='grid gap-3 md:grid-cols-2'>
          <Input
            type='number'
            min='1'
            value={item.quantity}
            onChange={(event) =>
              onItemChange(index, 'quantity', event.target.value)
            }
            placeholder='Cantidad'
          />
          <Input
            type='number'
            min='0'
            step='0.01'
            value={item.unitCost}
            onChange={(event) =>
              onItemChange(index, 'unitCost', event.target.value)
            }
            placeholder='Costo unitario'
          />
        </Box>

        <Box className='grid gap-3 md:grid-cols-2'>
          <Input
            type='date'
            value={item.expiresAt}
            onChange={(event) =>
              onItemChange(index, 'expiresAt', event.target.value)
            }
            placeholder='Vencimiento'
          />
          <Input
            value={item.batchCode}
            onChange={(event) =>
              onItemChange(index, 'batchCode', event.target.value)
            }
            placeholder='Código de lote'
          />
        </Box>

        {selectedProduct ? (
          <Box className='rounded-2xl border border-neutral-gray/20 bg-background px-4 py-3'>
            <Typography className='text-sm text-neutral-dark/65'>
              {selectedProduct.isPerishable
                ? 'Producto perecedero: el vencimiento es obligatorio.'
                : 'Producto no perecedero: el vencimiento es opcional.'}
            </Typography>
            <Typography className='mt-1 text-sm text-neutral-dark/65'>
              Catálogo:{' '}
              {selectedProduct.showStock
                ? 'muestra disponibilidad/stock'
                : 'oculta stock al comprador'}
              {' · '}
              Tienda: {selectedProduct.store?.name ?? 'Sin tienda'}
            </Typography>
          </Box>
        ) : null}

        {itemsCount > 1 ? (
          <Button
            type='button'
            variant='danger'
            onClick={() => onRemoveItem(index)}
          >
            Eliminar ítem
          </Button>
        ) : null}
      </Box>
    </Card>
  );
};

export default PurchaseItemCard;
