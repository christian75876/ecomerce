interface AppBlockedScreenProps {
  message?: string | null;
}

const AppBlockedScreen = ({ message }: AppBlockedScreenProps) => (
  <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900'>
    <div className='mx-4 max-w-md rounded-3xl bg-slate-800 p-8 text-center shadow-2xl'>
      <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-700 text-4xl'>
        🔒
      </div>
      <h1 className='text-xl font-bold text-white'>App temporalmente cerrada</h1>
      <p className='mt-3 text-sm leading-relaxed text-slate-400'>
        {message || 'El marketplace está en mantenimiento. Vuelve pronto.'}
      </p>
      <p className='mt-6 text-xs text-slate-600'>Si eres administrador, inicia sesión para continuar.</p>
    </div>
  </div>
);

export default AppBlockedScreen;
