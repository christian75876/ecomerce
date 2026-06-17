import { IApiResponse, IMetaData } from '@/application/dtos/common/HttpResponse';

export interface ICustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  storeId: string | null;
  creditEnabled: boolean;
  creditLimit: number | null;
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomersSummary {
  totalCustomers: number;
  creditEnabledCount: number;
  customersWithDebtCount: number;
  totalPortfolio: number;
}

export interface ICustomersData {
  items: ICustomer[];
  pagination: IMetaData;
  summary: ICustomersSummary;
}

export type ICustomersResp = IApiResponse<ICustomersData>;
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
