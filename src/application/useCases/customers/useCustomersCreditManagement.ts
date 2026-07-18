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

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CustomersRepository.getCustomers(search || undefined, contextStoreId);
      setCustomers((response.data as unknown as { items?: ICustomer[] }).items ?? []);
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
    void loadCustomers();
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
      await loadCustomers();
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
      await CustomersRepository.registerCustomerPayment(selectedCustomerId, {
        amount: Number(paymentAmount),
        note: paymentNote.trim() || undefined,
      });
      setPaymentAmount('');
      setPaymentNote('');
      await loadCustomers();
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
    setSelectedCustomerId,
    setCreditLimit,
    setPaymentAmount,
    setPaymentNote,
    setSearch,
    updateCustomerCredit,
    registerPayment,
    reload: loadCustomers,
  };
};
