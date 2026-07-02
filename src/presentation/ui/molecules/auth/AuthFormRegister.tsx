import { IRegisterForm } from '@/application/dtos/auth/register/register/RegisterRequest';
import { registerSchema } from '@/domain/validations/auth/RegisterValidation';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import FormField from '../forms/FormField';
import Button from '../../atoms/button/SimpleButton';
import Loader from '../../atoms/loader/SimpleLoader';
import { useRoles } from '@/application/useCases/users/useRoles';
import { useEffect, useMemo, useState } from 'react';
import Box from '../../atoms/box/SimpleBox';

interface RegisterFormProps {
  onSubmit: (data: IRegisterForm) => void;
  isLoading?: boolean;
}

const AuthFormRegister = ({
  onSubmit,
  isLoading = false
}: RegisterFormProps) => {
  const [disabled, setDisabled] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useFormValidation(
    registerSchema({ isAdmin: false }),
    false,
    {
      email: '',
      password: '',
      password_confirm: '',
      role_id: ''
    }
  );

  const {
    roles,
    isLoading: isRolesLoading,
    error: isRolesError
  } = useRoles(setDisabled);

  const sellerRole = useMemo(
    () => roles.data.find((role) => role.name === 'seller') ?? null,
    [roles.data],
  );

  useEffect(() => {
    if (sellerRole?.id) {
      setValue('role_id', sellerRole.id, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [sellerRole, setValue]);

  const isSubmitDisabled =
    isLoading ||
    Boolean(isRolesLoading) ||
    !isValid ||
    disabled ||
    !sellerRole;


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
      {isRolesError ? (
        <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
          No fue posible resolver el rol interno de vendedor.
        </Box>
      ) : null}
      <Button
        fullWidth
        variant='primary'
        type='submit'
        disabled={isSubmitDisabled}
      >
        {(isLoading || isRolesLoading || !sellerRole) && !isRolesError ? (
          <Loader color='primary' />
        ) : (
          'Registrarse'
        )}
      </Button>
    </form>
  );
};

export default AuthFormRegister;
