interface PhoneInputCOProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

const PhoneInputCO = ({
  value,
  onChange,
  placeholder = '300 123 4567',
  disabled = false,
  required = false,
  name,
  id,
  className = '',
}: PhoneInputCOProps) => {
  return (
    <div className={`flex overflow-hidden rounded-2xl border border-neutral-gray/80 bg-white/90 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 ${className}`}>
      <span className='flex flex-shrink-0 items-center gap-1.5 border-r border-neutral-gray/30 bg-slate-50 px-3 text-sm font-semibold text-neutral-dark/70 select-none'>
        🇨🇴 +57
      </span>
      <input
        id={id}
        name={name}
        type='tel'
        inputMode='numeric'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className='min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-neutral-dark outline-none placeholder:text-neutral-dark/35 disabled:cursor-not-allowed disabled:opacity-60'
      />
    </div>
  );
};

export default PhoneInputCO;
