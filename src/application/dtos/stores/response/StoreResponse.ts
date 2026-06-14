import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IStore {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  bgColor: string | null;
  textColor: string | null;
  fontStyle: 'MODERN' | 'CLASSIC' | 'PLAYFUL';
  buttonStyle: 'ROUNDED' | 'SHARP' | 'PILL';
  layoutStyle: 'GRID' | 'LIST';
  coverStyle: 'GRADIENT' | 'SOLID' | 'MINIMAL';
  description: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  isActive: boolean;
  deliveryOptions: 'DELIVERY' | 'PICKUP' | 'BOTH';
  wppNotificationsEnabled: boolean;
  wppApiKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export type IStoresResp = IApiResponse<IStore[]>;
export type IStoreResp = IApiResponse<IStore>;
