import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa_install_dismissed';

const PwaInstallBanner = () => {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-[9998] flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-3 shadow-xl sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-2xl sm:border'>
      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10'>
        <i className='bx bx-download text-xl text-primary' aria-hidden='true' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-slate-800'>Instalar Hot Commerce</p>
        <p className='text-xs text-slate-500'>Accede rápido desde tu pantalla de inicio</p>
      </div>
      <div className='flex flex-shrink-0 items-center gap-2'>
        <button
          type='button'
          onClick={handleDismiss}
          className='rounded-lg px-2 py-1.5 text-xs text-slate-400 transition hover:text-slate-600'
        >
          Ahora no
        </button>
        <button
          type='button'
          onClick={() => void handleInstall()}
          className='rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90'
        >
          Instalar
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
