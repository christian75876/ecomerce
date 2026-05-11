import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import Box from '@atoms/box/SimpleBox';
import Input from '@atoms/input/SimpleInput';
import Typography from '@atoms/typography/SimpleTypography';

interface FiltersBarProps {
  categories: ICategory[];
  stores: IStore[];
  selectedCategoryId: string;
  selectedStoreId: string;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (value: string) => void;
  onStoreChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const selectClassName =
  'w-full rounded-2xl border border-neutral-gray/70 bg-white px-4 py-3 text-sm text-neutral-dark shadow-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/20';

const FiltersBar = ({
  categories,
  stores,
  selectedCategoryId,
  selectedStoreId,
  minPrice,
  maxPrice,
  onCategoryChange,
  onStoreChange,
  onMinPriceChange,
  onMaxPriceChange,
}: FiltersBarProps) => {
  return (
    <Box className='sticky top-20 z-20 rounded-[1.7rem] border border-neutral-gray/30 bg-white/90 p-4 backdrop-blur shadow-[0_14px_40px_rgba(15,23,42,0.08)]'>
      <Box className='mb-3 flex items-center justify-between gap-3'>
        <Typography variant='h3'>Filtros</Typography>
        <Typography className='text-xs uppercase tracking-[0.2em] text-neutral-dark/45'>
          catálogo
        </Typography>
      </Box>
      <Box className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <select
          value={selectedCategoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={selectClassName}
        >
          <option value=''>Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStoreId}
          onChange={(event) => onStoreChange(event.target.value)}
          className={selectClassName}
        >
          <option value=''>Todas las tiendas</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        <Input
          type='number'
          min='0'
          value={minPrice}
          onChange={(event) => onMinPriceChange(event.target.value)}
          placeholder='Precio mínimo'
          className='bg-white'
        />

        <Input
          type='number'
          min='0'
          value={maxPrice}
          onChange={(event) => onMaxPriceChange(event.target.value)}
          placeholder='Precio máximo'
          className='bg-white'
        />
      </Box>
    </Box>
  );
};

export default FiltersBar;
