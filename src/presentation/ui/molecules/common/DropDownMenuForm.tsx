import React, { useMemo, useState } from 'react';
import Box from '../../atoms/box/SimpleBox';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import Label from '../../atoms/label/SimpleLabel';
import ErrorMessage from '../../atoms/error-message/SimpleErrorMessage';
import clsx from 'clsx';
import Icon from '../../atoms/icon/SimpleIcon';

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
  const optionsWithDefault = useMemo(() => {
    if (options.filter(item => item.name === defaultValue).length === 0) {
      return [{ id: '', name: defaultValue }, ...options];
    }
    return [...options];
  }, [options, defaultValue]);

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
        render={({ field, fieldState }) => (
          <>
            <div className='relative group'>
              <select
                id={name}
                {...field}
                className={clsx(
                  'w-full px-4 py-3 border rounded-lg bg-white',
                  'appearance-none pr-12',
                  'focus:outline-none focus:ring-2',
                  fieldState.error
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                )}
              >
                {optionsWithDefault.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>

              <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center'>
                <span className='transition-transform duration-200 group-focus-within:rotate-180'>
                  <Icon name='bx-chevron-down' size={20} />
                </span>
              </span>
            </div>

            {fieldState.error && (
              <ErrorMessage message={fieldState.error.message} />
            )}
          </>
        )}
      />
    </Box>
  );
};
