// /presentation/ui/molecules/auth/FaceLoginWithMesh.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useUserMedia } from '@/infrastructure/repositories/face/media/useUserMedia';
import { loadFaceApiModels } from '@/infrastructure/repositories/face/faceapiLoader';
import { captureSquare } from '@/shared/image/capture';
import { getFaceDescriptorFromCanvas } from '@/infrastructure/repositories/face/descriptor';
import Button from '../../atoms/button/SimpleButton';
import Loader from '../../atoms/loader/SimpleLoader';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

import { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_LIPS, FACEMESH_FACE_OVAL } from '@mediapipe/face_mesh';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { useLoginByFace } from '@/application/useCases/auth/useLoginByFace';

type Props = {
  open: boolean;
  onClose: () => void;
};

const FaceLoginWithMesh: React.FC<Props> = ({ open, onClose }) => {
  const { videoRef, error: camError } = useUserMedia();
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { handleLoginByFace, loading } = useLoginByFace();

  useEffect(() => {
    if (!open) return;

    let rafId = 0;
    let faceMesh: FaceMesh | null = null;

    async function init() {
      try {
        await Promise.all([loadFaceApiModels()]);
        faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMesh.setOptions({
          selfieMode: true,
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((res) => {
          const video = videoRef.current!;
          const canvas = overlayRef.current!;
          if (!video || !canvas) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (!res.multiFaceLandmarks || res.multiFaceLandmarks.length === 0) return;

          const lm = res.multiFaceLandmarks[0];
          drawConnectors(ctx, lm, FACEMESH_TESSELATION);
          drawConnectors(ctx, lm, FACEMESH_RIGHT_EYE);
          drawConnectors(ctx, lm, FACEMESH_LEFT_EYE);
          drawConnectors(ctx, lm, FACEMESH_LIPS);
          drawConnectors(ctx, lm, FACEMESH_FACE_OVAL);
          drawLandmarks(ctx, lm, { radius: 0.5 });
        });

        const loop = async () => {
          if (videoRef.current && faceMesh) {
            await faceMesh.send({ image: videoRef.current });
          }
          rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        setReady(true);
      } catch (e) {
        setMsg('No pudimos iniciar la cámara o cargar los modelos.');
      }
    }

    init();

    return () => {
      cancelAnimationFrame(rafId);
      faceMesh?.close();
    };
  }, [open, videoRef]);

  const doLogin = async () => {
    if (!videoRef.current) return;
    setMsg(null);

    // Toma cuadrada y saca el descriptor 128-D
    const square = captureSquare(videoRef.current, 720);
    const desc = await getFaceDescriptorFromCanvas(square, 0.6);
    if (!desc) {
      setMsg('No se pudo extraer un descriptor. Ajusta luz/encuadre y reintenta.');
      SnackbarUtilities.error('No detectamos suficiente calidad', 'top', 'center');
      return;
    }

    const res = await handleLoginByFace(desc, 0.55);
    if (res) onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4">
        <div className="text-lg font-semibold mb-2">Iniciar sesión con rostro</div>

        <div className="relative">
          <video ref={videoRef} className="w-full rounded-xl bg-black" playsInline />
          <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>

        {camError && <div className="text-red-600 text-sm mt-2">⚠ {camError}</div>}
        {msg && <div className="text-sm mt-2">{msg}</div>}

        <div className="mt-3 flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={doLogin} disabled={!ready ||  loading}>
            {( loading) ? <Loader color="primary" /> : 'Entrar con mi rostro'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FaceLoginWithMesh;
