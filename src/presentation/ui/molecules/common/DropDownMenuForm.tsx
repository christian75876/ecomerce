import React, { useEffect, useMemo } from 'react';
import Box from '../../atoms/box/SimpleBox';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import Label from '../../atoms/label/SimpleLabel';
import ErrorMessage from '../../atoms/error-message/SimpleErrorMessage';
import clsx from 'clsx';

export interface IOption {
  id: string;
  name: string;
}

interface IDropdownMenuForm<TForm extends FieldValues> {
  label: string;
  name: Path<TForm>;
  control: Control<TForm>;
  options: IOption[];
  defaultValue: string;
  dropDownClassName?: string;
  boxClassName?: string;
  showLabel?: boolean;
}

/**
 * A dropdown menu for using in forms.
 */
export const DropDownMenuForm = <TForm extends FieldValues>({
  label,
  name,
  control,
  options,
  defaultValue,
  dropDownClassName = '',
  boxClassName = 'w-full mb-5',
  showLabel = false
}: IDropdownMenuForm<TForm>) => {
  useEffect(() => {
    if (options.filter(item => item.name === defaultValue).length === 0) {
      options.unshift({
        id: '0',
        name: defaultValue
      });
    }
  }, []);

  const optionsWithDefault = useMemo(() => {
    if (options.filter(item => item.name === defaultValue).length === 0) {
      return [
        ...options,
        {
          id: '0',
          name: defaultValue
        }
      ];
    }
    return [...options];
  }, [options]);

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
        rules={{ required: 'Role is required' }}
        render={({ field, fieldState }) => {
          console.log('field.values: ', field.value);
          return (
            <>
              <select
                className={clsx(
                  'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white placeholder:text-gray-400 placeholder:italic',
                  fieldState.error
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary',
                  dropDownClassName,
                  field.value === '0' || !field.value
                    ? 'text-gray-500'
                    : 'text-gray-900'
                )}
                id={name}
                {...field}
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
              >
                {optionsWithDefault.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              {fieldState.error && (
                <ErrorMessage message={fieldState.error.message} />
              )}
            </>
          );
        }}
      />
    </Box>
  );
};
