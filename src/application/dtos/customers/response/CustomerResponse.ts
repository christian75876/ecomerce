import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface ICustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  creditEnabled: boolean;
  creditLimit: number | null;
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
}

export type ICustomersResp = IApiResponse<ICustomer[]>;
export type ICustomerResp = IApiResponse<ICustomer>;

export interface ICustomerLedgerEntry {
  id: string;
  customerId: string;
  type: 'CREDIT_SALE' | 'PAYMENT' | 'ADJUSTMENT';
  amount: number;
  note: string | null;
  referenceId: string | null;
  createdAt: string;
}

export type ICustomerCreditResp = IApiResponse<{
  customer: ICustomer;
  ledger: ICustomerLedgerEntry[];
}>;
