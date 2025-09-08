import {
  Clock,
  Float32BufferAttribute,
  Raycaster,
  Scene as ThreeScene,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import Camara from '../class/Camara';
import Luces from '../class/Luces';
import Galaxy from './Galaxy';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Planet from './CosmicBackground/Planet';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Starfield } from './CosmicBackground/Starfield';

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default class Scene extends ThreeScene {
  private camera: Camara;
  private renderer: WebGLRenderer;
  private clock = new Clock();
  private controls!: OrbitControls;
  private galaxy!: Galaxy;
  private planet!: Planet;
  private raycaster!: Raycaster;
  private mouse = new Vector2();
  private tmp = new Vector3();
  private autoZoomActive = false;
  private autoZoomDuration = 0;
  private autoZoomElapsed = 0;
  private autoZoomStart = new Vector3();
  private autoZoomEnd = new Vector3();

  constructor(renderer: WebGLRenderer, container: HTMLElement) {
    super();
    this.renderer = renderer;

    this.camera = new Camara(container);
    this.camera.position.set(0, 10, 120);
    this.camera.updateProjectionMatrix();

    const luces = new Luces(this);
    this.add(luces.object3d);

    this.raycaster = new Raycaster();
    this.raycaster.params.Points = this.raycaster.params.Points || {};
    this.raycaster.params.Points.threshold = 16;

    this.galaxy = new Galaxy(this, {
      count: 18000,
      radius: 150,
      branches: 5,
      spin: 1.4,
      randomness: 0.28,
      randomnessPower: 2.8,
      insideColor: '#ff6d33',
      outsideColor: '#0000ff',
      size: 0.09,
      rotationSpeed: 0.2
    });

    const loader = new GLTFLoader();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.renderer.domElement.addEventListener(
      'pointermove',
      this.onPointerMove,
      { passive: true }
    );
    this.planet = new Planet(this, loader);
    this.renderer.setAnimationLoop(this.update);
    this.beginAutoZoom(8, 1.8, 6, 40);
  }

  public beginAutoZoom(
    targetDistance = 12,
    duration = 2.5,
    topOffsetY = 6,
    maxStartDistance = 40
  ) {
    if (!this.controls) return;

    const target = this.controls.target;
    const dir = this.camera.position.clone().sub(target).normalize();
    const currentDist = this.camera.position.distanceTo(target);

    // 1) Si empieza muy lejos, acércala de una a un radio tope (p.e. 40)
    if (currentDist > maxStartDistance) {
      this.camera.position.copy(target).addScaledVector(dir, maxStartDistance);
      this.camera.lookAt(target);
    }

    // 2) Configurar el lerp desde la POSICIÓN ACTUAL (ya “cerca”) hasta el destino
    this.autoZoomStart.copy(this.camera.position);
    this.autoZoomEnd.copy(target).addScaledVector(dir, targetDistance);
    this.autoZoomEnd.y += topOffsetY;

    this.autoZoomDuration = Math.max(0.01, duration);
    this.autoZoomElapsed = 0;
    this.autoZoomActive = true;
    this.controls.enabled = false;
  }

  private onPointerMove = (ev: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitGalaxy = this.raycaster.intersectObject(this.galaxy.points, false);
    if (hitGalaxy.length > 0) {
      const p = hitGalaxy[0].point.clone();
      this.galaxy.points.worldToLocal(p);
      this.galaxy.attract(p, 25, 10);
    }

    if (hitGalaxy.length > 0) {
      const hit = hitGalaxy[0];
      const pos = this.galaxy.points.geometry.getAttribute(
        'position'
      ) as Float32BufferAttribute;
      if (typeof hit.index === 'number') {
        const i3 = hit.index * 3;
        pos.array[i3 + 1] += 20;
        pos.needsUpdate = true;
        this.galaxy.points.geometry.computeBoundingSphere();
      }
    }
  };

  private update = () => {
    const dt = this.clock.getDelta();
    if (this.autoZoomActive) {
      this.autoZoomElapsed += dt;
      const tRaw = Math.min(1, this.autoZoomElapsed / this.autoZoomDuration);
      const t = easeInOutCubic(tRaw);

      this.camera.position.lerpVectors(this.autoZoomStart, this.autoZoomEnd, t);

      this.camera.lookAt(this.controls.target);

      if (tRaw >= 1) {
        this.autoZoomActive = false;
        this.controls.enabled = true;
        this.controls.update();
      }
    }
    this.galaxy.update?.(dt);
    this.controls.update();
    this.renderer.render(this, this.camera);
  };

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.renderer.domElement.removeEventListener(
      'pointermove',
      this.onPointerMove
    );
    this.controls.dispose();
    this.galaxy.dispose();
    this.camera.dispose();
  }
}
