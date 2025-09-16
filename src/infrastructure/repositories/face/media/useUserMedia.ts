import { useEffect, useRef, useState } from 'react';

export function useUserMedia(
  constraints: MediaStreamConstraints = {
    video: {
      facingMode: 'user',
      width: { ideal: 720 },
      height: { ideal: 720 }
    },
    audio: false
  }
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        if (!active) return;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch (e: unknown) {
        setError('No se pudo acceder a la cámara');
      }
    })();
    return () => {
      active = false;
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return { videoRef, error };
}
