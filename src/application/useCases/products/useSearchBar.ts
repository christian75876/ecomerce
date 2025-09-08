import { IProductRequest } from '@/application/dtos/products/request/ProductRequest';
import { IProductResp } from '@/application/dtos/products/response/ProductResponse';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { useState } from 'react';

export const useSearchBar = () => {
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (search: IProductRequest): Promise<IProductResp | null> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(search);
      const response = await ProductRepository.getProduct(search);
      return response;
    } catch (error: unknown) {
      setError('Error desconocido al obtener Productos');
      return null;
    } finally {
      setSearchTerm(search.name);
      setIsLoading(false);
    }
  };

  return { error, handleSearch, isloading, searchTerm };
};
