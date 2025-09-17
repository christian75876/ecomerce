export interface IRegisterRequest {
  email: string;
  password: string;
  role_id: string;
  descriptors: number[][];
}

// Formulario (lo que valida Yup y entrega handleSubmit)
export interface IRegisterForm {
  email: string;
  password: string;
  password_confirm: string;
  role_id: string;
}