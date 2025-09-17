import { useState } from 'react';
import { FaceRepository } from '@/infrastructure/repositories/api/face/FaceRepository';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

export const useFaceLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginByFace = async (descriptor: number[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await FaceRepository.identify({ descriptor });
      if (!result.match || !result.user) {
        SnackbarUtilities.error(
          'No te reconocimos. Intenta de nuevo.',
          'top',
          'center'
        );
        return null;
      }
      return result.user;
    } catch (e) {
      setError('Fallo en login facial');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loginByFace, loading, error };
};
