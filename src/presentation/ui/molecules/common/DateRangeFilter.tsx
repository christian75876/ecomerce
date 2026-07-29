import { useState } from 'react';

export interface DateRange {
  from: string;
  to: string;
  label: string;
}

interface Props {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return toIso(new Date());
}

function startOf(unit: 'week' | 'month' | 'quarter' | 'year'): string {
  const d = new Date();
  if (unit === 'week') {
    d.setDate(d.getDate() - 6);
  } else if (unit === 'month') {
    d.setDate(1);
  } else if (unit === 'quarter') {
    const q = Math.floor(d.getMonth() / 3);
    d.setMonth(q * 3, 1);
  } else {
    d.setMonth(0, 1);
  }
  return toIso(d);
}

function startOfLastMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1, 1);
  return toIso(d);
}

function endOfLastMonth(): string {
  const d = new Date();
  d.setDate(0);
  return toIso(d);
}

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS: { label: string; getRange: () => { from: string; to: string } }[] = [
  { label: 'Hoy',           getRange: () => ({ from: todayIso(),              to: todayIso()           }) },
  { label: '7 días',        getRange: () => ({ from: startOf('week'),         to: todayIso()           }) },
  { label: 'Este mes',      getRange: () => ({ from: startOf('month'),        to: todayIso()           }) },
  { label: 'Último mes',    getRange: () => ({ from: startOfLastMonth(),      to: endOfLastMonth()     }) },
  { label: 'Trimestre',     getRange: () => ({ from: startOf('quarter'),      to: todayIso()           }) },
  { label: 'Este año',      getRange: () => ({ from: startOf('year'),         to: todayIso()           }) },
];

// ── Component ─────────────────────────────────────────────────────────────────

const DateRangeFilter = ({ value, onChange }: Props) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setShowCustom(false);
    const range = preset.getRange();
    onChange({ ...range, label: preset.label });
  };

  const applyCustom = () => {
    if (!customFrom || !customTo || customTo < customFrom) return;
    const fmtDate = (iso: string) =>
      new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    onChange({ from: customFrom, to: customTo, label: `${fmtDate(customFrom)} – ${fmtDate(customTo)}` });
    setShowCustom(false);
  };

  const clear = () => {
    onChange(null);
    setShowCustom(false);
    setCustomFrom('');
    setCustomTo('');
  };

  return (
    <div className='flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <i className='bx bx-calendar-alt text-base text-primary' aria-hidden='true' />
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
            Filtrar por período
          </p>
        </div>
        {value ? (
          <button
            type='button'
            onClick={clear}
            className='flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-500'
          >
            <i className='bx bx-x text-sm' aria-hidden='true' />
            Limpiar
          </button>
        ) : null}
      </div>

      {/* Active range display */}
      {value ? (
        <div className='flex items-center gap-2 rounded-2xl bg-primary/5 px-4 py-2.5'>
          <i className='bx bx-filter-alt text-sm text-primary' aria-hidden='true' />
          <span className='text-sm font-semibold text-primary'>{value.label}</span>
          <span className='ml-auto text-xs text-slate-400'>
            {value.from === value.to
              ? new Date(value.from).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
              : `${new Date(value.from).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} → ${new Date(value.to).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}`
            }
          </span>
        </div>
      ) : null}

      {/* Preset chips */}
      <div className='flex flex-wrap gap-2'>
        {PRESETS.map((preset) => {
          const active = value?.label === preset.label;
          return (
            <button
              key={preset.label}
              type='button'
              onClick={() => applyPreset(preset)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          type='button'
          onClick={() => setShowCustom((v) => !v)}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            showCustom
              ? 'bg-primary text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Personalizado
        </button>
      </div>

      {/* Custom range inputs */}
      {showCustom ? (
        <div className='flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end'>
          <div className='flex-1'>
            <label className='mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500'>
              Desde
            </label>
            <input
              type='date'
              value={customFrom}
              max={customTo || todayIso()}
              onChange={(e) => setCustomFrom(e.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
            />
          </div>
          <div className='flex-1'>
            <label className='mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500'>
              Hasta
            </label>
            <input
              type='date'
              value={customTo}
              min={customFrom}
              max={todayIso()}
              onChange={(e) => setCustomTo(e.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
            />
          </div>
          <button
            type='button'
            onClick={applyCustom}
            disabled={!customFrom || !customTo || customTo < customFrom}
            className='w-full rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40 sm:w-auto'
          >
            Aplicar
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default DateRangeFilter;
