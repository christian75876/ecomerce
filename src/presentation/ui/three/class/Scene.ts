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
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import Sun from './CosmicBackground/Sun';

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

  private flying = false;
  private flyDur = 0;
  private flyElapsed = 0;
  private camStart = new Vector3();
  private camEnd = new Vector3();
  private tgtStart = new Vector3();
  private tgtEnd = new Vector3();

  private storage!: Storage;
  private storeAnchor = new Group();

  private STORE_POS = new Vector3(70, 10, -40);

  private STORE_CAM_POS = new Vector3(68, 10, -20);

  // Target base (antes de offsets)
  private STORE_LOOK_AT = this.STORE_POS.clone();

  private STORE_LATERAL_OFFSET = 8;
  private STORE_VERTICAL_OFFSET = 3;

  private PLANET_CAM_POS = new Vector3(0, 2, 8);
  private PLANET_LOOK_AT = new Vector3(0, 0, 0);
  private sun!: Sun;
  private sunRight!: Sun;
  private sunLeft!: Sun;

  constructor(renderer: WebGLRenderer, container: HTMLElement) {
    super();
    this.renderer = renderer;

    this.camera = new Camara(container);
    this.camera.position.set(0, 5, 60);
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
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 200;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.renderer.domElement.addEventListener(
      'pointermove',
      this.onPointerMove,
      { passive: true }
    );

    this.planet = new Planet(this, loader);

    this.add(this.storeAnchor);
    this.storeAnchor.position.copy(this.STORE_POS);

    this.storage = new Storage(this, loader);
    this.storage.whenReady().then(() => {
      this.storeAnchor.add(this.storage.object3d);
      this.storage.object3d.position.set(0, 0, 0);
      this.storage.object3d.lookAt(
        this.STORE_POS.clone().add(new Vector3(0, 0, 1))
      );
    });
    this.sun = new Sun(this, 0xffbb66);
    this.sun.setPosition(70, 17.5, -40);
    this.sunRight = new Sun(this, 0xffbb66);
    this.sunRight.setPosition(70 + 6, 17.5, -40);
    this.sunLeft = new Sun(this, 0xffbb66);
    this.sunLeft.setPosition(70 - 5, 17.5, -40);
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.setAnimationLoop(this.update);
    this.focusPlanet(1.8);
  }

  public focusStore(duration = 1.0) {
    this.setStoreVisible(true);
    this.flyToWithOffset(
      this.STORE_CAM_POS,
      this.STORE_LOOK_AT,
      this.STORE_LATERAL_OFFSET,
      this.STORE_VERTICAL_OFFSET,
      duration
    );
  }

  public focusPlanet(duration = 1.6) {
    this.setStoreVisible(false);
    this.beginFlyTo(this.PLANET_CAM_POS, this.PLANET_LOOK_AT, duration);
  }

  private beginFlyTo(camEnd: Vector3, lookAtEnd: Vector3, duration = 1.6) {
    this.flying = true;
    this.flyElapsed = 0;
    this.flyDur = Math.max(0.01, duration);

    this.camStart.copy(this.camera.position);
    this.camEnd.copy(camEnd);

    this.tgtStart.copy(this.controls.target);
    this.tgtEnd.copy(lookAtEnd);

    this.controls.enabled = false;
  }

  private flyToWithOffset(
    camEnd: Vector3,
    lookAtEnd: Vector3,
    lateral = 0,
    vertical = 0,
    duration = 1.0
  ) {
    const viewDir = new Vector3().subVectors(lookAtEnd, camEnd).normalize();

    const right = new Vector3()
      .crossVectors(viewDir, this.camera.up)
      .normalize();
    const up = this.camera.up.clone().normalize();

    const shift = new Vector3()
      .addScaledVector(right, lateral)
      .addScaledVector(up, vertical);

    const camEndShifted = camEnd.clone().add(shift);
    const lookAtShifted = lookAtEnd.clone().add(shift);

    this.beginFlyTo(camEndShifted, lookAtShifted, duration);
  }

  private stepFly(dt: number) {
    if (!this.flying) return;

    this.flyElapsed += dt;
    const tRaw = Math.min(1, this.flyElapsed / this.flyDur);
    const t = easeInOutCubic(tRaw);

    this.camera.position.lerpVectors(this.camStart, this.camEnd, t);
    this.controls.target.lerpVectors(this.tgtStart, this.tgtEnd, t);

    this.camera.lookAt(this.controls.target);

    if (tRaw >= 1) {
      this.flying = false;
      this.controls.enabled = true;
      this.controls.update();
    }
  }

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

  private setStoreVisible(v: boolean) {
    this.storeAnchor.visible = v;
  }

  private update = () => {
    const dt = this.clock.getDelta();

    this.stepFly(dt);
    this.storage?.update(dt);
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
