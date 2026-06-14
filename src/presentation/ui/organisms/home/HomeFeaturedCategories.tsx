import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import HomeSection from './HomeSection';

interface HomeFeaturedCategoriesProps {
  categories: ICategory[];
  onSelectCategory: (categoryId: string) => void;
}

const CAT_COLORS = [
  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100',   hover: 'hover:bg-blue-100' },
  { bg: 'bg-violet-50', text: 'text-violet-700',  border: 'border-violet-100', hover: 'hover:bg-violet-100' },
  { bg: 'bg-emerald-50',text: 'text-emerald-700', border: 'border-emerald-100',hover: 'hover:bg-emerald-100' },
  { bg: 'bg-rose-50',   text: 'text-rose-700',    border: 'border-rose-100',   hover: 'hover:bg-rose-100' },
  { bg: 'bg-amber-50',  text: 'text-amber-700',   border: 'border-amber-100',  hover: 'hover:bg-amber-100' },
  { bg: 'bg-sky-50',    text: 'text-sky-700',     border: 'border-sky-100',    hover: 'hover:bg-sky-100' },
];

const HomeFeaturedCategories = ({
  categories,
  onSelectCategory,
}: HomeFeaturedCategoriesProps) => {
  if (categories.length === 0) return null;

  return (
    <HomeSection title='Explorar por categoría'>
      <div className='flex flex-wrap gap-2.5'>
        {categories.map((category, idx) => {
          const c = CAT_COLORS[idx % CAT_COLORS.length];
          return (
            <button
              key={category.id}
              type='button'
              onClick={() => onSelectCategory(category.id)}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95 ${c.bg} ${c.text} ${c.border} ${c.hover}`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </HomeSection>
  );
};

export default HomeFeaturedCategories;
