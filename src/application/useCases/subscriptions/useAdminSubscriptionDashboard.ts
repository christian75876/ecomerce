import { useCallback, useEffect, useState } from 'react';
import { SubscriptionsRepository } from '@/infrastructure/repositories/api/subscriptions/SubscriptionsRepository';
import type {
  ISubscriptionAdminDashboard,
  ISubscriptionPlan,
  IStoreWithSubscriptionStatus,
} from '@/application/dtos/subscriptions/response/SubscriptionResponse';
import type { IRegisterSubscriptionRequest } from '@/application/dtos/subscriptions/request/SubscriptionRequest';

export type RegisterPaymentForm = {
  storeId: string;
  planId: string;
  startDate: string;
  endDate: string;
  paidAmount: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'OTHER';
  notes: string;
};

const emptyForm = (): RegisterPaymentForm => {
  const today = new Date().toISOString().split('T')[0];
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return {
    storeId: '',
    planId: '',
    startDate: today,
    endDate: in30,
    paidAmount: '',
    paymentMethod: 'CASH',
    notes: '',
  };
};

export const useAdminSubscriptionDashboard = () => {
  const [dashboard, setDashboard] = useState<ISubscriptionAdminDashboard | null>(null);
  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Register payment modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterPaymentForm>(emptyForm());
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Store filter/search
  const [storeSearch, setStoreSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'NEVER'>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, plansRes] = await Promise.all([
        SubscriptionsRepository.getAdminDashboard(),
        SubscriptionsRepository.getPlans(),
      ]);
      setDashboard(dashRes.data);
      setPlans(plansRes.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openRegisterModal = (storeId?: string) => {
    const form = emptyForm();
    if (storeId) form.storeId = storeId;
    // Auto-fill plan with cheapest active plan
    const cheapest = plans.filter((p) => p.isActive).sort((a, b) => Number(a.priceMonthly) - Number(b.priceMonthly))[0];
    if (cheapest) {
      form.planId = cheapest.id;
      form.paidAmount = String(cheapest.priceMonthly);
    }
    setRegisterForm(form);
    setRegisterError(null);
    setShowRegisterModal(true);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    setRegisterError(null);
  };

  const updateRegisterForm = (key: keyof RegisterPaymentForm, value: string) => {
    setRegisterForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-fill price and end date when plan changes
      if (key === 'planId') {
        const plan = plans.find((p) => p.id === value);
        if (plan) {
          next.paidAmount = String(plan.priceMonthly);
          const start = new Date(next.startDate);
          const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
          next.endDate = end.toISOString().split('T')[0];
        }
      }
      if (key === 'startDate') {
        const plan = plans.find((p) => p.id === next.planId);
        if (plan) {
          const start = new Date(value);
          const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
          next.endDate = end.toISOString().split('T')[0];
        }
      }
      return next;
    });
  };

  const submitRegisterPayment = async () => {
    if (!registerForm.storeId || !registerForm.planId || !registerForm.paidAmount) {
      setRegisterError('Completa tienda, plan y monto');
      return false;
    }
    setSubmitting(true);
    setRegisterError(null);
    try {
      const payload: IRegisterSubscriptionRequest = {
        storeId: registerForm.storeId,
        planId: registerForm.planId,
        startDate: registerForm.startDate,
        endDate: registerForm.endDate,
        paidAmount: Number(registerForm.paidAmount),
        paymentMethod: registerForm.paymentMethod,
        notes: registerForm.notes || undefined,
      };
      await SubscriptionsRepository.registerPayment(payload);
      setShowRegisterModal(false);
      await load();
      return true;
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Error al registrar pago');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStores = (dashboard?.storesWithStatus ?? []).filter((item: IStoreWithSubscriptionStatus) => {
    const matchSearch = storeSearch.trim() === '' || item.store.name.toLowerCase().includes(storeSearch.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return {
    dashboard,
    plans,
    loading,
    error,
    submitting,
    showRegisterModal,
    registerForm,
    registerError,
    storeSearch,
    statusFilter,
    filteredStores,
    load,
    openRegisterModal,
    closeRegisterModal,
    updateRegisterForm,
    submitRegisterPayment,
    setStoreSearch,
    setStatusFilter,
  };
};
