import { useCallback, useState } from 'react';
import { IVerifyEmailResp } from '@/application/dtos/auth/verify-email/response/VerifyEmailResponse';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';

export const useVerifyEmail = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const verifyEmail = useCallback(
    async (token: string): Promise<IVerifyEmailResp | null> => {
      setIsLoading(true);
      setError(null);

      try {
        return await AuthRepository.verifyEmail({ token });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Verification failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { verifyEmail, isLoading, error };
};
