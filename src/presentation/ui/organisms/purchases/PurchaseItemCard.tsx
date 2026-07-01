import { IAsyncOption } from '@/application/dtos/common/AsyncOption';
import { PurchaseItemForm } from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Card from '@/presentation/ui/atoms/card/SimpleCard';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import AsyncSearchSelect from '@/presentation/ui/molecules/common/AsyncSearchSelect';
import { CurrencyInput } from '@/presentation/ui/atoms/input/CurrencyInput';
import { usePurchaseRegistrationSection } from './PurchasesContext';

interface PurchaseItemCardProps {
  item: PurchaseItemForm;
  index: number;
}

const PurchaseItemCard = ({ item, index }: PurchaseItemCardProps) => {
  const {
    storeId,
    items,
    updateItem,
    removeItem,
    openProductModal,
    loadProductOptions,
    selectProductOption,
  } = usePurchaseRegistrationSection();

  const selectedProduct = item.selectedProductOption;

  const loadProductAsyncOptions = async (params: {
    search: string;
    page: number;
  }) => {
    const response = await loadProductOptions(params);

    return response;
  };

  return (
    <Card className='rounded-2xl border border-neutral-gray/20 p-4 hover:translate-y-0 hover:shadow-none'>
      <Box className='grid gap-3'>
        <Box className='flex flex-col gap-3 sm:flex-row sm:items-end'>
          <Box className='flex-1'>
            <Label>Producto</Label>
            <AsyncSearchSelect
              value={item.productId}
              selectedLabel={selectedProduct?.label}
              placeholder='Buscar producto'
              emptyLabel='No hay productos para esa búsqueda'
              loadOptions={loadProductAsyncOptions}
              onChange={(option: IAsyncOption | null) =>
                selectProductOption(index, option)
              }
              disabled={!storeId}
            />
          </Box>
          <Button
            type='button'
            variant='outlinePrimary'
            onClick={() => openProductModal(index)}
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
              updateItem(index, 'quantity', event.target.value)
            }
            placeholder='Cantidad'
          />
          <CurrencyInput
            value={item.unitCost}
            onChange={(value) => updateItem(index, 'unitCost', value)}
            placeholder='Costo unitario'
          />
        </Box>

        <Box className='grid gap-3 md:grid-cols-2'>
          <Input
            type='date'
            value={item.expiresAt}
            onChange={(event) =>
              updateItem(index, 'expiresAt', event.target.value)
            }
            placeholder='Vencimiento'
          />
          <Input
            value={item.batchCode}
            onChange={(event) =>
              updateItem(index, 'batchCode', event.target.value)
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

        {items.length > 1 ? (
          <Button
            type='button'
            variant='danger'
            onClick={() => removeItem(index)}
          >
            Eliminar ítem
          </Button>
        ) : null}
      </Box>
    </Card>
  );
};

export default PurchaseItemCard;
