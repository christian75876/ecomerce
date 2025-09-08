import { IRolesResponse } from '@/application/dtos/users/response/RolesResponse';
import { UsersRepository } from '@/infrastructure/repositories/api/users/UsersRepository';
import { useCallback, useEffect, useState } from 'react';

export const useRoles = (setDisabled: (disabled: boolean) => void) => {
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<IRolesResponse>({
    statusCode: 400,
    message: 'No data available',
    data: [],
    metadata: null
  });

  const handleGetRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await UsersRepository.getRoles();
      setRoles(response);
    } catch (_err: unknown) {
      setError('Error desconocido');
      setDisabled(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetRoles();
  }, []);

  return { roles, isLoading, error };
};
