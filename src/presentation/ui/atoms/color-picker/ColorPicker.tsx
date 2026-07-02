interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ColorPicker = ({ label, value, onChange, disabled = false }: ColorPickerProps) => {
  const safeValue = value || '#6366f1';

  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-xs font-semibold text-neutral-dark/60 uppercase tracking-wide'>
        {label}
      </label>
      <div className='flex items-center gap-2 rounded-xl border border-neutral-gray/30 bg-white px-2 py-1.5 shadow-sm'>
        <div className='relative'>
          <div
            className='h-8 w-8 rounded-lg border border-neutral-gray/20 shadow-inner cursor-pointer overflow-hidden'
            style={{ backgroundColor: safeValue }}
          >
            <input
              type='color'
              value={safeValue}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
              aria-label={label}
            />
          </div>
        </div>
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={7}
          placeholder='#000000'
          className='w-20 bg-transparent text-xs font-mono text-neutral-dark/70 outline-none placeholder:text-neutral-dark/30'
        />
      </div>
    </div>
  );
};

export default ColorPicker;
