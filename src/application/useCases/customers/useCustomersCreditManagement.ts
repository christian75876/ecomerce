import { useCallback, useEffect, useState } from 'react';
import {
  ICustomer,
  ICustomerLedgerEntry,
} from '@/application/dtos/customers/response/CustomerResponse';
import { IUpdateCustomerRequest } from '@/application/dtos/customers/request/CustomerRequest';
import { CustomersRepository } from '@/infrastructure/repositories/api/customers/CustomersRepository';
import { useAdminStore } from '@/shared/contexts/AdminStoreContext';

export const useCustomersCreditManagement = () => {
  const { selectedStoreId: contextStoreId } = useAdminStore();
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
  const itemsPerPage = 20;

  const loadCustomers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CustomersRepository.getCustomers(search || undefined, contextStoreId, page, itemsPerPage);
      setCustomers(response.data.items);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [search, contextStoreId]);

  const loadCredit = useCallback(async (customerId: string) => {
    try {
      const response = await CustomersRepository.getCustomerCredit(customerId);
      setLedger(response.data.ledger);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar cartera');
    }
  }, []);

  useEffect(() => {
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

      await CustomersRepository.updateCustomer(customer.id, request);
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

  const changePage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    await loadCustomers(page);
  };

  const registerPayment = async () => {
    if (!selectedCustomerId || !paymentAmount) {
      setError('Selecciona un cliente e ingresa un valor');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await CustomersRepository.registerCustomerPayment(selectedCustomerId, {
        amount: Number(paymentAmount),
        note: paymentNote.trim() || undefined,
      });
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
    itemsPerPage,
    setSelectedCustomerId,
    setCreditLimit,
    setPaymentAmount,
    setPaymentNote,
    setSearch,
    updateCustomerCredit,
    registerPayment,
    changePage,
    reload: loadCustomers,
  };
};
