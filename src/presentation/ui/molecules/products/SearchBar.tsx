import FormField from '../forms/FormField';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { searchBar } from '@/domain/validations/products/SearchBar';
import { IProductRequest } from '@/application/dtos/products/request/ProductRequest';
import Icon from '../../atoms/icon/SimpleIcon';

interface SearchBarProps {
  onSubmit: (data: IProductRequest) => void;
  isLoading?: boolean;
}

const SearchBar = ({ onSubmit, isLoading = false }: SearchBarProps) => {
  const { control, handleSubmit } = useFormValidation(searchBar, {
    search: ''
  });

  const handleFormSubmit = (data: { search: string }) => {
    const requestData: IProductRequest = {
      name: data.search
    };

    onSubmit(requestData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4 justify-center items-center m-auto '>
      <div className='relative  border-gray-300 border-2 w-full flex justify-start items-center gap-2 px-4 h-10  rounded-lg'>
        <Icon
          name='bx-search'
          size={20}
        />
        <FormField
          name='search'
          label='search'
          control={control}
          type='text'
          placeholder='Buscar producto'
          boxClassName='flex justify-center items-center first:!mb-0 !w-full' 
          inputClassName='!outline-none !border-none focus:!outline-none  focus:ring-transparent !px-0 !py-0'
        />
        {isLoading && <div>Cargando...</div>}
      </div>
    </form>
  );
};

export default SearchBar;
