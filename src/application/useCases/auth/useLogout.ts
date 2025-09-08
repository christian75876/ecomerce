import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { ROUTES } from '@/shared/constants/routes';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigate();

  const handleLogout = async (): Promise<null> => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthRepository.logout();
      navigation(ROUTES.PUBLIC.HOME);
      return null;
    } catch (_err: unknown) {
      setError('Error desconocido');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogout, isLoading, error };
};
