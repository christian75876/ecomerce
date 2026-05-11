import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import HomeSection from './HomeSection';

interface HomeFeaturedCategoriesProps {
  categories: ICategory[];
  onSelectCategory: (categoryId: string) => void;
}

const HomeFeaturedCategories = ({
  categories,
  onSelectCategory,
}: HomeFeaturedCategoriesProps) => {
  return (
    <HomeSection title='Categorías destacadas'>
      <Box className='flex flex-wrap gap-3'>
        {categories.map((category) => (
          <button
            key={category.id}
            type='button'
            onClick={() => onSelectCategory(category.id)}
            className='rounded-full bg-background px-4 py-2 text-sm font-medium text-neutral-dark transition hover:bg-primary hover:text-white'
          >
            {category.name}
          </button>
        ))}
      </Box>
    </HomeSection>
  );
};

export default HomeFeaturedCategories;
