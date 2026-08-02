import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { ROUTES } from '@/shared/constants/routes';
import { authSession } from '@/shared/utils/authSession';
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
    } catch {
      // Token may already be expired — always clear session locally
    } finally {
      authSession.clear();
      navigation(ROUTES.PUBLIC.HOME);
      setIsLoading(false);
    }
    return null;
  };

  return { handleLogout, isLoading, error };
};
