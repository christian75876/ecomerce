import { useCallback, useEffect, useState } from 'react';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { FavoritesRepository } from '@/infrastructure/repositories/api/products/FavoritesRepository';
import { authSession } from '@/shared/utils/authSession';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = Boolean(authSession.getToken());

  const loadFavoriteIds = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      return;
    }

    try {
      const response = await FavoritesRepository.getFavoriteIds();
      setFavoriteIds(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar favoritos');
    }
  }, [isAuthenticated]);

  const loadFavoriteProducts = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteProducts([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await FavoritesRepository.getFavoriteProducts();
      setFavoriteProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar favoritos');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadFavoriteIds();
  }, [loadFavoriteIds]);

  const toggleFavorite = async (productId: string) => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para guardar favoritos');
      return false;
    }

    setError(null);
    try {
      if (favoriteIds.includes(productId)) {
        await FavoritesRepository.unfavoriteProduct(productId);
        setFavoriteIds((current) => current.filter((id) => id !== productId));
        setFavoriteProducts((current) =>
          current.filter((product) => product.id !== productId),
        );
      } else {
        await FavoritesRepository.favoriteProduct(productId);
        setFavoriteIds((current) => [...current, productId]);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar favoritos');
      return false;
    }
  };

  return {
    favoriteIds,
    favoriteProducts,
    loading,
    error,
    isAuthenticated,
    loadFavoriteProducts,
    loadFavoriteIds,
    toggleFavorite,
  };
};
