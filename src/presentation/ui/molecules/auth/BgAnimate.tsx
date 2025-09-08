import React, { useEffect, useRef, useLayoutEffect } from "react";

type Axis = "xy" | "x" | "y";
type Mode = "attract" | "repel";

type BlobCfg = {
  ref: React.RefObject<HTMLSpanElement>;
  mode: Mode;             
  axis?: Axis;           
  strength: number;       
  damp: number;            
  amp: number;            
  speed: number;           
  phase: number;          
  minScale?: number;       
  maxScale?: number;       
};

const BgAnimate: React.FC = () => {
  const b1 = useRef<HTMLSpanElement>(null);
  const b2 = useRef<HTMLSpanElement>(null);
  const b3 = useRef<HTMLSpanElement>(null);
  const b4 = useRef<HTMLSpanElement>(null);

  const anchors = useRef<{ x: number; y: number }[]>([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);

  const cfg: BlobCfg[] = [
    // se ACERCA al mouse (parallax suave), reacciona en XY
    { ref: b1, mode: "attract", axis: "xy", strength: 0.18, damp: 0.09, amp: 12, speed: 0.30, phase: 0.0, minScale: 0.95, maxScale: 1.15 },
    // se ALEJA del mouse (repulsión), sólo en X
    { ref: b2, mode: "repel",   axis: "x",  strength: 0.20, damp: 0.10, amp: 10, speed: 0.25, phase: 1.3, minScale: 0.92, maxScale: 1.05 },
    // se ACERCA, sólo en Y (sube/baja al pasar)
    { ref: b3, mode: "attract", axis: "y",  strength: 0.14, damp: 0.08, amp: 14, speed: 0.20, phase: 2.7, minScale: 0.96, maxScale: 1.10 },
    // se ALEJA, en XY pero más nervioso
    { ref: b4, mode: "repel",   axis: "xy", strength: 0.26, damp: 0.11, amp:  8, speed: 0.35, phase: 4.1, minScale: 0.9,  maxScale: 1.06 },
  ];

  const cur = useRef(cfg.map(() => ({ x: 0, y: 0 })));

  const recalcAnchors = () => {
    cfg.forEach((c, i) => {
      const el = c.ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      anchors.current[i].x = r.left + r.width / 2;
      anchors.current[i].y = r.top + r.height / 2;
    });
  };

  useLayoutEffect(() => {
    recalcAnchors();
    const onResize = () => recalcAnchors();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      const t = performance.now() / 1000;

      cfg.forEach((c, i) => {
        const el = c.ref.current;
        if (!el) return;

        const anchor = anchors.current[i];

        let dx = mouseX - anchor.x;
        let dy = mouseY - anchor.y;

        const sgn = c.mode === "attract" ? +1 : -1;

        if (c.axis === "x") dy = 0;
        if (c.axis === "y") dx = 0;

        // destino con fuerza
        const tx = sgn * dx * c.strength;
        const ty = sgn * dy * c.strength;

        cur.current[i].x += (tx - cur.current[i].x) * c.damp;
        cur.current[i].y += (ty - cur.current[i].y) * c.damp;

        const fx = Math.sin(t * c.speed + c.phase) * c.amp;
        const fy = Math.cos(t * c.speed + c.phase) * c.amp;

        const x = reduce ? 0 : cur.current[i].x + fx;
        const y = reduce ? 0 : cur.current[i].y + fy;

        const dist = Math.hypot(dx, dy);
        const nd = Math.min(1, dist / 400);
        const minS = c.minScale ?? 1;
        const maxS = c.maxScale ?? 1;
        const s =
          c.mode === "attract"
            ? maxS - (maxS - minS) * nd 
            : minS + (maxS - minS) * nd; 

        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      });

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <span
        ref={b1}
        className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl"
      />
      <span
        ref={b2}
        className="absolute top-24 right-[-6rem] w-64 h-64 rounded-full bg-secondary20 blur-3xl"
      />
      <span
        ref={b3}
        className="absolute bottom-[-4rem] left-1/3 w-80 h-80 rounded-full bg-primary-light/35 blur-[80px]"
      />
      <span
        ref={b4}
        className="absolute top-1/2 left-[-3rem] w-40 h-40 rounded-full bg-secondary-light/35 blur-2xl"
      />

      
    </div>
  );
};

export default BgAnimate;
