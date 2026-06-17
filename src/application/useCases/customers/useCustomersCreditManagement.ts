import { useCallback, useEffect, useState } from 'react';
import {
  ICustomer,
  ICustomerLedgerEntry,
  ICustomersSummary,
} from '@/application/dtos/customers/response/CustomerResponse';
import { IUpdateCustomerRequest } from '@/application/dtos/customers/request/CustomerRequest';
import { CustomersRepository } from '@/infrastructure/repositories/api/customers/CustomersRepository';

const ITEMS_PER_PAGE = 5;

const emptySummary: ICustomersSummary = {
  totalCustomers: 0,
  creditEnabledCount: 0,
  customersWithDebtCount: 0,
  totalPortfolio: 0,
};

export const useCustomersCreditManagement = (filterStoreId?: string | null) => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [ledger, setLedger] = useState<ICustomerLedgerEntry[]>([]);
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState<ICustomersSummary>(emptySummary);

  const loadCustomers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CustomersRepository.getCustomers({
        page,
        limit: ITEMS_PER_PAGE,
        search: search.trim() || undefined,
        storeId: filterStoreId ?? undefined,
      });
      setCustomers(response.data.items);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
      setSummary(response.data.summary ?? emptySummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [filterStoreId, search]);

  const loadCredit = useCallback(async (customerId: string) => {
    try {
      const response = await CustomersRepository.getCustomerCredit(
        customerId,
        filterStoreId,
      );
      setLedger(response.data.ledger);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar cartera');
    }
  }, [filterStoreId]);

  useEffect(() => {
    setSelectedCustomerId('');
    void loadCustomers(1);
  }, [loadCustomers]);

  useEffect(() => {
    if (selectedCustomerId) {
      void loadCredit(selectedCustomerId);
      const selectedCustomer =
        customers.find((customer) => customer.id === selectedCustomerId) ?? null;
      setCreditLimit(
        selectedCustomer?.creditLimit != null
          ? String(selectedCustomer.creditLimit)
          : '',
      );
    } else {
      setLedger([]);
      setCreditLimit('');
    }
  }, [customers, loadCredit, selectedCustomerId]);

  const updateCustomerCredit = async (
    customer: ICustomer,
    payload: Partial<ICustomer>,
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      const request: IUpdateCustomerRequest = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone ?? undefined,
        creditEnabled: payload.creditEnabled,
        creditLimit: payload.creditLimit ?? undefined,
      };

      await CustomersRepository.updateCustomer(customer.id, request, filterStoreId);
      await loadCustomers(currentPage);
      if (selectedCustomerId === customer.id) {
        await loadCredit(customer.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const registerPayment = async () => {
    if (!selectedCustomerId || !paymentAmount) {
      setError('Selecciona un cliente e ingresa un valor');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await CustomersRepository.registerCustomerPayment(
        selectedCustomerId,
        {
          amount: Number(paymentAmount),
          note: paymentNote.trim() || undefined,
        },
        filterStoreId,
      );
      setPaymentAmount('');
      setPaymentNote('');
      await loadCustomers(currentPage);
      await loadCredit(selectedCustomerId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible registrar abono');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const changePage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    await loadCustomers(page);
  };

  return {
    customers,
    selectedCustomerId,
    ledger,
    creditLimit,
    paymentAmount,
    paymentNote,
    search,
    loading,
    submitting,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: ITEMS_PER_PAGE,
    summary,
    setSelectedCustomerId,
    setCreditLimit,
    setPaymentAmount,
    setPaymentNote,
    setSearch,
    updateCustomerCredit,
    registerPayment,
    changePage,
    reload: () => loadCustomers(currentPage),
  };
};
