import { useCallback, useEffect, useRef, useState } from 'react';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { MenuCategoriesRepository } from '@/infrastructure/repositories/api/menu-categories/MenuCategoriesRepository';

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 400;

export type StoreSortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

type ProductsPage = {
  items?: IProduct[];
  pagination?: { currentPage: number; totalPages: number; totalItems: number };
};

export const usePublicStoreDetail = (slug?: string) => {
  const [store, setStore] = useState<IStore | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [menuCategories, setMenuCategories] = useState<IMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState<StoreSortOption>('newest');
  const [search, setSearchState] = useState('');
  const storeIdRef = useRef<string | null>(null);
  const appliedSearchRef = useRef('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every page-1 reset (store load, sort change, search) so a
  // slower in-flight loadMore can detect it's been superseded and avoid
  // appending stale (differently-filtered) items onto the fresh list.
  const requestIdRef = useRef(0);

  const fetchProducts = useCallback(
    async (storeId: string, pageNum: number, sort: StoreSortOption, searchTerm: string) => {
      const response = await ProductRepository.getProducts({
        active: true,
        onlyAvailable: true,
        storeId,
        page: pageNum,
        limit: PAGE_SIZE,
        sortBy: sort,
        search: searchTerm || undefined,
      });
      return response.data as unknown as ProductsPage;
    },
    [],
  );

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const loadStore = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const storeResponse = await StoresRepository.getStoreBySlug(slug);
        const storeData = storeResponse.data;
        setStore(storeData);
        storeIdRef.current = storeData.id;
        appliedSearchRef.current = '';

        const [productData, categoriesResponse] = await Promise.all([
          fetchProducts(storeData.id, 1, 'newest', ''),
          storeData.storeType === 'RESTAURANT'
            ? MenuCategoriesRepository.getByStore(storeData.id)
            : Promise.resolve(null),
        ]);

        if (requestIdRef.current !== requestId) return;

        setProducts(productData.items ?? []);
        setPage(productData.pagination?.currentPage ?? 1);
        setTotalPages(productData.pagination?.totalPages ?? 1);
        setTotalItems(productData.pagination?.totalItems ?? 0);
        setSortBy('newest');
        setSearchState('');
        setMenuCategories(categoriesResponse?.data ?? []);
      } catch (err) {
        if (requestIdRef.current !== requestId) return;
        setError(
          err instanceof Error ? err.message : 'No fue posible cargar la tienda',
        );
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    };

    void loadStore();
  }, [slug, fetchProducts]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(async () => {
    if (loadingMore || filtersLoading || !hasMore || !storeIdRef.current) return;

    const requestId = requestIdRef.current;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const productData = await fetchProducts(storeIdRef.current, nextPage, sortBy, appliedSearchRef.current);
      if (requestIdRef.current !== requestId) return;
      setProducts((prev) => [...prev, ...(productData.items ?? [])]);
      setPage(productData.pagination?.currentPage ?? nextPage);
      setTotalPages(productData.pagination?.totalPages ?? totalPages);
      setTotalItems(productData.pagination?.totalItems ?? totalItems);
    } catch {
      // Silently ignore: the shopper keeps browsing what already loaded.
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, filtersLoading, hasMore, page, totalPages, sortBy, fetchProducts]);

  const changeSort = useCallback(
    async (nextSort: StoreSortOption) => {
      if (!storeIdRef.current || nextSort === sortBy) return;

      const requestId = ++requestIdRef.current;
      setFiltersLoading(true);
      setError(null);
      try {
        const productData = await fetchProducts(storeIdRef.current, 1, nextSort, appliedSearchRef.current);
        if (requestIdRef.current !== requestId) return;
        setProducts(productData.items ?? []);
        setPage(productData.pagination?.currentPage ?? 1);
        setTotalPages(productData.pagination?.totalPages ?? 1);
        setTotalItems(productData.pagination?.totalItems ?? 0);
        setSortBy(nextSort);
      } catch (err) {
        if (requestIdRef.current !== requestId) return;
        setError(
          err instanceof Error ? err.message : 'No fue posible ordenar los productos',
        );
      } finally {
        if (requestIdRef.current === requestId) setFiltersLoading(false);
      }
    },
    [sortBy, fetchProducts],
  );

  const applySearch = useCallback(
    async (term: string) => {
      if (!storeIdRef.current) return;

      const requestId = ++requestIdRef.current;
      setFiltersLoading(true);
      setError(null);
      try {
        const productData = await fetchProducts(storeIdRef.current, 1, sortBy, term);
        if (requestIdRef.current !== requestId) return;
        appliedSearchRef.current = term;
        setProducts(productData.items ?? []);
        setPage(productData.pagination?.currentPage ?? 1);
        setTotalPages(productData.pagination?.totalPages ?? 1);
        setTotalItems(productData.pagination?.totalItems ?? 0);
      } catch (err) {
        if (requestIdRef.current !== requestId) return;
        setError(
          err instanceof Error ? err.message : 'No fue posible buscar productos',
        );
      } finally {
        if (requestIdRef.current === requestId) setFiltersLoading(false);
      }
    },
    [sortBy, fetchProducts],
  );

  const setSearch = useCallback(
    (term: string) => {
      setSearchState(term);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        void applySearch(term.trim());
      }, SEARCH_DEBOUNCE_MS);
    },
    [applySearch],
  );

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  return {
    store,
    products,
    menuCategories,
    loading,
    loadingMore,
    sortLoading: filtersLoading,
    hasMore,
    loadMore,
    sortBy,
    changeSort,
    search,
    setSearch,
    totalItems,
    error,
  };
};
