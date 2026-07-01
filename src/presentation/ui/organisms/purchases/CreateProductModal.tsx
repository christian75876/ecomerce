import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import { CurrencyInput } from '@/presentation/ui/atoms/input/CurrencyInput';
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
    isCategoryInputOpen,
    newCategoryName,
    categoryCreating,
    openCategoryInput,
    closeCategoryInput,
    setNewCategoryName,
    createCategoryInline,
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
        <Box>
          <CurrencyInput
            value={productForm.price}
            onChange={(value) => updateProductForm('price', value)}
            placeholder='Precio de venta'
          />
        </Box>

        {/* Category select + inline creation */}
        <Box>
          {isCategoryInputOpen ? (
            <Box className='flex gap-2'>
              <input
                type='text'
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder='Nombre de la categoría'
                disabled={categoryCreating}
                className='flex-1 rounded-2xl border border-neutral-gray/70 bg-white px-4 py-3 text-sm text-neutral-dark placeholder:text-neutral-dark/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); void createCategoryInline(); }
                  if (e.key === 'Escape') closeCategoryInput();
                }}
                autoFocus
              />
              <button
                type='button'
                onClick={() => void createCategoryInline()}
                disabled={categoryCreating}
                className='rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50'
              >
                {categoryCreating ? '...' : 'Crear'}
              </button>
              <button
                type='button'
                onClick={closeCategoryInput}
                disabled={categoryCreating}
                className='rounded-2xl border border-neutral-gray/40 px-3 py-2 text-xs text-slate-500'
              >
                ✕
              </button>
            </Box>
          ) : (
            <Box className='flex gap-2'>
              <select
                value={productForm.categoryId}
                onChange={(event) => updateProductForm('categoryId', event.target.value)}
                className='flex-1 rounded-2xl border border-neutral-gray/70 bg-white px-4 py-3 text-sm text-neutral-dark focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
              >
                <option value=''>Selecciona categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type='button'
                onClick={openCategoryInput}
                title='Crear nueva categoría'
                className='rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10'
              >
                + Nueva
              </button>
            </Box>
          )}
        </Box>

        <Box className='md:col-span-2'>
          <Input
            value={productForm.description}
            onChange={(event) => updateProductForm('description', event.target.value)}
            placeholder='Descripción del producto'
          />
        </Box>
        <Box className='md:col-span-2'>
          <Input
            value={productForm.imageUrl}
            onChange={(event) => updateProductForm('imageUrl', event.target.value)}
            placeholder='URL de imagen principal'
          />
        </Box>
      </Box>

      <Box className='mt-4 grid gap-3 md:grid-cols-2'>
        <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
          <input
            type='checkbox'
            checked={productForm.showStock}
            onChange={(event) => updateProductForm('showStock', event.target.checked)}
          />
          Mostrar en catálogo
        </label>
        <label className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 px-4 py-3 text-sm text-neutral-dark'>
          <input
            type='checkbox'
            checked={productForm.isPerishable}
            onChange={(event) => updateProductForm('isPerishable', event.target.checked)}
          />
          Producto perecedero
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
