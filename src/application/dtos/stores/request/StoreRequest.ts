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
  description?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export type IUpdateStoreRequest = Partial<ICreateStoreRequest>;
