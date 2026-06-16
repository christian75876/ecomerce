import { useNetworkStatus } from '@shared/hooks/useNetworkStatus';

const OfflineIndicator = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className='fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-slate-800 px-4 py-2 text-xs font-medium text-white shadow-lg'>
      <span className='h-2 w-2 rounded-full bg-red-400' />
      Sin conexión — mostrando contenido guardado
    </div>
  );
};

export default OfflineIndicator;
