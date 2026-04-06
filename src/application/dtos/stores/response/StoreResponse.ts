import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IStore {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IStoresResp = IApiResponse<IStore[]>;
export type IStoreResp = IApiResponse<IStore>;
