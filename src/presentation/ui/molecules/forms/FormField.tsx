import {
  Controller,
  Control,
  FieldValues,
  Path,
  UseFormWatch,
  RegisterOptions
} from 'react-hook-form';

import Box from '@atoms/box/SimpleBox';
import Input from '@atoms/input/SimpleInput';
import Label from '@atoms/label/SimpleLabel';

interface FormFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  type?: string;
  placeholder?: string;
  showLabel?: boolean;
  inputClassName?: string;
  boxClassName?: string;
}

const FormField = <T extends FieldValues>({
  label,
  name,
  control,
  type = 'text',
  placeholder,
  showLabel = false,
  inputClassName = '',
  boxClassName = 'w-full mb-5'
}: FormFieldProps<T>) => {
  return (
    <Box className={boxClassName}>
      {showLabel && (
        <Label
          htmlFor={name}
          className='block text-md font-medium text-gray-700'
        >
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Input
            className={inputClassName}
            id={name}
            type={type}
            placeholder={placeholder}
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />
    </Box>
  );
};

export default FormField;
