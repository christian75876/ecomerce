import {
  IRegisterForm,
  IRegisterRequest
} from '@/application/dtos/auth/register/register/RegisterRequest';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { ROUTES } from '@/shared/constants/routes';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const [isloading, setIsloading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const navigation = useNavigate();

  const handleRegister = async ({
    password_confirm,
    ...registerData
  }: IRegisterForm) => {
    setError(null);
    setIsloading(true);
    try {
      const response = await AuthRepository.register(
        registerData as IRegisterRequest
      );
      navigation(ROUTES.PUBLIC.LOGIN);
      SnackbarUtilities.success(response.message, 'top', 'center');
      return response;
    } catch (_err: unknown) {
      setError('Error desconocido');
      return null;
    } finally {
      setIsloading(false);
    }
  };

  return { handleRegister, isloading, error };
};
