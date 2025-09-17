import React, { useEffect, useRef, useState } from "react";
import { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_LIPS, FACEMESH_FACE_OVAL } from "@mediapipe/face_mesh";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { loadFaceApiModels } from "@/infrastructure/repositories/face/faceapiLoader";
import { useUserMedia } from "@/infrastructure/repositories/face/media/useUserMedia";
import { captureSquare } from "@/shared/image/capture";
import { getFaceDescriptorFromCanvas } from "@/infrastructure/repositories/face/descriptor";

type Step = "consent" | "capture" | "review" | "done";

export default function FaceEnrollWithMesh({
  userId,
  open,
  onClose,
  onComplete
}: { userId?: string | number; open: boolean; onClose: () => void; onComplete?: (result: { descriptors: number[][]; previews: string[] }) => void; }) {
  if (!open) return null; // Modal controlado por el padre

  const { videoRef, error } = useUserMedia();
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  const [ready, setReady] = useState(false);
  const [vectors, setVectors] = useState<number[][]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("consent");
  const [msg, setMsg] = useState<string | null>(null);

  // Dibuja el cuadro/elipse guía
  const drawGuide = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const pad = Math.min(w, h) * 0.08;
    const gw = w - pad * 2;
    const gh = h - pad * 2;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, gw * 0.35, gh * 0.45, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "center";
    ctx.fillText("Alinea tu rostro dentro de la guía", w / 2, h - pad * 0.6);
    ctx.restore();
  };

  // Inicializa models + FaceMesh y bucle
  useEffect(() => {
    let rafId = 0;
    let faceMesh: FaceMesh | null = null;

    async function init() {
      await loadFaceApiModels();

      // Espera dimensiones reales del video
      await new Promise<void>((resolve) => {
        const v = videoRef.current!;
        if (v?.videoWidth && v?.videoHeight) return resolve();
        const onLoaded = () => {
          v.removeEventListener("loadedmetadata", onLoaded);
          resolve();
        };
        v.addEventListener("loadedmetadata", onLoaded, { once: true });
      });

      faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        selfieMode: true, // OJO: propiedad correcta
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((res) => {
        const video = videoRef.current!;
        const canvas = overlayRef.current!;
        if (!video || !canvas) return;

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Guía primero
        drawGuide(ctx, canvas.width, canvas.height);

        // Malla
        const lm = res.multiFaceLandmarks?.[0];
        if (!lm) return;
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
    }

    init();

    return () => {
      cancelAnimationFrame(rafId);
      faceMesh?.close();
      // corta cámara al cerrar el modal
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = () => setStep("capture");

  const takeShot = async () => {
    if (!videoRef.current) return;
    setMsg(null);

    const square = captureSquare(videoRef.current, 720);
    const desc = await getFaceDescriptorFromCanvas(square, 0.6);
    if (!desc) {
      setMsg("No se pudo extraer un descriptor con calidad suficiente. Ajusta luz/encuadre y reintenta.");
      return;
    }

    setPreviews((p) => [...p, square.toDataURL("image/jpeg", 0.9)]);
    setVectors((v) => [...v, desc]);
    if (vectors.length + 1 >= 3) setStep("review");
  };

  const reset = () => { setVectors([]); setPreviews([]); setMsg(null); setStep("capture"); };
  const submit = async () => { if (onComplete) onComplete({ descriptors: vectors, previews });
    onClose(); };

  if (error) return <div className="p-4">⚠️ {error}</div>;

  return (
    // OVERLAY A PANTALLA COMPLETA, CENTRADO
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      {/* Cuadro centrado: máx 420px o 92vw, alto por aspect-ratio 3/4 */}
      <div
        className="relative w-[min(92vw,420px)] rounded-2xl overflow-hidden shadow-2xl bg-black"
        style={{ aspectRatio: "3 / 4" }}
      >
        {/* Video y canvas ocupan TODO el cuadro */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          autoPlay
          muted   // iOS requiere muted para auto-play
        />
        <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-full bg-black/60 text-white"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Controles flotantes */}
        {step === "consent" && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
            <p className="text-xs mb-2">Muestra tu rostro dentro del cuadro para capturar 3 tomas.</p>
            <button className="btn" onClick={start} disabled={!ready}>
              {ready ? "Continuar" : "Cargando…"}
            </button>
          </div>
        )}

        {step === "capture" && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white flex items-center justify-between">
            <span className="text-xs opacity-80">Tomas: {vectors.length}/3</span>
            <button className="btn" onClick={takeShot} disabled={!ready}>Capturar</button>
          </div>
        )}

        {step === "review" && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
            <div className="grid grid-cols-3 gap-2 mb-2">
              {previews.map((p, i) => <img key={i} src={p} className="rounded" />)}
            </div>
            <div className="flex gap-2">
              <button className="btn-outline" onClick={reset}>Repetir</button>
              <button className="btn" onClick={submit} disabled={vectors.length < 3}>Confirmar</button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-green-600/80 text-white">
            Registro completado ✅
          </div>
        )}

        {msg && (
          <div className="absolute left-3 right-3 bottom-20 text-xs text-white/90">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
