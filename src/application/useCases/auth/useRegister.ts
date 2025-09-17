import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IRegisterForm,
  IRegisterRequest
} from '@/application/dtos/auth/register/register/RegisterRequest';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import { ROUTES } from '@/shared/constants/routes';

const ONE_STEP_REGISTER = true;

export const useRegister = () => {
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const navigation = useNavigate();

  const handleRegister = async (
    form: IRegisterForm,
    descriptors: number[][]
  ) => {
    setError(null);
    setIsloading(true);
    try {
      const { password_confirm, ...rest } = form;

      if (ONE_STEP_REGISTER) {
        // ✅ 1 solo request
        const payload: IRegisterRequest = { ...rest, descriptors };
        const res = await AuthRepository.register(payload);
        SnackbarUtilities.success(res.message, 'top', 'center');
        navigation(ROUTES.PUBLIC.LOGIN);
        return res;
      }
    } catch {
      setError('Error desconocido');
      return null;
    } finally {
      setIsloading(false);
    }
  };

  return { handleRegister, isloadingRegister: isloading, error };
};
