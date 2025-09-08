// presentation/ui/three/ThreeRoot.tsx
'use client';

import { useEffect, useRef } from 'react';
import Renderer from '../class/Renderer';
import BgAnimate from '../../molecules/auth/BgAnimate';

export default function ThreeRoot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const renderer = new Renderer(canvas, container);

    return () => {
      renderer.dispose?.();
    };
  }, []);

  return (
    <div
      id="container"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflowY: 'auto',       // ⬅️ Importante para que haya scroll
      }}
    >
      <canvas id="bg" ref={canvasRef} style={{ position: 'sticky', top: 0, width: '100%', height: '100%' }} />
      {/* contenido de prueba para crear scroll */}
      <div style={{ height: 'auto' }} />
      
    </div>
  );
}
