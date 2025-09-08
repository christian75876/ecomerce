import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';

import { ILoginRequest } from '@/application/dtos/auth/login/request/LoginRequest';
import { ILoginResp } from '@/application/dtos/auth/login/response/LoginResponse';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';

export const useLogin = () => {
  const [isloading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigate();

  const handleLogin = async (
    credentials: ILoginRequest
  ): Promise<ILoginResp | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthRepository.login(credentials);
      navigation(ROUTES.PRIVATE.DASHBOARD);
      localStorage.setItem('token', response.data.token);
      return response;
    } catch (_err: unknown) {
      setError('Error desconocido');
      return null;
    } finally {
      // navigation(ROUTES.PRIVATE.DASHBOARD)
      setIsLoading(false);
    }
  };

  return { handleLogin, isloading, error };
};
