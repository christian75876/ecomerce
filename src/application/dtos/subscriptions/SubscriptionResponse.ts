import { IApiResponse } from '@/application/dtos/common/HttpResponse';

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

export interface IStoreSubscription {
  id: string;
  storeId: string;
  planId: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  paidAmount: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'OTHER';
  notes: string | null;
  receiptUrl: string | null;
  registeredByUserId: number | null;
  createdAt: string;
  updatedAt: string;
  plan?: ISubscriptionPlan;
  store?: { id: string; name: string; slug: string };
}

export interface IStoreWithSubscriptionStatus {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    subscriptionExpiresAt: string | null;
    isPremiumAdvertiser: boolean;
    whatsappNumber: string | null;
    phone: string | null;
    email: string | null;
    userId: number | null;
  };
  latestSubscription: IStoreSubscription | null;
  status: 'ACTIVE' | 'EXPIRED' | 'NEVER';
}

export interface ISubscriptionOverview {
  totalStores: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  neverPaid: number;
  expiringIn14Days: number;
  expiringIn30Days: number;
  premiumAdvertisers: number;
}

export interface ISubscriptionRevenue {
  mrr: number;
  arr: number;
  totalCollected: number;
  thisMonthCollected: number;
  lastMonthCollected: number;
  newSubscriptionsThisMonth: number;
  growthVsLastMonth: number;
}

export interface IRevenueByMonth {
  month: string;
  label: string;
  amount: number;
  count: number;
}

export interface ISubscriptionAdminDashboard {
  overview: ISubscriptionOverview;
  revenue: ISubscriptionRevenue;
  revenueByMonth: IRevenueByMonth[];
  recentPayments: IStoreSubscription[];
  storesWithStatus: IStoreWithSubscriptionStatus[];
}

export type ISubscriptionDashboardResp = IApiResponse<ISubscriptionAdminDashboard>;
export type ISubscriptionPlansResp = IApiResponse<ISubscriptionPlan[]>;
export type ISubscriptionPlanResp = IApiResponse<ISubscriptionPlan>;
export type IStoreSubscriptionsResp = IApiResponse<IStoreSubscription[]>;
export type IStoreSubscriptionResp = IApiResponse<IStoreSubscription>;
