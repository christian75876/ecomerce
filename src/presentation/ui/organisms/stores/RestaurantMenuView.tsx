import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import MenuItemRow from '@/presentation/ui/molecules/products/MenuItemRow';
import ProductQuickViewModal from '@/presentation/ui/molecules/products/ProductQuickViewModal';
import PdfViewerModal from '@molecules/common/PdfViewerModal';

interface RestaurantMenuViewProps {
  products: IProduct[];
  menuCategories: IMenuCategory[];
  menuPdfUrl: string | null;
  primaryColor?: string;
  onAddToCart: (productId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  storeName: string;
}

const RestaurantMenuView = ({
  products,
  menuCategories,
  menuPdfUrl,
  primaryColor,
  onAddToCart,
  search,
  onSearchChange,
  storeName,
}: RestaurantMenuViewProps) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    menuCategories.length > 0 ? menuCategories[0].id : null,
  );
  const [pdfOpen, setPdfOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<IProduct | null>(null);

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
      {/* Search bar */}
      {products.length > 3 || search ? (
        <div className='flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10'>
          <i className='bx bx-search shrink-0 text-lg text-slate-400' aria-hidden='true' />
          <input
            type='search'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Buscar platos en ${storeName}...`}
            className='flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none'
          />
          {search ? (
            <button type='button' onClick={() => onSearchChange('')} className='shrink-0 text-slate-400 hover:text-slate-600'>
              <i className='bx bx-x text-lg' aria-hidden='true' />
            </button>
          ) : null}
        </div>
      ) : null}

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

      {/* Carta — filas de menú, no grilla de e-commerce */}
      {filteredProducts.length === 0 ? (
        <div className='rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center'>
          <p className='text-sm text-slate-500'>Esta sección no tiene platos disponibles aún.</p>
        </div>
      ) : (
        <div className='rounded-3xl border border-slate-100 bg-white px-5 py-2 shadow-card sm:px-7'>
          {filteredProducts.map((product) => (
            <MenuItemRow
              key={product.id}
              id={product.id}
              image={product.imageUrl}
              name={product.name}
              description={product.description}
              price={Number(product.price).toFixed(2)}
              compareAtPrice={product.compareAtPrice}
              availableQuantity={product.availableQuantity}
              showStock={product.showStock}
              hasVariants={product.hasVariants}
              primaryColor={primaryColor}
              onAddToCart={() => onAddToCart(product.id)}
              onQuickView={() => setQuickViewProduct(product)}
            />
          ))}
        </div>
      )}

      {quickViewProduct ? (
        <ProductQuickViewModal
          id={quickViewProduct.id}
          image={quickViewProduct.imageUrl}
          name={quickViewProduct.name}
          description={quickViewProduct.description}
          price={Number(quickViewProduct.price).toFixed(2)}
          compareAtPrice={quickViewProduct.compareAtPrice}
          availableQuantity={quickViewProduct.availableQuantity}
          showStock={quickViewProduct.showStock}
          primaryColor={primaryColor}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={() => {
            if (quickViewProduct.hasVariants) {
              navigate(ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', quickViewProduct.id));
            } else {
              onAddToCart(quickViewProduct.id);
            }
            setQuickViewProduct(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default RestaurantMenuView;
