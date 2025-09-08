import { IRegisterForm } from '@/application/dtos/auth/register/register/RegisterRequest';
import { registerSchema } from '@/domain/validations/auth/RegisterValidation';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import FormField from '../forms/FormField';
import Button from '../../atoms/button/SimpleButton';
import Loader from '../../atoms/loader/SimpleLoader';
import { DropDownMenuForm, IOption } from '../common/DropDownMenuForm';
import { useRoles } from '@/application/useCases/users/useRoles';
import { useState } from 'react';

interface RegisterFormProps {
  onSubmit: (data: IRegisterForm) => void;
  isLoading?: boolean;
}

const AuthFormRegister = ({
  onSubmit,
  isLoading = false
}: RegisterFormProps) => {
  const [disabled, setDisabled] = useState<boolean>(false);
  const { control, handleSubmit } = useFormValidation(
    registerSchema({ isAdmin: false }),
    disabled,
    {
      email: '',
      password: '',
      password_confirm: '',
      role_id: '0'
    }
  );

  const {
    roles,
    isLoading: isRolesLoading,
    error: isRolesError
  } = useRoles(setDisabled);

  return (
    <form
      onSubmit={handleSubmit(async () => {
        setDisabled(true);
        onSubmit;
        setDisabled(false);
      })}
      className='space-y-4'
    >
      <FormField
        name='email'
        label='Correo'
        control={control}
        type='email'
        placeholder='Ingresa tu correo'
      />
      <FormField
        name='password'
        label='Contraseña'
        control={control}
        type='password'
        placeholder='Ingresa tu contraseña'
      />
      <FormField
        name='password_confirm'
        label='Confirmar contraseña'
        control={control}
        type='password'
        placeholder='Confirma tu contraseña'
      />
      <DropDownMenuForm
        label={'Selecciona tu rol'}
        name={'role_id'}
        control={control}
        options={roles.data as IOption[]}
        defaultValue={'Selecciona un rol'}
      />
      <Button
        fullWidth
        variant='primary'
        type='submit'
        disabled={isLoading || disabled}
      >
        {(isLoading || isRolesLoading) && !isRolesError ? (
          <Loader color='primary' />
        ) : (
          'Registrarse'
        )}
      </Button>
    </form>
  );
};

export default AuthFormRegister;
