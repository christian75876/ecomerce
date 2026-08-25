import { useCallback, useEffect, useState } from 'react';
import { ISale, ISalesHistoryResponse } from '@/application/dtos/sales/response/SaleResponse';
import { ISalesHistoryParams } from '@/application/dtos/sales/request/SaleRequest';
import { SalesRepository } from '@/infrastructure/repositories/api/sales/SalesRepository';
import { PosGuestInfo } from '@/application/useCases/pos/usePosManagement';

export interface ISalesHistoryFilters {
  search: string;
  paymentMethod: '' | 'CASH' | 'CREDIT';
  deliveryType: '' | 'LOCAL' | 'SHIPPING' | 'NONE';
  from: string;
  to: string;
}

const INITIAL_FILTERS: ISalesHistoryFilters = {
  search: '',
  paymentMethod: '',
  deliveryType: '',
  from: '',
  to: '',
};

export function saleToGuestInfo(sale: ISale): PosGuestInfo | undefined {
  if (!sale.guestName && !sale.guestPhone && !sale.guestDoc) return undefined;
  return {
    name: sale.guestName ?? '',
    phone: sale.guestPhone ?? '',
    docType: sale.guestDocType ?? 'CC',
    doc: sale.guestDoc ?? '',
    deliveryType: (sale.deliveryType ?? '') as PosGuestInfo['deliveryType'],
    deliveryAddress: sale.deliveryAddress ?? '',
    deliveryCity: sale.deliveryCity ?? '',
    deliveryNotes: sale.deliveryNotes ?? '',
  };
}

export const useSalesHistory = () => {
  const [filters, setFilters] = useState<ISalesHistoryFilters>(INITIAL_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ISalesHistoryResponse | null>(null);
  const [selectedSale, setSelectedSale] = useState<ISale | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printSale, setPrintSale] = useState<ISale | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  // Reset to page 1 whenever any filter (except raw search) changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.paymentMethod, filters.deliveryType, filters.from, filters.to]);

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ISalesHistoryParams = {
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        paymentMethod: (filters.paymentMethod as ISalesHistoryParams['paymentMethod']) || undefined,
        deliveryType: (filters.deliveryType as ISalesHistoryParams['deliveryType']) || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      };
      const res = await SalesRepository.getSalesHistory(params);
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters.paymentMethod, filters.deliveryType, filters.from, filters.to]);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const selectSale = async (sale: ISale) => {
    setSelectedSale(sale);
    // Fetch full detail if items weren't loaded
    if (!sale.items?.length) {
      setDetailLoading(true);
      try {
        const res = await SalesRepository.getSaleById(sale.id);
        setSelectedSale(res.data);
      } catch {
        // keep the partial data already set
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const updateFilter = <K extends keyof ISalesHistoryFilters>(
    key: K,
    value: ISalesHistoryFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    result,
    selectedSale,
    loading,
    detailLoading,
    error,
    filters,
    page,
    printSale,
    updateFilter,
    resetFilters: () => { setFilters(INITIAL_FILTERS); setPage(1); },
    setPage,
    selectSale,
    closeSale: () => setSelectedSale(null),
    openPrint: (sale: ISale) => setPrintSale(sale),
    closePrint: () => setPrintSale(null),
  };
};
