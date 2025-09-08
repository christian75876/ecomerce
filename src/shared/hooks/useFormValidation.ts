import { useForm, UseFormReturn, DefaultValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

/**
 * Reusable hook for handling form validation using React Hook Form and Yup.
 *
 * @template T - The Yup schema type.
 * @param {T} schema - The Yup validation schema.
 * @param {DefaultValues<yup.InferType<T>>} [defaultValues] - Optional initial form values.
 * @returns {UseFormReturn<yup.InferType<T>>} - The form handler instance.
 */
export function useFormValidation<T extends yup.AnyObjectSchema>(
  schema: T,
  disabled: boolean,
  defaultValues?: DefaultValues<yup.InferType<T>>
): UseFormReturn<yup.InferType<T>> {
  return useForm<yup.InferType<T>>({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
    disabled
  });
}
