'use client';

import { useEffect, useRef } from 'react';
import Renderer from '../class/Renderer';

type ThreeAPI = {
  focusStore: (duration?: number) => void;
  focusPlanet: (duration?: number) => void;
};

type ThreeRootProps = {
  /** Recibe el API de la escena cuando todo está listo */
  onReady?: (api: ThreeAPI) => void;
};

export default function ThreeRoot({ onReady }: ThreeRootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const renderer = new Renderer(canvas, container);
    rendererRef.current = renderer;

    // Entregamos el API público hacia el componente padre
    const api = renderer.getAPI();
    onReady?.(api);

    const onResize = () => {
      // El renderer ya escucha window.resize, pero si quieres asegurar:
      const w = container.clientWidth;
      const h = container.clientHeight;
      // Si añadiste un método resize en Renderer, puedes llamarlo aquí:
      // renderer.resize(w, h);
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.dispose?.();
      rendererRef.current = null;
    };
  }, [onReady]);

  return (
    <div
      id="container"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflowY: 'auto', // permite scroll si tu escena reacciona al scroll
      }}
    >
      <canvas
        id="bg"
        ref={canvasRef}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      {/* espacio extra si necesitas scroll */}
      <div style={{ height: 'auto' }} />
    </div>
  );
}
