import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface ICustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ICustomersResp = IApiResponse<ICustomer[]>;
export type ICustomerResp = IApiResponse<ICustomer>;
