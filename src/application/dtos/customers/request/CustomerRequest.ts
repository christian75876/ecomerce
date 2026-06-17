export interface ICreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  storeId?: string;
  creditEnabled?: boolean;
  creditLimit?: number;
}

export type IUpdateCustomerRequest = Partial<ICreateCustomerRequest>;

export interface IGetCustomersQuery {
  search?: string;
  storeId?: string | null;
  page?: number;
  limit?: number;
}

export interface IRegisterCustomerPaymentRequest {
  amount: number;
  note?: string;
}
