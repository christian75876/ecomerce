import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IRegisterCustomerForm } from '@/application/dtos/auth/register/customer/RegisterCustomerRequest';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { ROUTES } from '@/shared/constants/routes';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

interface UseRegisterCustomerOptions {
  onSuccess?: () => void;
}

export const useRegisterCustomer = (options: UseRegisterCustomerOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegisterCustomer = async ({
    password_confirm: _passwordConfirm,
    ...payload
  }: IRegisterCustomerForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthRepository.registerCustomer(payload);
      SnackbarUtilities.success(response.data.message, 'top', 'center');
      options.onSuccess?.();
      navigate(ROUTES.PUBLIC.LOGIN);
      return response;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible registrar la cuenta',
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleRegisterCustomer,
    isLoading,
    error,
  };
};
