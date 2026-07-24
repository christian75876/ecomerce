import { useState } from 'react';
import { IRegisterCustomerForm } from '@/application/dtos/auth/register/customer/RegisterCustomerRequest';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { authSession } from '@/shared/utils/authSession';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

export const useRegisterCustomer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleRegisterCustomer = async ({
    password_confirm: _passwordConfirm,
    ...payload
  }: IRegisterCustomerForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthRepository.registerCustomer(payload);
      const data = response.data;

      if (data.token && data.user) {
        // Invited seller — auto-login
        authSession.setToken(data.token);
        authSession.setUser(data.user);
        SnackbarUtilities.success(data.message, 'top', 'center');
        return { autoLogin: true };
      }

      // Regular buyer — email verification required
      setRegisteredEmail(payload.email);
      return { autoLogin: false, message: data.message };
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
    registeredEmail,
  };
};
