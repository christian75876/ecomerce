import * as yup from 'yup';

/** Same field rules as registerCustomerSchema, minus email — the invited seller's email comes fixed from the invitation, not the form. */
export const registerInvitedSellerSchema = yup.object({
  firstName: yup
    .string()
    .required('El nombre es obligatorio')
    .max(60, 'El nombre es demasiado largo'),
  lastName: yup
    .string()
    .required('El apellido es obligatorio')
    .max(60, 'El apellido es demasiado largo'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(6, 'Debe tener al menos 6 caracteres')
    .matches(/[0-9]/, 'Debe incluir al menos un número')
    .matches(/[^A-Za-z0-9]/, 'Debe incluir al menos un símbolo especial (ej: @, #, !)'),
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
