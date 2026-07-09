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
  pendingBalance?: number;
  createdAt: string;
  updatedAt: string;
}

export type ISuppliersResp = IApiResponse<ISupplier[]>;
export type ISupplierResp = IApiResponse<ISupplier>;
