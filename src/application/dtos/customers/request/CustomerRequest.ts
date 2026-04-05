export interface ICreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export type IUpdateCustomerRequest = Partial<ICreateCustomerRequest>;
