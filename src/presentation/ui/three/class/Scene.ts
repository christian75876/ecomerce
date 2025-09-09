// Scene.ts
import {
  Clock,
  Float32BufferAttribute,
  Group,
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
import Storage from './CosmicBackground/Storage';

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

  // ---- vuelo genérico (posición y target) ----
  private flying = false;
  private flyDur = 0;
  private flyElapsed = 0;
  private camStart = new Vector3();
  private camEnd = new Vector3();
  private tgtStart = new Vector3();
  private tgtEnd = new Vector3();

  // ---- tienda ----
  private storage!: Storage;
  private storeAnchor = new Group();
  private STORE_POS = new Vector3(80, 6, -40); // <- coloca la tienda donde quieras
  private STORE_CAM_POS = new Vector3(70, 10, -20); // <- cámara cuando entras a la tienda
  private STORE_LOOK_AT = this.STORE_POS.clone(); // <- mira hacia el anchor (tienda)

  // ---- planeta (para volver) ----
  private PLANET_CAM_POS = new Vector3(0, 8, 22);
  private PLANET_LOOK_AT = new Vector3(0, 0, 0);

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

    // Planeta (asumo que Planet añade su object3d a la escena)
    this.planet = new Planet(this, loader);

    // ---- Tienda: ancla y modelo ----
    this.add(this.storeAnchor);
    this.storeAnchor.position.copy(this.STORE_POS);

    this.storage = new Storage(this, loader);
    this.storage.whenReady().then(() => {
      // CUELGA el storage del anchor de tienda (para mover todo el conjunto si quieres)
      this.storeAnchor.add(this.storage.object3d);
      this.storage.object3d.position.set(0, 0, 0); // relativo al anchor
      this.storage.object3d.lookAt(
        this.STORE_POS.clone().add(new Vector3(0, 0, 1))
      ); // orientación suave
    });

    this.renderer.setAnimationLoop(this.update);

    // primer enfoque (si quieres animación inicial hacia planet)
    this.focusPlanet(1.8);
  }

  // ---------- API pública para UI ----------
  /** Llévame a la tienda */
  public focusStore(duration = 1.6) {
    this.beginFlyTo(this.STORE_CAM_POS, this.STORE_LOOK_AT, duration);
  }

  /** Llévame al planeta (o vista principal) */
  public focusPlanet(duration = 1.6) {
    this.beginFlyTo(this.PLANET_CAM_POS, this.PLANET_LOOK_AT, duration);
  }

  // ---------- Vuelo genérico ----------
  private beginFlyTo(camEnd: Vector3, lookAtEnd: Vector3, duration = 1.6) {
    this.flying = true;
    this.flyElapsed = 0;
    this.flyDur = Math.max(0.01, duration);

    // origen = estado actual
    this.camStart.copy(this.camera.position);
    this.camEnd.copy(camEnd);

    this.tgtStart.copy(this.controls.target);
    this.tgtEnd.copy(lookAtEnd);

    this.controls.enabled = false;
  }

  private stepFly(dt: number) {
    if (!this.flying) return;

    this.flyElapsed += dt;
    const tRaw = Math.min(1, this.flyElapsed / this.flyDur);
    const t = easeInOutCubic(tRaw);

    // interpolar posición de cámara y target
    this.camera.position.lerpVectors(this.camStart, this.camEnd, t);
    this.controls.target.lerpVectors(this.tgtStart, this.tgtEnd, t);

    this.camera.lookAt(this.controls.target);

    if (tRaw >= 1) {
      this.flying = false;
      this.controls.enabled = true;
      this.controls.update();
    }
  }

  // ---------- Input ----------
  private onPointerMove = (ev: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = this.mouse;
    mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(mouse, this.camera);
    const hitGalaxy = this.raycaster.intersectObject(this.galaxy.points, false);
    if (hitGalaxy.length > 0) {
      const p = hitGalaxy[0].point.clone();
      this.galaxy.points.worldToLocal(p);
      this.galaxy.attract(p, 25, 10);

      const pos = this.galaxy.points.geometry.getAttribute(
        'position'
      ) as Float32BufferAttribute;
      const hit = hitGalaxy[0];
      if (typeof hit.index === 'number') {
        const i3 = hit.index * 3;
        pos.array[i3 + 1] += 20;
        pos.needsUpdate = true;
        this.galaxy.points.geometry.computeBoundingSphere();
      }
    }
  };

  // ---------- Loop ----------
  private update = () => {
    const dt = this.clock.getDelta();

    // vuelo de cámara/target
    this.stepFly(dt);

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
