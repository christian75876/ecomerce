import { FaceRepository } from '@/infrastructure/repositories/api/face/FaceRepository';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';
import { useState } from 'react';

export const useFaceEnrollment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const enrollById = async (userId: number, descriptors: number[][]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await FaceRepository.enrollById({ userId, descriptors });
      SnackbarUtilities.success('Face enrolled successfully', 'top', 'center');
      return res;
    } catch (error) {
      console.log(error);
      setError('No se pudo registrar el rostro');
      SnackbarUtilities.error(
        'No se pudo registrar el rostro',
        'top',
        'center'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };
  return {
    enrollById,
    loading,
    error
  };
};
