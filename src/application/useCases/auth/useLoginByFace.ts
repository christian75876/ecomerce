import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '@/infrastructure/repositories/api/auth/AuthRepository';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

export const useLoginByFace = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginByFace = async (descriptor: number[], threshold = 0.55) => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthRepository.loginByFace({ descriptor, threshold });
      localStorage.setItem('token', res.token);
      SnackbarUtilities.success(res.message || '¡Bienvenido!', 'top', 'center');
      navigate('/'); // ajusta a tu ruta privada
      return res;
    } catch (e) {
      setError('No pudimos iniciar sesión con tu rostro.');
      SnackbarUtilities.error(
        'Rostro no reconocido o baja confianza',
        'top',
        'center'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { handleLoginByFace, loading, error };
};
