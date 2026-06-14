import { useState } from 'react';
import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import { PurchasesRepository } from '@/infrastructure/repositories/api/purchases/PurchasesRepository';
import {
  createHydratedEditForm,
  createHydratedPaymentForm,
  createPurchaseEditPayload,
  createPurchasePaymentPayload,
} from '../helpers/purchaseMappers';
import {
  emptyCancelForm,
  emptyEditForm,
  emptyPaymentForm,
} from '../helpers/purchaseInitialState';
import {
  PurchaseCancelForm,
  PurchaseEditForm,
  PurchasePaymentForm,
} from '../purchase.types';
import {
  validatePurchaseEditForm,
  validatePurchasePaymentForm,
} from '../helpers/purchaseValidation';

interface UsePurchaseDetailFlowParams {
  onPurchaseUpdated: (purchase: IPurchase) => void;
}

export const usePurchaseDetailFlow = ({
  onPurchaseUpdated,
}: UsePurchaseDetailFlowParams) => {
  const [selectedPurchase, setSelectedPurchase] = useState<IPurchase | null>(null);
  const [isPurchaseDetailModalOpen, setIsPurchaseDetailModalOpen] =
    useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSubmitting, setDetailSubmitting] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] =
    useState<PurchasePaymentForm>(emptyPaymentForm);
  const [editForm, setEditForm] = useState<PurchaseEditForm>(emptyEditForm);
  const [cancelForm, setCancelForm] =
    useState<PurchaseCancelForm>(emptyCancelForm);

  const hydratePurchaseDetail = (purchase: IPurchase) => {
    setSelectedPurchase(purchase);
    setPaymentForm(createHydratedPaymentForm(purchase));
    setEditForm(createHydratedEditForm(purchase));
    setCancelForm(emptyCancelForm);
  };

  const replacePurchaseInState = (nextPurchase: IPurchase) => {
    onPurchaseUpdated(nextPurchase);
    hydratePurchaseDetail(nextPurchase);
  };

  const openPurchaseDetailModal = async (purchaseId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    setIsPurchaseDetailModalOpen(true);

    try {
      const response = await PurchasesRepository.getPurchaseById(purchaseId);
      hydratePurchaseDetail(response.data);
    } catch (err) {
      setSelectedPurchase(null);
      setDetailError(
        err instanceof Error ? err.message : 'No fue posible cargar el detalle',
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closePurchaseDetailModal = () => {
    setIsPurchaseDetailModalOpen(false);
    setSelectedPurchase(null);
    setDetailError(null);
    setDetailLoading(false);
    setDetailSubmitting(false);
    setPaymentForm(emptyPaymentForm);
    setEditForm(emptyEditForm);
    setCancelForm(emptyCancelForm);
  };

  const updatePaymentForm = <K extends keyof PurchasePaymentForm>(
    key: K,
    value: PurchasePaymentForm[K],
  ) => {
    setPaymentForm((current) => ({ ...current, [key]: value }));
  };

  const updateEditForm = (key: keyof PurchaseEditForm, value: string) => {
    setEditForm((current) => ({ ...current, [key]: value }));
  };

  const updateCancelForm = (key: keyof PurchaseCancelForm, value: string) => {
    setCancelForm((current) => ({ ...current, [key]: value }));
  };

  const submitPurchasePayment = async () => {
    if (!selectedPurchase) {
      return false;
    }

    const validationError = validatePurchasePaymentForm(paymentForm);
    if (validationError) {
      setDetailError(validationError);
      return false;
    }

    setDetailSubmitting(true);
    setDetailError(null);

    try {
      const response = await PurchasesRepository.registerPurchasePayment(
        selectedPurchase.id,
        createPurchasePaymentPayload(paymentForm),
      );
      replacePurchaseInState(response.data);
      setPaymentForm(createHydratedPaymentForm(response.data));
      return true;
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : 'No fue posible registrar el abono',
      );
      return false;
    } finally {
      setDetailSubmitting(false);
    }
  };

  const submitPurchaseEdit = async () => {
    if (!selectedPurchase) {
      return false;
    }

    const validationError = validatePurchaseEditForm(editForm);
    if (validationError) {
      setDetailError(validationError);
      return false;
    }

    setDetailSubmitting(true);
    setDetailError(null);

    try {
      const response = await PurchasesRepository.updatePurchase(
        selectedPurchase.id,
        createPurchaseEditPayload(editForm),
      );
      replacePurchaseInState(response.data);
      return true;
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : 'No fue posible editar la compra',
      );
      return false;
    } finally {
      setDetailSubmitting(false);
    }
  };

  const submitPurchaseCancel = async () => {
    if (!selectedPurchase) {
      return false;
    }

    setDetailSubmitting(true);
    setDetailError(null);

    try {
      const response = await PurchasesRepository.cancelPurchase(
        selectedPurchase.id,
        {
          reason: cancelForm.reason.trim() || undefined,
        },
      );
      replacePurchaseInState(response.data);
      return true;
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : 'No fue posible cancelar la compra',
      );
      return false;
    } finally {
      setDetailSubmitting(false);
    }
  };

  return {
    selectedPurchase,
    isPurchaseDetailModalOpen,
    detailLoading,
    detailSubmitting,
    detailError,
    paymentForm,
    editForm,
    cancelForm,
    openPurchaseDetailModal,
    closePurchaseDetailModal,
    updatePaymentForm,
    updateEditForm,
    updateCancelForm,
    submitPurchasePayment,
    submitPurchaseEdit,
    submitPurchaseCancel,
  };
};
