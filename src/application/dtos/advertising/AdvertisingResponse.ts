import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IStoreAdvertisement {
  id: string;
  storeId: string;
  startDate: string;
  endDate: string;
  paidAmount: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'OTHER';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  notes: string | null;
  registeredByUserId: number | null;
  createdAt: string;
  updatedAt: string;
  store?: { id: string; name: string; slug: string };
}

export interface IStoreWithAdStatus {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isPremiumAdvertiser: boolean;
    advertisingExpiresAt: string | null;
    whatsappNumber: string | null;
    isActive: boolean;
  };
  latestAdvertisement: IStoreAdvertisement | null;
  status: 'ACTIVE' | 'EXPIRED' | 'NEVER';
}

export interface IAdvertisingOverview {
  totalStores: number;
  activeAds: number;
  expiredAds: number;
  neverPaid: number;
  expiringIn14Days: number;
  expiringIn30Days: number;
}

export interface IAdvertisingRevenue {
  totalCollected: number;
  thisMonthCollected: number;
  lastMonthCollected: number;
}

export interface IAdvertisingDashboard {
  overview: IAdvertisingOverview;
  revenue: IAdvertisingRevenue;
  storesWithStatus: IStoreWithAdStatus[];
}

export type IAdvertisingDashboardResp = IApiResponse<IAdvertisingDashboard>;
export type IStoreAdvertisementsResp = IApiResponse<IStoreAdvertisement[]>;
export type IStoreAdvertisementResp = IApiResponse<IStoreAdvertisement>;
