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
  deliveryOptions?: 'DELIVERY' | 'PICKUP' | 'BOTH';
}

export type IUpdateStoreRequest = Partial<ICreateStoreRequest>;
