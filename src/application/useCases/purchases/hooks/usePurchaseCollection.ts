import { useState } from 'react';
import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import { PurchasesRepository } from '@/infrastructure/repositories/api/purchases/PurchasesRepository';
import { emptyPurchaseFilters } from '../helpers/purchaseInitialState';
import { PurchaseListFilters } from '../purchase.types';

export const usePurchaseCollection = (itemsPerPage = 10) => {
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PurchaseListFilters>(emptyPurchaseFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadPurchases = async (
    page = currentPage,
    activeFilters = filters,
    preserveLoadingState = false,
  ) => {
    if (!preserveLoadingState) {
      setLoading(true);
    }

    setError(null);

    try {
      const purchasesResponse = await PurchasesRepository.getPurchases({
        page,
        limit: itemsPerPage,
        search: activeFilters.search.trim() || undefined,
        supplierId: activeFilters.supplierId || undefined,
        dateFrom: activeFilters.dateFrom || undefined,
        dateTo: activeFilters.dateTo || undefined,
      });

      setPurchases(purchasesResponse.data.items);
      setCurrentPage(purchasesResponse.data.pagination.currentPage);
      setTotalPages(purchasesResponse.data.pagination.totalPages);
      setTotalItems(purchasesResponse.data.pagination.totalItems);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar compras',
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key: keyof PurchaseListFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = async () => {
    await loadPurchases(1, filters);
  };

  const clearFilters = async () => {
    setFilters(emptyPurchaseFilters);
    await loadPurchases(1, emptyPurchaseFilters);
  };

  const changePage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    await loadPurchases(page, filters);
  };

  const replacePurchase = (nextPurchase: IPurchase) => {
    setPurchases((current) =>
      current.map((purchase) =>
        purchase.id === nextPurchase.id ? nextPurchase : purchase,
      ),
    );
  };

  return {
    purchases,
    loading,
    error,
    filters,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    loadPurchases,
    updateFilters,
    applyFilters,
    clearFilters,
    changePage,
    replacePurchase,
    setError,
  };
};
