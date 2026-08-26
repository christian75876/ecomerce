// Los navegadores arrancan cualquier AudioContext en estado "suspended" hasta
// que haya una interacción real del usuario (click/tap/tecla) en la página —
// política de autoplay. Crear un contexto nuevo en cada notificación (como se
// hacía antes) significaba que casi nunca sonaba nada: cada contexto nacía
// suspendido y jamás se reanudaba. Se usa un único contexto compartido que se
// desbloquea con la primera interacción y se reanuda antes de cada sonido.
let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!sharedCtx) sharedCtx = new AudioContext();
    return sharedCtx;
  } catch {
    return null;
  }
}

function unlock() {
  void getContext()?.resume().catch(() => {});
}

if (typeof window !== 'undefined') {
  const opts = { once: true, passive: true } as const;
  window.addEventListener('pointerdown', unlock, opts);
  window.addEventListener('keydown', unlock, opts);
}

export function playNotificationSound(): void {
  const ctx = getContext();
  if (!ctx) return;

  const play = () => {
    const notes = [880, 1100];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  };

  try {
    if (ctx.state === 'suspended') {
      void ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch {
    // AudioContext unavailable or blocked — fail silently
  }
}
