interface CurrencyInputProps {
  id?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const formatThousands = (n: number): string =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n);

export const CurrencyInput = ({
  id,
  value,
  onChange,
  placeholder = '0',
  disabled,
  className = '',
}: CurrencyInputProps) => {
  const numeric = parseInt(String(value ?? '').replace(/\D/g, ''), 10) || 0;
  const display = numeric > 0 ? formatThousands(numeric) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    onChange(digits);
  };

  return (
    <div className='relative'>
      <span className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-sm font-semibold text-slate-400'>
        $
      </span>
      <input
        id={id}
        type='text'
        inputMode='numeric'
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`pl-8 ${className}`}
      />
    </div>
  );
};
