import { IRegisterForm } from '@/application/dtos/auth/register/register/RegisterRequest';
import { registerSchema } from '@/domain/validations/auth/RegisterValidation';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import FormField from '../forms/FormField';
import Button from '../../atoms/button/SimpleButton';
import Loader from '../../atoms/loader/SimpleLoader';
import { DropDownMenuForm, IOption } from '../common/DropDownMenuForm';
import { useRoles } from '@/application/useCases/users/useRoles';
import { useState } from 'react';
import FaceEnrollWithMesh from '../common/FaceEnrollWithMesh';

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
    formState: { isValid }
  } = useFormValidation(registerSchema({ isAdmin: false }), false, {
    email: '',
    password: '',
    password_confirm: '',
    role_id: '1'
  });

  const {
    roles,
    isLoading: isRolesLoading,
    error: isRolesError
  } = useRoles(setDisabled);

  const isSubmitDisabled = isLoading || isRolesLoading || !isValid;

  const [isFaceEnroll, setIsFaceEnroll] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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
        label='Selecciona tu rol'
        name='role_id'
        control={control}
        options={roles.data as IOption[]}
        defaultValue='Selecciona un rol'
      />

      <Button
        fullWidth
        variant='primary'
        type='submit'
        disabled={isSubmitDisabled}
      >
        {(isLoading || isRolesLoading) && !isRolesError ? (
          <Loader color='primary' />
        ) : (
          'Registrarse'
        )}
      </Button>

      {/* Sección de registro facial */}
      <div className='pt-2 border-t'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-medium'>Registro facial (opcional)</h3>
          <Button
            type='button'
            variant={isFaceEnroll ? 'secondary' : 'primary'}
            onClick={() => setIsFaceEnroll(v => !v)}
          >
            {isFaceEnroll ? 'Ocultar' : 'Registrar rostro'}
          </Button>
        </div>

        {isFaceEnroll && (
          <FaceEnrollWithMesh
            open={isFaceEnroll}
            onClose={() => setIsFaceEnroll(false)}
            userId='user_demo_1'
          />
        )}
      </div>
    </form>
  );
};

export default AuthFormRegister;
