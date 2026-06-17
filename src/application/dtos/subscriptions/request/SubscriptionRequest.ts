import type { SubscriptionPaymentMethod, SubscriptionStatus } from '../response/SubscriptionResponse';

export interface IRegisterSubscriptionRequest {
  storeId: string;
  planId: string;
  startDate: string;
  endDate: string;
  paidAmount: number;
  paymentMethod: SubscriptionPaymentMethod;
  status?: SubscriptionStatus;
  notes?: string;
  receiptUrl?: string;
}

export interface ICreatePlanRequest {
  name: string;
  description?: string;
  priceMonthly: number;
  durationDays: number;
  isActive?: boolean;
}
