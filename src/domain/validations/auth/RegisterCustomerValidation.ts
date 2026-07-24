import * as yup from 'yup';

export const registerCustomerSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .max(120, 'El nombre es demasiado largo'),
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
  phone: yup
    .string()
    .required('El teléfono es obligatorio')
    .min(7, 'El teléfono es demasiado corto')
    .max(30, 'El teléfono es demasiado largo'),
});
