export interface IRegisterRequest {
  email: string;
  password: string;
  role_id: string;
}

export interface IRegisterForm extends IRegisterRequest {
  password_confirm: string;
}
