import { IAsyncOption } from '@/application/dtos/common/AsyncOption';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import AsyncSearchSelect from '@/presentation/ui/molecules/common/AsyncSearchSelect';
import FeaturePanel from '@/presentation/ui/templates/feature/FeaturePanel';
import { usePurchaseRegistrationSection } from './PurchasesContext';
import PurchaseItemCard from './PurchaseItemCard';

const PurchaseRegistrationForm = () => {
  const {
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
    selectSupplierOption,
    setStoreId,
    setPurchaseDate,
    setPaidAmount,
    setNote,
    addItem,
    submitForm,
    openSupplierModal,
    loadSupplierOptions,
  } = usePurchaseRegistrationSection();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitForm();
  };

  const loadSupplierAsyncOptions = async (params: {
    search: string;
    page: number;
  }) => {
    const response = await loadSupplierOptions(params);

    return response;
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
              onClick={openSupplierModal}
            >
              Crear proveedor
            </Button>
          </Box>
          <AsyncSearchSelect
            value={supplierId}
            selectedLabel={selectedSupplierOption?.label}
            placeholder='Buscar proveedor'
            emptyLabel='No hay proveedores para esa búsqueda'
            loadOptions={loadSupplierAsyncOptions}
            onChange={(option: IAsyncOption | null) => selectSupplierOption(option)}
            disabled={submitting}
          />
        </Box>

        <Box>
          <Label htmlFor='purchase-store'>Tienda</Label>
          <select
            id='purchase-store'
            value={storeId}
            onChange={(event) => setStoreId(event.target.value)}
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
              onChange={(event) => setPurchaseDate(event.target.value)}
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
              onChange={(event) => setPaidAmount(event.target.value)}
            />
          </Box>
        </Box>

        <Box>
          <Label htmlFor='purchase-note'>Observación</Label>
          <Input
            id='purchase-note'
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Box>

        <Box className='space-y-3'>
          <Typography variant='h3' className='text-lg font-semibold'>
            Ítems
          </Typography>
          {items.map((item, index) => (
            <PurchaseItemCard key={`${item.productId}-${index}-${index}`} item={item} index={index} />
          ))}
          <Button type='button' variant='outlinePrimary' onClick={addItem}>
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
