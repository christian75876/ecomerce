import React from 'react';
import Box from '../../atoms/box/SimpleBox';
import Button from '../../atoms/button/SimpleButton';
import AuthFormLogin from './AuthFormLogin';
import AuthFormRegister from './AuthFormRegister';

import { ILoginRequest } from '@/application/dtos/auth/login/request/LoginRequest';
import { IRegisterForm } from '@/application/dtos/auth/register/register/RegisterRequest';

type CardAuthProps = {
  isRegister: boolean;
  setIsRegister?: (value: boolean) => void;
  onSubmitLogin: (data: ILoginRequest) => void;
  onSubmitRegister: (data: IRegisterForm) => void;
  isLoading: boolean;
};

const CardAuth = ({
  isRegister,
  setIsRegister,
  onSubmitLogin,
  onSubmitRegister,
  isLoading
}: CardAuthProps) => {
  return (
    <Box>
      {isRegister ? (
        <AuthFormRegister onSubmit={onSubmitRegister} isLoading={isLoading} />
      ) : (
        <AuthFormLogin onSubmit={onSubmitLogin} isLoading={isLoading} />
      )}

      <Button
        onClick={() => setIsRegister?.(!isRegister)}
        className="mt-4 w-full"
        variant="ghost"
      >
        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </Button>
    </Box>
  );
};

export default CardAuth;
