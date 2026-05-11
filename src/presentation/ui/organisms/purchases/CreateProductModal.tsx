import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { InlineProductForm } from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import PurchaseModalShell from './PurchaseModalShell';

interface CreateProductModalProps {
  categories: ICategory[];
  productForm: InlineProductForm;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onProductFormChange: <K extends keyof InlineProductForm>(
    key: K,
    value: InlineProductForm[K],
  ) => void;
  onCreateProduct: () => Promise<boolean>;
}

const CreateProductModal = ({
  categories,
  productForm,
  submitting,
  error,
  onClose,
  onProductFormChange,
  onCreateProduct,
}: CreateProductModalProps) => {
  return (
    <PurchaseModalShell
      title='Nuevo producto para la compra'
      description='Crea el producto con su información comercial y luego agrégalo de inmediato al ítem actual.'
      maxWidthClassName='max-w-3xl'
      onClose={onClose}
    >
      <Box className='mt-6 grid gap-4 md:grid-cols-2'>
        <Input
          value={productForm.name}
          onChange={(event) => onProductFormChange('name', event.target.value)}
          placeholder='Nombre del producto'
        />
        <Input
          value={productForm.sku}
          onChange={(event) => onProductFormChange('sku', event.target.value)}
          placeholder='SKU'
        />
        <Input
          value={productForm.price}
          onChange={(event) => onProductFormChange('price', event.target.value)}
          placeholder='Precio de venta'
          type='number'
          min='0'
          step='0.01'
        />
        <select
          value={productForm.categoryId}
          onChange={(event) =>
            onProductFormChange('categoryId', event.target.value)
          }
          className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
        >
          <option value=''>Selecciona categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Box className='md:col-span-2'>
          <Input
            value={productForm.description}
            onChange={(event) =>
              onProductFormChange('description', event.target.value)
            }
            placeholder='Descripción del producto'
          />
        </Box>
        <Box className='md:col-span-2'>
          <Input
            value={productForm.imageUrl}
            onChange={(event) =>
              onProductFormChange('imageUrl', event.target.value)
            }
            placeholder='URL de imagen principal'
          />
        </Box>
      </Box>

      <Box className='mt-4 grid gap-3 md:grid-cols-3'>
        <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
          <input
            type='checkbox'
            checked={productForm.showStock}
            onChange={(event) =>
              onProductFormChange('showStock', event.target.checked)
            }
          />
          Mostrar en catálogo
        </label>
        <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
          <input
            type='checkbox'
            checked={productForm.isPerishable}
            onChange={(event) =>
              onProductFormChange('isPerishable', event.target.checked)
            }
          />
          Producto perecedero
        </label>
        <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
          <input
            type='checkbox'
            checked={productForm.trackBatches}
            onChange={(event) =>
              onProductFormChange('trackBatches', event.target.checked)
            }
          />
          Gestionar por lotes
        </label>
      </Box>

      {error ? (
        <Box className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
          {error}
        </Box>
      ) : null}

      <Box className='mt-6 flex flex-wrap gap-3'>
        <Button
          type='button'
          variant='primary'
          onClick={() => void onCreateProduct()}
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : 'Guardar producto'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={onClose}
          disabled={submitting}
        >
          Cancelar
        </Button>
      </Box>
    </PurchaseModalShell>
  );
};

export default CreateProductModal;
