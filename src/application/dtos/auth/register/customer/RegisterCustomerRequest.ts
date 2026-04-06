export interface IRegisterCustomerRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface IRegisterCustomerForm extends IRegisterCustomerRequest {
  password_confirm: string;
}
