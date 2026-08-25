import { useState } from 'react';
import { PosGuestInfo } from '@/application/useCases/pos/usePosManagement';

const DOC_TYPES = [
  { value: 'CC',  label: 'CC' },
  { value: 'CE',  label: 'CE' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PP',  label: 'PP' },
  { value: 'TI',  label: 'TI' },
];

interface Props {
  guestName: string;
  guestPhone: string;
  guestDocType: string;
  guestDoc: string;
  deliveryType: PosGuestInfo['deliveryType'];
  deliveryAddress: string;
  deliveryCity: string;
  deliveryNotes: string;
  submitting: boolean;
  error: string | null;
  onGuestNameChange: (v: string) => void;
  onGuestPhoneChange: (v: string) => void;
  onGuestDocTypeChange: (v: string) => void;
  onGuestDocChange: (v: string) => void;
  onDeliveryTypeChange: (v: PosGuestInfo['deliveryType']) => void;
  onDeliveryAddressChange: (v: string) => void;
  onDeliveryCityChange: (v: string) => void;
  onDeliveryNotesChange: (v: string) => void;
  onConfirm: () => Promise<boolean>;
  onClose: () => void;
}

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-slate-500';

export const PosGuestModal = ({
  guestName,
  guestPhone,
  guestDocType,
  guestDoc,
  deliveryType,
  deliveryAddress,
  deliveryCity,
  deliveryNotes,
  submitting,
  error,
  onGuestNameChange,
  onGuestPhoneChange,
  onGuestDocTypeChange,
  onGuestDocChange,
  onDeliveryTypeChange,
  onDeliveryAddressChange,
  onDeliveryCityChange,
  onDeliveryNotesChange,
  onConfirm,
  onClose,
}: Props) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!guestName.trim()) {
      setValidationError('El nombre del cliente es requerido');
      return;
    }
    setValidationError(null);
    const ok = await onConfirm();
    if (ok) onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center'>
      <div className='w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl'>

        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
          <div>
            <h2 className='text-base font-semibold text-slate-800'>Datos del cliente</h2>
            <p className='mt-0.5 text-xs text-slate-400'>Para el comprobante y guía de envío</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100'
          >
            <i className='bx bx-x text-xl' />
          </button>
        </div>

        <div className='max-h-[70vh] overflow-y-auto'>
          <div className='space-y-4 px-6 py-5'>

            {/* Nombre */}
            <div>
              <label className='mb-1 block text-xs font-semibold text-slate-500'>
                Nombre completo <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                placeholder='Ej. Juan García'
                value={guestName}
                onChange={(e) => { onGuestNameChange(e.target.value); setValidationError(null); }}
                className={`${field} ${validationError && !guestName.trim() ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
              />
            </div>

            {/* Documento */}
            <div>
              <label className='mb-1 block text-xs font-semibold text-slate-500'>Documento de identidad</label>
              <div className='flex gap-2'>
                <select
                  value={guestDocType}
                  onChange={(e) => onGuestDocTypeChange(e.target.value)}
                  className='shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
                >
                  {DOC_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>{dt.value}</option>
                  ))}
                </select>
                <input
                  type='text'
                  placeholder='Número de documento'
                  value={guestDoc}
                  onChange={(e) => onGuestDocChange(e.target.value)}
                  className={`${field} flex-1 min-w-0`}
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className='mb-1 block text-xs font-semibold text-slate-500'>
                Teléfono <span className='font-normal text-slate-400'>(para enviar comprobante)</span>
              </label>
              <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'>
                <i className='bx bxl-whatsapp shrink-0 text-lg text-green-500' />
                <input
                  type='tel'
                  placeholder='Ej. 3001234567'
                  value={guestPhone}
                  onChange={(e) => onGuestPhoneChange(e.target.value)}
                  className='min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500'
                />
              </div>
            </div>

            {/* Delivery type */}
            <div>
              <label className='mb-2 block text-xs font-semibold text-slate-500'>Tipo de entrega</label>
              <div className='grid grid-cols-2 gap-2'>
                {([
                  { value: 'LOCAL',    icon: 'bx-store',    label: 'Retiro en local' },
                  { value: 'SHIPPING', icon: 'bx-package',  label: 'Envío a domicilio' },
                ] as const).map(({ value, icon, label }) => (
                  <button
                    key={value}
                    type='button'
                    onClick={() => onDeliveryTypeChange(deliveryType === value ? '' : value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-semibold transition ${
                      deliveryType === value
                        ? 'border-primary bg-primary/[0.06] text-primary'
                        : 'border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    <i className={`bx ${icon} text-xl`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shipping fields */}
            {deliveryType === 'SHIPPING' && (
              <div className='space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3'>
                <p className='flex items-center gap-1.5 text-xs font-semibold text-blue-600'>
                  <i className='bx bx-map-pin' /> Datos de envío
                </p>
                <input
                  type='text'
                  placeholder='Dirección completa'
                  value={deliveryAddress}
                  onChange={(e) => onDeliveryAddressChange(e.target.value)}
                  className={field}
                />
                <input
                  type='text'
                  placeholder='Ciudad / Municipio'
                  value={deliveryCity}
                  onChange={(e) => onDeliveryCityChange(e.target.value)}
                  className={field}
                />
                <textarea
                  placeholder='Notas para el mensajero (apto, referencia, horario…)'
                  value={deliveryNotes}
                  onChange={(e) => onDeliveryNotesChange(e.target.value)}
                  rows={2}
                  className={`${field} resize-none`}
                />
              </div>
            )}

            {/* Error */}
            {(validationError ?? error) && (
              <div className='flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600'>
                <i className='bx bx-error-circle shrink-0' />
                {validationError ?? error}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='border-t border-slate-100 px-6 py-4'>
          <button
            type='button'
            onClick={() => void handleConfirm()}
            disabled={submitting}
            className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60'
          >
            {submitting ? (
              <><i className='bx bx-loader-alt animate-spin text-base' /> Procesando…</>
            ) : (
              <><i className='bx bx-check-circle text-base' /> Confirmar venta</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
