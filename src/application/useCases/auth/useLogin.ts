import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';

import { ILoginRequest } from '@/application/dtos/auth/login/request/LoginRequest';
import { ILoginResp } from '@/application/dtos/auth/login/response/LoginResponse';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { authSession } from '@/shared/utils/authSession';

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
      authSession.setToken(response.data.token);
      authSession.setUser(response.data.user);
      navigation(
        response.data.user.role === 'buyer'
          ? ROUTES.PUBLIC.HOME
          : ROUTES.PRIVATE.DASHBOARD,
      );
      return response;
    } catch (_err: unknown) {
      const message =
        _err instanceof Error ? _err.message : 'No fue posible iniciar sesión';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isloading, error };
};
