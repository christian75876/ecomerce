import { useCallback, useEffect, useRef, useState } from 'react';
import { ICategoryCollection } from '@/application/dtos/categories/response/CategoryResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';

const PAGE_SIZE = 24;

/** Índice /categorias (también alimenta los enlaces de la home y de "Otras categorías"). */
export const usePublicCategories = () => {
  const [collections, setCollections] = useState<ICategoryCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    CategoriesRepository.getCollections()
      .then((res) => {
        if (!cancelled) setCollections(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No fue posible cargar las categorías');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { collections, loading, error };
};

/**
 * Página /categorias/:slug. Lista todos los productos activos (también los
 * agotados), igual que el HTML para bots: si la versión para buscadores
 * mostrara productos que el usuario no ve, sería contenido distinto.
 */
export const usePublicCategory = (slug?: string) => {
  const [collection, setCollection] = useState<ICategoryCollection | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Bumped on every slug change so a slower in-flight loadMore can detect it's
  // been superseded and avoid appending another category's items.
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!slug) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setCollection(null);
    setProducts([]);

    Promise.all([
      CategoriesRepository.getCollection(slug),
      ProductRepository.getProducts({ active: true, categorySlug: slug, sortBy: 'newest', page: 1, limit: PAGE_SIZE }),
    ])
      .then(([collectionRes, productsRes]) => {
        if (requestIdRef.current !== requestId) return;
        setCollection(collectionRes.data);
        setProducts(productsRes.data.items);
        setPage(productsRes.data.pagination.currentPage);
        setTotalPages(productsRes.data.pagination.totalPages);
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId) return;
        setError(err instanceof Error ? err.message : 'No fue posible cargar la categoría');
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setLoading(false);
      });
  }, [slug]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(async () => {
    if (!slug || loadingMore || !hasMore) return;
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    try {
      const res = await ProductRepository.getProducts({
        active: true,
        categorySlug: slug,
        sortBy: 'newest',
        page: page + 1,
        limit: PAGE_SIZE,
      });
      if (requestIdRef.current !== requestId) return;
      setProducts((prev) => [...prev, ...res.data.items]);
      setPage(res.data.pagination.currentPage);
      setTotalPages(res.data.pagination.totalPages);
    } catch {
      // Silently ignore: the shopper keeps browsing what already loaded.
    } finally {
      setLoadingMore(false);
    }
  }, [slug, loadingMore, hasMore, page]);

  return { collection, products, loading, loadingMore, hasMore, loadMore, error };
};
