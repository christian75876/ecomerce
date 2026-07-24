import FormField from '@/presentation/ui/molecules/forms/FormField';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import { registerCustomerSchema } from '@/domain/validations/auth/RegisterCustomerValidation';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { IRegisterCustomerForm } from '@/application/dtos/auth/register/customer/RegisterCustomerRequest';

interface CustomerRegisterFormProps {
  onSubmit: (data: IRegisterCustomerForm) => void;
  isLoading?: boolean;
  error?: string | null;
}

const CustomerRegisterForm = ({
  onSubmit,
  isLoading = false,
  error,
}: CustomerRegisterFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useFormValidation(registerCustomerSchema, isLoading, {
    name: '',
    email: '',
    password: '',
    password_confirm: '',
    phone: '',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <FormField
        name='name'
        label='Nombre'
        control={control}
        type='text'
        placeholder='Tu nombre'
        showLabel
        boxClassName='w-full'
      />
      <FormField
        name='email'
        label='Correo'
        control={control}
        type='email'
        placeholder='correo@ejemplo.com'
        showLabel
        boxClassName='w-full'
      />
      <FormField
        name='phone'
        label='Teléfono'
        control={control}
        type='text'
        placeholder='300 123 4567'
        showLabel
        boxClassName='w-full'
      />
      <FormField
        name='password'
        label='Contraseña'
        control={control}
        type='password'
        placeholder='Mínimo 6 caracteres'
        showLabel
        boxClassName='w-full'
      />
      <FormField
        name='password_confirm'
        label='Confirmar contraseña'
        control={control}
        type='password'
        placeholder='Repite tu contraseña'
        showLabel
        boxClassName='w-full'
      />
      {error ? (
        <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
          {error}
        </Box>
      ) : null}
      <Button
        type='submit'
        variant='primary'
        fullWidth
        size='lg'
        disabled={!isValid || isLoading}
        className='min-h-12'
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta de comprador'}
      </Button>
    </form>
  );
};

export default CustomerRegisterForm;
