import { useFormValidation } from '@shared/hooks/useFormValidation';
import { loginSchema } from '@domain/validations/auth/LoginValidation';
import Box from '@atoms/box/SimpleBox';
import Link from '@atoms/link/Simplelink';
import Button from '@atoms/button/SimpleButton';
import FormField from '@molecules/forms/FormField';
import { ILoginRequest } from '@/application/dtos/auth/login/request/LoginRequest';
import Loader from '../../atoms/loader/SimpleLoader';

interface AuthFormLoginProps {
  onSubmit: (data: ILoginRequest) => void;
  isLoading?: boolean;
}

const AuthFormLogin = ({ onSubmit, isLoading = false }: AuthFormLoginProps) => {
  const { control, handleSubmit, formState: { isValid } } = useFormValidation(loginSchema, isLoading, {
    email: '',
    password: ''
  }, 
);

  
 

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
      <Box className='flex justify-end items-center text-md my-4'>
        <Link to='#' className='text-primary underline'>
          Recuperar contraseña
        </Link>
      </Box>
      <Button fullWidth variant='primary' type='submit' disabled={!isValid || isLoading}>
        {isLoading ? <Loader color='primary' /> : 'Ingresar'}
      </Button>
    </form>
  );
};

export default AuthFormLogin;
