export interface ICreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface IUpdateCustomerRequest extends Partial<ICreateCustomerRequest> {}
