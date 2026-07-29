import * as yup from 'yup';

export const registerCustomerSchema = yup.object({
  firstName: yup
    .string()
    .required('El nombre es obligatorio')
    .max(60, 'El nombre es demasiado largo'),
  lastName: yup
    .string()
    .required('El apellido es obligatorio')
    .max(60, 'El apellido es demasiado largo'),
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
