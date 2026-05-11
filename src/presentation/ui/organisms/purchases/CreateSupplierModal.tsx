import { InlineSupplierForm } from '@/application/useCases/purchases/usePurchasesManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import PurchaseModalShell from './PurchaseModalShell';

interface CreateSupplierModalProps {
  supplierForm: InlineSupplierForm;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSupplierFormChange: (key: keyof InlineSupplierForm, value: string) => void;
  onCreateSupplier: () => Promise<boolean>;
}

const CreateSupplierModal = ({
  supplierForm,
  submitting,
  error,
  onClose,
  onSupplierFormChange,
  onCreateSupplier,
}: CreateSupplierModalProps) => {
  return (
    <PurchaseModalShell
      title='Nuevo proveedor'
      description='Créalo aquí mismo y úsalo de inmediato en la compra.'
      onClose={onClose}
    >
      <Box className='mt-6 grid gap-4 md:grid-cols-2'>
        <Input
          value={supplierForm.name}
          onChange={(event) => onSupplierFormChange('name', event.target.value)}
          placeholder='Nombre del proveedor'
        />
        <Input
          value={supplierForm.document}
          onChange={(event) =>
            onSupplierFormChange('document', event.target.value)
          }
          placeholder='Documento o NIT'
        />
        <Input
          value={supplierForm.phone}
          onChange={(event) => onSupplierFormChange('phone', event.target.value)}
          placeholder='Teléfono'
        />
        <Input
          value={supplierForm.email}
          onChange={(event) => onSupplierFormChange('email', event.target.value)}
          placeholder='Correo'
        />
        <Input
          value={supplierForm.address}
          onChange={(event) =>
            onSupplierFormChange('address', event.target.value)
          }
          placeholder='Dirección'
        />
        <Input
          value={supplierForm.notes}
          onChange={(event) => onSupplierFormChange('notes', event.target.value)}
          placeholder='Observaciones'
        />
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
          onClick={() => void onCreateSupplier()}
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : 'Guardar proveedor'}
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

export default CreateSupplierModal;
