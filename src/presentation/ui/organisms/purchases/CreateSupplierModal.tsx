import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import PhoneInputCO from '@/presentation/ui/molecules/common/PhoneInputCO';
import PurchaseModalShell from './PurchaseModalShell';
import { usePurchaseModalSection } from './PurchasesContext';

const CreateSupplierModal = () => {
  const {
    supplierForm,
    supplierSubmitting,
    modalError,
    isSupplierModalOpen,
    closeSupplierModal,
    updateSupplierForm,
    createSupplierInline,
  } = usePurchaseModalSection();

  if (!isSupplierModalOpen) {
    return null;
  }

  return (
    <PurchaseModalShell
      title='Nuevo proveedor'
      description='Créalo aquí mismo y úsalo de inmediato en la compra.'
      onClose={closeSupplierModal}
    >
      <Box className='mt-6 grid gap-4 md:grid-cols-2'>
        <Input
          value={supplierForm.name}
          onChange={(event) => updateSupplierForm('name', event.target.value)}
          placeholder='Nombre del proveedor'
        />
        <Input
          value={supplierForm.document}
          onChange={(event) =>
            updateSupplierForm('document', event.target.value)
          }
          placeholder='Documento o NIT'
        />
        <PhoneInputCO
          value={supplierForm.phone}
          onChange={(v) => updateSupplierForm('phone', v)}
        />
        <Input
          value={supplierForm.email}
          onChange={(event) => updateSupplierForm('email', event.target.value)}
          placeholder='Correo'
        />
        <Input
          value={supplierForm.address}
          onChange={(event) =>
            updateSupplierForm('address', event.target.value)
          }
          placeholder='Dirección'
        />
        <Input
          value={supplierForm.notes}
          onChange={(event) => updateSupplierForm('notes', event.target.value)}
          placeholder='Observaciones'
        />
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
          onClick={() => void createSupplierInline()}
          disabled={supplierSubmitting}
        >
          {supplierSubmitting ? 'Guardando...' : 'Guardar proveedor'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={closeSupplierModal}
          disabled={supplierSubmitting}
        >
          Cancelar
        </Button>
      </Box>
    </PurchaseModalShell>
  );
};

export default CreateSupplierModal;
