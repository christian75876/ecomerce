import * as yup from 'yup';

export const registerSchema = ({ isAdmin }: { isAdmin: boolean }) =>
  yup.object({
    email: yup
      .string()
      .email('Correo inválido')
      .required('El correo es obligatorio'),
    password: yup
      .string()
      .required('La contraseña es obligatoria')
      .min(6, 'Debe tener al menos 6 caracteres'),
    password_confirm: yup
      .string()
      .required('La confirmación de contraseña es obligatoria')
      .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
    role_id: !isAdmin
      ? yup
          .string()
          .required('El rol es obligatorio')
          .oneOf(['2', '3'], 'El rol debe ser Comprador o Vendedor')
      : yup
          .string()
          .required('El rol es obligatorio')
          .oneOf(['1'], 'El rol debe ser Administrador')
  });
