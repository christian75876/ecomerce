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
  const numeric = Math.round(parseFloat(String(value ?? '0')) || 0);
  const display = numeric > 0 ? formatThousands(numeric) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    onChange(digits);
  };

  return (
    <div className='relative w-full'>
      <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-sm text-neutral-dark/40'>
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
        className={[
          'w-full rounded-2xl border bg-white pl-8 pr-4 py-3 text-sm text-neutral-dark',
          'shadow-xs placeholder:text-neutral-dark/30',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'border-neutral-gray/70 hover:border-neutral-gray focus:border-primary/50 focus:ring-primary/20',
          'disabled:opacity-50',
          className,
        ].join(' ')}
      />
    </div>
  );
};
