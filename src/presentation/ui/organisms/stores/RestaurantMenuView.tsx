import { useState } from 'react';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import ProductBody from '@/presentation/ui/organisms/products/ProductBody';
import PdfViewerModal from '@molecules/common/PdfViewerModal';

interface RestaurantMenuViewProps {
  products: IProduct[];
  menuCategories: IMenuCategory[];
  menuPdfUrl: string | null;
  layoutStyle: 'GRID' | 'LIST';
  buttonStyle: 'ROUNDED' | 'SHARP' | 'PILL';
  primaryColor?: string;
  onAddToCart: (productId: string) => void;
}

const RestaurantMenuView = ({
  products,
  menuCategories,
  menuPdfUrl,
  layoutStyle,
  buttonStyle,
  primaryColor,
  onAddToCart,
}: RestaurantMenuViewProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    menuCategories.length > 0 ? menuCategories[0].id : null,
  );
  const [pdfOpen, setPdfOpen] = useState(false);

  const sorted = [...menuCategories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const categorized = sorted.map((cat) => ({
    ...cat,
    items: products.filter((p) => p.menuCategoryId === cat.id),
  }));

  const uncategorized = products.filter((p) => !p.menuCategoryId);

  const hasCategories = sorted.length > 0;
  const primaryHex = primaryColor || '#6366f1';

  const filteredProducts = (() => {
    if (!hasCategories) return products;
    if (activeCategory === '__otros') return uncategorized;
    return categorized.find((c) => c.id === activeCategory)?.items ?? [];
  })();

  return (
    <div className='space-y-4'>
      {/* PDF button */}
      {menuPdfUrl ? (
        <>
          <button
            type='button'
            onClick={() => setPdfOpen(true)}
            className='flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary'
          >
            <i className='bx bxs-file-pdf text-xl text-red-500' aria-hidden='true' />
            Ver carta completa en PDF
            <i className='bx bx-expand ml-auto text-slate-400' aria-hidden='true' />
          </button>
          {pdfOpen ? (
            <PdfViewerModal url={menuPdfUrl} onClose={() => setPdfOpen(false)} />
          ) : null}
        </>
      ) : null}

      {/* Category tabs */}
      {hasCategories ? (
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
          {categorized.map((cat) => (
            <button
              key={cat.id}
              type='button'
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/30'
              }`}
              style={activeCategory === cat.id ? { backgroundColor: primaryHex } : undefined}
            >
              {cat.name}
              {cat.items.length > 0 ? (
                <span className={`ml-1.5 text-xs ${activeCategory === cat.id ? 'opacity-75' : 'text-slate-400'}`}>
                  ({cat.items.length})
                </span>
              ) : null}
            </button>
          ))}
          {uncategorized.length > 0 ? (
            <button
              type='button'
              onClick={() => setActiveCategory('__otros')}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeCategory === '__otros'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/30'
              }`}
              style={activeCategory === '__otros' ? { backgroundColor: primaryHex } : undefined}
            >
              Otros ({uncategorized.length})
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Products */}
      <ProductBody
        products={filteredProducts}
        layoutStyle={layoutStyle}
        buttonStyle={buttonStyle}
        primaryColor={primaryColor}
        emptyMessage='Esta sección no tiene platos disponibles aún.'
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default RestaurantMenuView;
