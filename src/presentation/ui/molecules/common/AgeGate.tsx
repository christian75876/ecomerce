import { useState, useEffect } from 'react';

interface AgeGateProps {
  storeName: string;
  onVerified: () => void;
  onDenied: () => void;
}

const SESSION_KEY = 'age_verified_stores';

const getVerifiedStores = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
};

export const markStoreVerified = (storeId: string) => {
  const list = getVerifiedStores();
  if (!list.includes(storeId)) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...list, storeId]));
  }
};

export const isStoreVerified = (storeId: string): boolean =>
  getVerifiedStores().includes(storeId);

const AgeGate = ({ storeName, onVerified, onDenied }: AgeGateProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // pequeño delay para la animación de entrada
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md px-4'>
      <div className={`w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-900 p-8 text-center shadow-[0_32px_80px_rgba(0,0,0,0.5)] transition-all duration-300 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Icon */}
        <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15'>
          <i className='bx bx-shield-x text-4xl text-red-400' aria-hidden='true' />
        </div>

        {/* Text */}
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>Contenido para adultos</p>
        <h1 className='mt-2 text-2xl font-extrabold text-white'>¿Eres mayor de edad?</h1>
        <p className='mt-3 text-sm text-slate-400'>
          La tienda <strong className='text-white'>«{storeName}»</strong> contiene productos para adultos (+18).
          Al continuar confirmas que tienes 18 años o más.
        </p>

        {/* Disclaimer */}
        <div className='mt-4 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-xs text-slate-400'>
          El acceso a menores de edad a este contenido está prohibido por la ley.
        </div>

        {/* Actions */}
        <div className='mt-6 flex flex-col gap-3'>
          <button
            type='button'
            onClick={onVerified}
            className='w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-95'
          >
            Sí, soy mayor de 18 años — Entrar
          </button>
          <button
            type='button'
            onClick={onDenied}
            className='w-full rounded-2xl border border-slate-700 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white active:scale-95'
          >
            No, salir
          </button>
        </div>

        <p className='mt-4 text-[11px] text-slate-600'>
          La verificación se guarda durante esta sesión del navegador.
        </p>
      </div>
    </div>
  );
};

export default AgeGate;
