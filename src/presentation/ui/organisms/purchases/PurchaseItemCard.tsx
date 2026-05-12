import { IAsyncOption } from '@/application/dtos/common/AsyncOption';
import { PurchaseItemForm } from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Card from '@/presentation/ui/atoms/card/SimpleCard';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import AsyncSearchSelect from '@/presentation/ui/molecules/common/AsyncSearchSelect';

interface PurchaseItemCardProps {
  item: PurchaseItemForm;
  index: number;
  storeId: string;
  itemsCount: number;
  onItemChange: <K extends keyof PurchaseItemForm>(
    index: number,
    key: K,
    value: PurchaseItemForm[K],
  ) => void;
  onRemoveItem: (index: number) => void;
  onOpenProductModal: (index: number) => void;
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

const PurchaseItemCard = ({
  item,
  index,
  storeId,
  itemsCount,
  onItemChange,
  onRemoveItem,
  onOpenProductModal,
  loadProductOptions,
  onProductSelect,
}: PurchaseItemCardProps) => {
  const selectedProduct = item.selectedProductOption;

  return (
    <Card className='rounded-2xl border border-neutral-gray/20 p-4 hover:translate-y-0 hover:shadow-none'>
      <Box className='grid gap-3'>
        <Box className='flex flex-col gap-3 sm:flex-row sm:items-end'>
          <Box className='flex-1'>
            <Label>Producto</Label>
            <AsyncSearchSelect
              value={item.productId}
              selectedLabel={selectedProduct?.label}
              placeholder={
                storeId
                  ? 'Buscar producto de la tienda'
                  : 'Selecciona primero una tienda'
              }
              emptyLabel='No hay productos para esa búsqueda'
              loadOptions={loadProductOptions}
              onChange={(option) => onProductSelect(index, option)}
              disabled={!storeId}
            />
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
              {(selectedProduct.isPerishable as boolean | undefined)
                ? 'Producto perecedero: el vencimiento es obligatorio.'
                : 'Producto no perecedero: el vencimiento es opcional.'}
            </Typography>
            <Typography className='mt-1 text-sm text-neutral-dark/65'>
              Catálogo:{' '}
              {(selectedProduct.showStock as boolean | undefined)
                ? 'muestra disponibilidad/stock'
                : 'oculta stock al comprador'}
              {' · '}
              Tienda: {String(selectedProduct.helper ?? 'Sin tienda')}
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
