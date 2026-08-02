import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa_install_dismissed_session';

function isIosDevice(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPad with desktop user-agent (iOS 13+)
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isIosSafari(): boolean {
  return (
    isIosDevice() &&
    /safari/i.test(navigator.userAgent) &&
    !/chrome|chromium|crios|fxios|opios/i.test(navigator.userAgent)
  );
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// ── iOS instructions banner ───────────────────────────────────────────────────

const IosBanner = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className='fixed bottom-0 left-0 right-0 z-[9998] bg-white shadow-[0_-4px_32px_rgba(15,23,42,0.14)] sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-2xl'>
    <div className='border-b border-slate-100 px-4 pb-3 pt-4'>
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10'>
          <i className='bx bx-mobile text-xl text-primary' aria-hidden='true' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-semibold text-slate-800'>Instalar Merku</p>
          <p className='text-xs text-slate-500'>Agrégala a tu pantalla de inicio para acceso rápido</p>
        </div>
        <button
          type='button'
          onClick={onDismiss}
          aria-label='Cerrar'
          className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100'
        >
          <i className='bx bx-x text-lg' aria-hidden='true' />
        </button>
      </div>
    </div>

    <div className='space-y-3 px-4 py-3'>
      {/* Step 1 */}
      <div className='flex items-center gap-3'>
        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white'>
          1
        </div>
        <p className='text-xs text-slate-600'>
          Toca el botón{' '}
          <span className='inline-flex items-center gap-0.5 font-semibold text-slate-800'>
            Compartir
            {/* iOS share icon */}
            <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' className='inline-block text-primary' aria-hidden='true'>
              <path d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-5.368m0 5.368 8.632 4.684M8.684 10.658l8.632-4.684m0 0a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684Zm0 9.342a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684Z'/>
            </svg>
          </span>{' '}
          en la barra de Safari
        </p>
      </div>

      {/* Step 2 */}
      <div className='flex items-center gap-3'>
        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white'>
          2
        </div>
        <p className='text-xs text-slate-600'>
          Desplázate y toca{' '}
          <span className='font-semibold text-slate-800'>"Agregar a pantalla de inicio"</span>
        </p>
      </div>

      {/* Step 3 */}
      <div className='flex items-center gap-3'>
        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white'>
          3
        </div>
        <p className='text-xs text-slate-600'>
          Toca <span className='font-semibold text-slate-800'>"Agregar"</span> para confirmar
        </p>
      </div>
    </div>

    {/* Caret pointing down to Safari bar */}
    <div className='flex justify-center pb-3'>
      <i className='bx bx-chevron-down text-2xl text-primary' aria-hidden='true' />
    </div>
  </div>
);

// ── Android / Chrome banner ───────────────────────────────────────────────────

const AndroidBanner = ({
  onInstall,
  onDismiss,
}: {
  onInstall: () => void;
  onDismiss: () => void;
}) => (
  <div className='fixed bottom-0 left-0 right-0 z-[9998] flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-3 shadow-xl sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-2xl sm:border'>
    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10'>
      <i className='bx bx-download text-xl text-primary' aria-hidden='true' />
    </div>
    <div className='min-w-0 flex-1'>
      <p className='text-sm font-semibold text-slate-800'>Instalar Merku</p>
      <p className='text-xs text-slate-500'>Accede rápido desde tu pantalla de inicio</p>
    </div>
    <div className='flex flex-shrink-0 items-center gap-2'>
      <button
        type='button'
        onClick={onDismiss}
        className='rounded-lg px-2 py-1.5 text-xs text-slate-400 transition hover:text-slate-600'
      >
        Ahora no
      </button>
      <button
        type='button'
        onClick={onInstall}
        className='rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90'
      >
        Instalar
      </button>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const PwaInstallBanner = () => {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    if (isInStandaloneMode()) return; // already installed

    // iOS Safari: no beforeinstallprompt, show manual instructions
    if (isIosSafari()) {
      setShowIos(true);
      return;
    }

    // Android / Chrome / Edge: use native prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShowAndroid(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setShowAndroid(false);
    setShowIos(false);
  };

  if (showIos) return <IosBanner onDismiss={handleDismiss} />;
  if (showAndroid) return <AndroidBanner onInstall={() => void handleInstall()} onDismiss={handleDismiss} />;
  return null;
};

export default PwaInstallBanner;
