// presentation/ui/three/scenes/BasicCube.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  className?: string;
  style?: React.CSSProperties;
  bgTransparent?: boolean; // true = canvas sin color de fondo
};

export default function BasicCube({
  className,
  style,
  bgTransparent = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: bgTransparent,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    if (bgTransparent) {
      renderer.setClearColor(0x000000, 0);
    } else {
      renderer.setClearColor(0x101218, 1); // gris azulado
    }

    // que el canvas llene el contenedor
    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      100
    );
    camera.position.set(0, 1.2, 4);
    camera.lookAt(0, 0, 0);

    // Luz (opcional: para Lambert/Phong/Standard)
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial()
    );
    scene.add(cube);

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // Loop
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      const dt = clock.getDelta();
      cube.rotation.x += dt * 0.8;
      cube.rotation.y += dt * 1.1;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(canvas)) container.removeChild(canvas);
    };
  }, [bgTransparent]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
}
