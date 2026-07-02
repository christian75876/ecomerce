export interface IStoresQuery {
  active?: boolean;
}

export interface ICreateStoreRequest {
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  textColor?: string;
  fontStyle?: 'MODERN' | 'CLASSIC' | 'PLAYFUL';
  buttonStyle?: 'ROUNDED' | 'SHARP' | 'PILL';
  layoutStyle?: 'GRID' | 'LIST';
  coverStyle?: 'GRADIENT' | 'SOLID' | 'MINIMAL';
  description?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  isActive?: boolean;
  isAdultContent?: boolean;
  isPremiumAdvertiser?: boolean;
  subscriptionExpiresAt?: string | null;
  storeType?: 'STORE' | 'RESTAURANT';
  menuPdfUrl?: string;
  deliveryOptions?: 'DELIVERY' | 'PICKUP' | 'BOTH';
}

export interface IUpdateStoreNotificationRequest {
  wppNotificationsEnabled?: boolean;
  wppApiKey?: string;
}

export type IUpdateStoreRequest = Partial<ICreateStoreRequest> & IUpdateStoreNotificationRequest;
