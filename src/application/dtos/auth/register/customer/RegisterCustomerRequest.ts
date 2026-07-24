export interface IRegisterCustomerRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  inviteToken?: string;
}

export interface IRegisterCustomerForm extends IRegisterCustomerRequest {
  password_confirm: string;
}
