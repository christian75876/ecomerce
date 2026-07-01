import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface ISupplier {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISuppliersPaginated {
  items: ISupplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ISuppliersResp = IApiResponse<ISuppliersPaginated>;
export type ISupplierResp = IApiResponse<ISupplier>;
