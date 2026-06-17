import type { IStore } from '@/application/dtos/stores/response/StoreResponse';

export interface ISubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type SubscriptionPaymentMethod = 'CASH' | 'TRANSFER' | 'OTHER';
export type StoreSubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'NEVER';

export interface IStoreSubscription {
  id: string;
  storeId: string;
  store: IStore;
  planId: string;
  plan: ISubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  paidAmount: number;
  paymentMethod: SubscriptionPaymentMethod;
  notes: string | null;
  receiptUrl: string | null;
  registeredByUserId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IRevenueMonth {
  month: string;
  label: string;
  amount: number;
  count: number;
}

export interface IStoreWithSubscriptionStatus {
  store: IStore;
  latestSubscription: IStoreSubscription | null;
  status: StoreSubscriptionStatus;
}

export interface ISubscriptionAdminDashboard {
  overview: {
    totalStores: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    neverPaid: number;
    expiringIn14Days: number;
    expiringIn30Days: number;
    premiumAdvertisers: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    totalCollected: number;
    thisMonthCollected: number;
    lastMonthCollected: number;
    newSubscriptionsThisMonth: number;
    growthVsLastMonth: number;
  };
  revenueByMonth: IRevenueMonth[];
  recentPayments: IStoreSubscription[];
  storesWithStatus: IStoreWithSubscriptionStatus[];
}
