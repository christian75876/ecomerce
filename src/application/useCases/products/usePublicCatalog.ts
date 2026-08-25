import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import { userPreferences } from '@/shared/utils/userPreferences';

const PAGE_SIZE = 24;
const SEARCH_TRACK_DEBOUNCE_MS = 600;
const SPONSORED_LIMIT = 4;

export type CatalogSortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
type ResolvedSort = CatalogSortOption | 'random';
type SortConfig = { sortBy: ResolvedSort; seed?: string };

export const usePublicCatalog = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [sponsoredProducts, setSponsoredProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [explicitSort, setExplicitSort] = useState<CatalogSortOption | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const requestIdRef = useRef(0);
  const sortConfigRef = useRef<SortConfig>({ sortBy: 'newest' });

  // Debounced: only persist a search term once the user pauses typing, so we
  // don't pollute the suggestion history with partial keystrokes.
  useEffect(() => {
    if (!search.trim()) return;
    const timer = setTimeout(() => userPreferences.trackSearch(search), SEARCH_TRACK_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    let sortBy: ResolvedSort;
    let seed: string | undefined;
    if (explicitSort) {
      // User picked a sort from the dropdown — honor it literally, server-side.
      sortBy = explicitSort;
    } else {
      // No active search/category and no personalization signal yet → show a
      // fair, seeded-random order instead of "newest first", which would
      // otherwise always favor whichever store registered most recently.
      const noActiveFilter = !search.trim() && !selectedCategoryId;
      const hasSignal = userPreferences.hasPreferences() || userPreferences.hasSearchHistory();
      sortBy = noActiveFilter && !hasSignal ? 'random' : 'newest';
      seed = sortBy === 'random' ? userPreferences.getDailySeed() : undefined;
    }
    sortConfigRef.current = { sortBy, seed };

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      // Fetched independently from the main catalog (not derived from the
      // organic page) so paid placements don't depend on happening to land
      // on whatever page loaded — capped small and rotated fairly, not a
      // flood of every advertiser. A failure here shouldn't break the catalog.
      const loadSponsored = async () => {
        try {
          const res = await ProductRepository.getProducts({
            active: true,
            search: search || undefined,
            categoryId: selectedCategoryId || undefined,
            minPrice: minPrice ?? undefined,
            maxPrice: maxPrice ?? undefined,
            onlyAvailable: onlyAvailable || undefined,
            sponsoredOnly: true,
            sortBy: 'random',
            seed: userPreferences.getDailySeed(),
            page: 1,
            limit: SPONSORED_LIMIT,
          });
          if (requestIdRef.current !== requestId) return;
          setSponsoredProducts(res.data.items);
        } catch {
          if (requestIdRef.current === requestId) setSponsoredProducts([]);
        }
      };
      void loadSponsored();

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          ProductRepository.getProducts({
            active: true,
            search: search || undefined,
            categoryId: selectedCategoryId || undefined,
            sortBy,
            seed,
            minPrice: minPrice ?? undefined,
            maxPrice: maxPrice ?? undefined,
            onlyAvailable: onlyAvailable || undefined,
            page: 1,
            limit: PAGE_SIZE,
          }),
          CategoriesRepository.getCategories(true),
        ]);

        if (requestIdRef.current !== requestId) return;

        const productData = productsResponse.data;
        setProducts(productData.items);
        setPage(productData.pagination.currentPage);
        setTotalPages(productData.pagination.totalPages);
        setCategories(categoriesResponse.data);
      } catch (err) {
        if (requestIdRef.current !== requestId) return;
        setError(
          err instanceof Error
            ? err.message
            : 'No fue posible cargar el catálogo',
        );
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    };

    void loadProducts();
  }, [search, selectedCategoryId, explicitSort, minPrice, maxPrice, onlyAvailable]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    // Snapshot the request id: if a filter/sort/search change resets the
    // catalog while this fetch is in flight, requestIdRef will have moved on
    // by the time we resolve, and we must not append these (now-stale) items
    // onto the freshly-filtered list.
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { sortBy, seed } = sortConfigRef.current;
      const response = await ProductRepository.getProducts({
        active: true,
        search: search || undefined,
        categoryId: selectedCategoryId || undefined,
        sortBy,
        seed,
        minPrice: minPrice ?? undefined,
        maxPrice: maxPrice ?? undefined,
        onlyAvailable: onlyAvailable || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      if (requestIdRef.current !== requestId) return;
      const productData = response.data;
      setProducts((prev) => [...prev, ...productData.items]);
      setPage(productData.pagination.currentPage);
      setTotalPages(productData.pagination.totalPages);
    } catch {
      // Silently ignore: the shopper keeps browsing what already loaded.
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, totalPages, search, selectedCategoryId, minPrice, maxPrice, onlyAvailable]);

  return {
    products,
    sponsoredProducts,
    categories,
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    sortBy: explicitSort ?? 'newest',
    changeSort: setExplicitSort,
    minPrice,
    maxPrice,
    setPriceRange: (min: number | null, max: number | null) => {
      setMinPrice(min);
      setMaxPrice(max);
    },
    onlyAvailable,
    setOnlyAvailable,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  };
};
