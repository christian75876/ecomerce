import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '@/presentation/ui/molecules/forms/FormField';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import TurnstileWidget from '@/presentation/ui/molecules/common/TurnstileWidget';
import { registerCustomerSchema } from '@/domain/validations/auth/RegisterCustomerValidation';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { IRegisterCustomerForm } from '@/application/dtos/auth/register/customer/RegisterCustomerRequest';
import { ROUTES } from '@/shared/constants/routes';

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
  const [cfToken, setCfToken] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useFormValidation(registerCustomerSchema, isLoading, {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirm: '',
    phone: '',
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, cfToken }))} className='space-y-5'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <FormField
          name='firstName'
          label='Nombre *'
          control={control}
          type='text'
          placeholder='Tu nombre'
          showLabel
          boxClassName='w-full'
        />
        <FormField
          name='lastName'
          label='Apellido *'
          control={control}
          type='text'
          placeholder='Tu apellido'
          showLabel
          boxClassName='w-full'
        />
      </div>
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
        label='Teléfono *'
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
      <label className='flex items-start gap-2 text-xs text-neutral-dark/60'>
        <input
          type='checkbox'
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className='mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30'
        />
        <span>
          Acepto los{' '}
          <Link to={ROUTES.PUBLIC.TERMS} target='_blank' className='font-semibold text-primary hover:underline'>
            términos y condiciones
          </Link>{' '}
          y la{' '}
          <Link to={ROUTES.PUBLIC.PRIVACY} target='_blank' className='font-semibold text-primary hover:underline'>
            política de privacidad
          </Link>
        </span>
      </label>
      <TurnstileWidget onVerify={setCfToken} className='flex justify-center' />
      <Button
        type='submit'
        variant='primary'
        fullWidth
        size='lg'
        disabled={!isValid || isLoading || !cfToken || !acceptedTerms}
        className='min-h-12'
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta de comprador'}
      </Button>
    </form>
  );
};

export default CustomerRegisterForm;
