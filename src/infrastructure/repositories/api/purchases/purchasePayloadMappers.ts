import { IRegisterPurchasePaymentRequest } from '@/application/dtos/purchases/request/PurchaseRequest';

export const buildPurchasePaymentFormData = (
  payload: IRegisterPurchasePaymentRequest,
) => {
  const formData = new FormData();

  formData.append('amount', String(payload.amount));
  formData.append('paymentMethod', payload.paymentMethod);

  if (payload.note) {
    formData.append('note', payload.note);
  }

  if (payload.reference) {
    formData.append('reference', payload.reference);
  }

  if (payload.paidAt) {
    formData.append('paidAt', payload.paidAt);
  }

  if (payload.receiptImage) {
    formData.append('receiptImage', payload.receiptImage);
  }

  return formData;
};
