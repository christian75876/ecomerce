import { useState } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

import Box from '@atoms/box/SimpleBox';
import Input from '@atoms/input/SimpleInput';
import Label from '@atoms/label/SimpleLabel';
import Icon from '../../atoms/icon/SimpleIcon';

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
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const trimmedLabel = label.trim();
  const isRequired = trimmedLabel.endsWith('*');
  const labelText = isRequired ? trimmedLabel.slice(0, -1).trimEnd() : trimmedLabel;

  return (
    <Box className={boxClassName}>
      {showLabel && (
        <Label
          htmlFor={name}
          className='block text-md font-medium text-gray-700'
        >
          {labelText}
          {isRequired && <span className='ml-0.5 text-red-500'>*</span>}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <div className='relative'>
            <Input
              {...field}
              id={name}
              type={inputType}
              placeholder={placeholder}
              error={fieldState.error?.message}
              className={`${inputClassName} ${isPassword ? 'pr-10' : ''}`}
            />

            {isPassword && (
              <button
                type='button'
                onClick={() => setShowPassword(prev => !prev)}
                className='absolute inset-y-0 right-2 flex items-center text-sm text-gray-500'
              >
                {showPassword ? (
                  <Icon name='bx-hide' size={20} />
                ) : (
                  <Icon name='bx-show' size={20} />
                )}
              </button>
            )}
          </div>
        )}
      />
    </Box>
  );
};

export default FormField;
