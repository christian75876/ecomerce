import { useState } from 'react';
import { createPortal } from 'react-dom';

interface QuickCreateModalProps {
  title: string;
  placeholder: string;
  onConfirm: (name: string) => Promise<void>;
  onClose: () => void;
}

export const QuickCreateModal = ({
  title,
  placeholder,
  onConfirm,
  onClose,
}: QuickCreateModalProps) => {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    await onConfirm(value.trim());
    setSaving(false);
  };

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-neutral-dark/50 px-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-sm rounded-[1.75rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='mb-4 text-lg font-bold text-neutral-dark'>{title}</h2>
        <form onSubmit={handleSubmit} className='space-y-3'>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={saving}
            className='w-full rounded-xl border border-neutral-gray/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
          />
          <div className='flex gap-2'>
            <button
              type='submit'
              disabled={saving || !value.trim()}
              className='flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
            >
              {saving ? 'Creando...' : 'Crear'}
            </button>
            <button
              type='button'
              onClick={onClose}
              disabled={saving}
              className='rounded-xl border border-neutral-gray/30 px-4 py-2.5 text-sm font-semibold text-neutral-dark/70 transition hover:bg-neutral-gray/10'
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
