import * as yup from 'yup';

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const registerSchema = ({ isAdmin }: { isAdmin: boolean }) =>
  yup.object({
    email: yup
      .string()
      .email('Correo inválido')
      .required('El correo es obligatorio'),
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
    role_id: !isAdmin
      ? yup
          .string()
          .required('El rol es obligatorio')
          .matches(uuidV4Regex, 'El rol seleccionado no es válido')
      : yup
          .string()
          .required('El rol es obligatorio')
          .matches(uuidV4Regex, 'El rol seleccionado no es válido')
  });
