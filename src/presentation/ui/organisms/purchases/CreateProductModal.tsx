import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import SelectDropdown from '@/presentation/ui/molecules/common/SelectDropdown';
import PurchaseModalShell from './PurchaseModalShell';
import { usePurchaseModalSection } from './PurchasesContext';

const CreateProductModal = () => {
  const {
    categories,
    productForm,
    productSubmitting,
    modalError,
    isProductModalOpen,
    closeProductModal,
    updateProductForm,
    createProductInline,
  } = usePurchaseModalSection();

  if (!isProductModalOpen) {
    return null;
  }

  return (
    <PurchaseModalShell
      title='Nuevo producto para la compra'
      description='Crea el producto con su información comercial y luego agrégalo de inmediato al ítem actual.'
      maxWidthClassName='max-w-3xl'
      onClose={closeProductModal}
    >
      <Box className='mt-6 grid gap-4 md:grid-cols-2'>
        <Input
          value={productForm.name}
          onChange={(event) => updateProductForm('name', event.target.value)}
          placeholder='Nombre del producto'
        />
        <Input
          value={productForm.sku}
          onChange={(event) => updateProductForm('sku', event.target.value)}
          placeholder='SKU'
        />
        <Input
          value={productForm.price}
          onChange={(event) => updateProductForm('price', event.target.value)}
          placeholder='Precio de venta'
          type='number'
          min='0'
          step='0.01'
        />
        <SelectDropdown
          value={productForm.categoryId}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          placeholder='Selecciona categoría'
          onChange={(v) => updateProductForm('categoryId', v)}
        />
        <Box className='md:col-span-2'>
          <Input
            value={productForm.description}
            onChange={(event) =>
              updateProductForm('description', event.target.value)
            }
            placeholder='Descripción del producto'
          />
        </Box>
        <Box className='md:col-span-2'>
          <Input
            value={productForm.imageUrl}
            onChange={(event) =>
              updateProductForm('imageUrl', event.target.value)
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
              updateProductForm('showStock', event.target.checked)
            }
          />
          Mostrar en catálogo
        </label>
        <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
          <input
            type='checkbox'
            checked={productForm.isPerishable}
            onChange={(event) =>
              updateProductForm('isPerishable', event.target.checked)
            }
          />
          Producto perecedero
        </label>
        <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
          <input
            type='checkbox'
            checked={productForm.trackBatches}
            onChange={(event) =>
              updateProductForm('trackBatches', event.target.checked)
            }
          />
          Gestionar por lotes
        </label>
      </Box>

      {modalError ? (
        <Box className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
          {modalError}
        </Box>
      ) : null}

      <Box className='mt-6 flex flex-wrap gap-3'>
        <Button
          type='button'
          variant='primary'
          onClick={() => void createProductInline()}
          disabled={productSubmitting}
        >
          {productSubmitting ? 'Guardando...' : 'Guardar producto'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={closeProductModal}
          disabled={productSubmitting}
        >
          Cancelar
        </Button>
      </Box>
    </PurchaseModalShell>
  );
};

export default CreateProductModal;
