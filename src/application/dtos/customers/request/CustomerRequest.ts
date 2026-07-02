export interface ICreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  creditEnabled?: boolean;
  creditLimit?: number;
}

export type IUpdateCustomerRequest = Partial<ICreateCustomerRequest>;

export interface IRegisterCustomerPaymentRequest {
  amount: number;
  note?: string;
}
