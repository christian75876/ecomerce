import * as yup from 'yup';

export const searchBar = yup.object({
  search: yup
    .string()
    .required('Ingrese el nombre de un producto')
    .matches(
      /^[a-zA-Z0-9\s-_ñÑ]+$/,
      'El nombre contiene caracteres no permitidos'
    )
});
