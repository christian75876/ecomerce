import { Link } from 'react-router-dom';
import { ICategoryCollection } from '@/application/dtos/categories/response/CategoryResponse';
import { ROUTES } from '@/shared/constants/routes';
import HomeSection from './HomeSection';

interface HomeFeaturedCategoriesProps {
  categories: ICategoryCollection[];
  title?: string;
  subtitle?: string;
  /** Muestra el enlace "Ver todas" hacia /categorias. */
  showAllLink?: boolean;
}

const CAT_COLORS = [
  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100',   hover: 'hover:bg-blue-100' },
  { bg: 'bg-violet-50', text: 'text-violet-700',  border: 'border-violet-100', hover: 'hover:bg-violet-100' },
  { bg: 'bg-emerald-50',text: 'text-emerald-700', border: 'border-emerald-100',hover: 'hover:bg-emerald-100' },
  { bg: 'bg-rose-50',   text: 'text-rose-700',    border: 'border-rose-100',   hover: 'hover:bg-rose-100' },
  { bg: 'bg-amber-50',  text: 'text-amber-700',   border: 'border-amber-100',  hover: 'hover:bg-amber-100' },
  { bg: 'bg-sky-50',    text: 'text-sky-700',     border: 'border-sky-100',    hover: 'hover:bg-sky-100' },
];

// Enlaces reales (<a href>), no botones: Google solo descubre las páginas de
// categoría siguiendo enlaces rastreables.
const HomeFeaturedCategories = ({
  categories,
  title = 'Explorar por categoría',
  subtitle,
  showAllLink = false,
}: HomeFeaturedCategoriesProps) => {
  if (categories.length === 0) return null;

  return (
    <HomeSection
      title={title}
      subtitle={subtitle}
      action={
        showAllLink ? (
          <Link to={ROUTES.PUBLIC.CATEGORIES} className='text-sm font-semibold text-primary hover:underline'>
            Ver todas
          </Link>
        ) : undefined
      }
    >
      <div className='flex flex-wrap gap-2.5'>
        {categories.map((category, idx) => {
          const c = CAT_COLORS[idx % CAT_COLORS.length];
          return (
            <Link
              key={category.slug}
              to={ROUTES.PUBLIC.CATEGORY_DETAILS.replace(':slug', category.slug)}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95 ${c.bg} ${c.text} ${c.border} ${c.hover}`}
            >
              {category.name}
              <span className='ml-1.5 font-medium opacity-60'>{category.productCount}</span>
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
};

export default HomeFeaturedCategories;
