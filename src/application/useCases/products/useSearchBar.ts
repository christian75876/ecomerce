import { IProductsQuery } from '@/application/dtos/products/request/ProductRequest';
import { IProductsResp } from '@/application/dtos/products/response/ProductResponse';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { useState } from 'react';

export const useSearchBar = () => {
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (
    search: IProductsQuery,
  ): Promise<IProductsResp | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ProductRepository.getProducts(search);
      return response;
    } catch (error: unknown) {
      setError('Error desconocido al obtener Productos');
      return null;
    } finally {
      setSearchTerm(search.search || '');
      setIsLoading(false);
    }
  };

  return { error, handleSearch, isloading, searchTerm };
};
