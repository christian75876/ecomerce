import { IAsyncOption } from '@/application/dtos/common/AsyncOption';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import AsyncSearchSelect from '@/presentation/ui/molecules/common/AsyncSearchSelect';
import { CurrencyInput } from '@/presentation/ui/atoms/input/CurrencyInput';
import FeaturePanel from '@/presentation/ui/templates/feature/FeaturePanel';
import { usePurchaseRegistrationSection } from './PurchasesContext';
import PurchaseItemCard from './PurchaseItemCard';

const PurchaseRegistrationForm = () => {
  const {
    isRegistrationFormOpen,
    openRegistrationForm,
    closeRegistrationForm,
    supplierId,
    selectedSupplierOption,
    purchaseDate,
    paidAmount,
    note,
    items,
    submitting,
    error,
    selectSupplierOption,
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

  if (!isRegistrationFormOpen) {
    return (
      <FeaturePanel title='' subtitle='' className='h-fit'>
        <Box className='flex flex-col items-center justify-center py-10 text-center'>
          <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10'>
            <i className='bx bx-package text-2xl text-primary' />
          </div>
          <Typography variant='h2' className='text-lg font-semibold'>
            Registrar compra
          </Typography>
          <Typography className='mt-1 text-sm text-slate-400'>
            Abastece inventario, crea proveedor o producto de forma rápida.
          </Typography>
          <button
            type='button'
            onClick={openRegistrationForm}
            className='mt-5 flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90'
          >
            <i className='bx bx-plus text-base' />
            Nueva compra
          </button>
        </Box>
      </FeaturePanel>
    );
  }

  return (
    <FeaturePanel
      title='Registrar compra'
      subtitle='Registra abastecimientos, crea proveedor o producto inline y aumenta el stock con trazabilidad.'
      className='h-fit'
      action={
        <button
          type='button'
          onClick={closeRegistrationForm}
          className='flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50'
        >
          <i className='bx bx-x text-sm' /> Cancelar
        </button>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className='space-y-4'>
        <Box>
          <Box className='mb-2 flex items-center justify-between gap-3'>
            <Label htmlFor='purchase-supplier'>Proveedor</Label>
            <Button type='button' variant='ghost' onClick={openSupplierModal}>
              Crear proveedor
            </Button>
          </Box>
          <AsyncSearchSelect
            value={supplierId}
            selectedLabel={selectedSupplierOption?.label}
            placeholder='Buscar proveedor'
            emptyLabel='No hay proveedores para esa búsqueda'
            loadOptions={loadSupplierOptions}
            onChange={(option: IAsyncOption | null) => selectSupplierOption(option)}
            disabled={submitting}
          />
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
            <CurrencyInput
              id='purchase-paid'
              value={paidAmount}
              onChange={setPaidAmount}
              disabled={submitting}
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
            <PurchaseItemCard key={item._key} item={item} index={index} />
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

        <Button type='submit' variant='primary' disabled={submitting} className='w-full'>
          {submitting ? 'Guardando...' : 'Registrar compra'}
        </Button>
      </form>
    </FeaturePanel>
  );
};

export default PurchaseRegistrationForm;
