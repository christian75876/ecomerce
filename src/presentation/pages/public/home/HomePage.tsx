import { IProductRequest } from '@/application/dtos/products/request/ProductRequest';
import { useSearchBar } from '@/application/useCases/products/useSearchBar';
import ProductHeader from '@/presentation/ui/molecules/products/ProductHeader';
import SearchBar from '@/presentation/ui/molecules/products/SearchBar';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';

export const HomePage = () => {
  const { isloading, handleSearch } = useSearchBar();

  const onSubmit = (data: IProductRequest) => {
    handleSearch(data);
  };
  return (
    <>
      <ProductHeader title='Bienvenido usuario no loggeado. Busca cualquier producto' />
      <SearchBar onSubmit={onSubmit} isLoading={isloading} />
      <ProductBody />
    </>
  );
};
