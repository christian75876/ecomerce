// Storage.ts
import {
  Group,
  MathUtils,
  Scene,
  AnimationMixer,
  AnimationAction,
  AnimationClip,
  LoopRepeat,
  PointLight,
  Color,
  Mesh,
  SpotLight,
  Vector3,
  Box3,
  Light,
  SphereGeometry,
  AdditiveBlending,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  DoubleSide,
  SRGBColorSpace
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Storage {
  public object3d!: Group;
  private _ready = false;
  private _resolve?: () => void;
  private _readyPromise: Promise<void>;

  private mixer?: AnimationMixer;
  private clips: AnimationClip[] = [];
  private actions: Record<string, AnimationAction> = {};

  // Luces
  private interiorLight?: PointLight;
  private backSpot?: SpotLight;

  // tmp vectors para evitar GC en cada frame
  private _tmpCenter = new Vector3();
  private _tmpSize = new Vector3();
  private _tmpDir = new Vector3();
  private _tmpPos = new Vector3();
  private sceneRef: Scene;

  constructor(scene: Scene, loader: GLTFLoader) {
    this.sceneRef = scene;
    this._readyPromise = new Promise<void>(res => (this._resolve = res));

    loader.load('/storage.glb', gltf => {
      this.object3d = gltf.scene;
      this.clips = gltf.animations || [];

      this.configurarBase();
      scene.add(this.object3d);

      // Sombras en mallas
      this.object3d.traverse(obj => {
        const mesh = obj as Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      // Animación (hojas cayendo)
      if (this.clips.length > 0) {
        this.mixer = new AnimationMixer(this.object3d);
        const clip =
          AnimationClip.findByName(this.clips, 'Leaves') ||
          AnimationClip.findByName(this.clips, 'LeafFall') ||
          this.clips[0];
        const action = this.mixer.clipAction(clip);
        action.setLoop(LoopRepeat, Infinity);
        action.clampWhenFinished = false;
        action.enabled = true;
        action.play();
        this.actions[clip.name] = action;
      }

      this._ready = true;
      this._resolve?.();
    });
  }

  private configurarBase() {
    this.object3d.rotation.y = MathUtils.degToRad(30);
    this.object3d.rotation.x = MathUtils.degToRad(162);
    this.object3d.rotation.z = MathUtils.degToRad(180);
    this.object3d.position.x = -50;
    this.object3d.scale.set(10, 10, 10);
  }

  // ACTUALIZA posición/orientación del foco trasero en función de la cámara
  public updateBackLight(cameraWorldPos: Vector3) {
    if (!this.backSpot) return;

    const box = new Box3().setFromObject(this.object3d);
    box.getSize(this._tmpSize);
    box.getCenter(this._tmpCenter);

    this._tmpDir.copy(cameraWorldPos).sub(this._tmpCenter).normalize();

    const offset = Math.max(2.0, this._tmpSize.length() * 0.35);
    const lift = Math.max(0.25 * this._tmpSize.y, 1.0);

    this._tmpPos
      .copy(this._tmpCenter)
      .addScaledVector(this._tmpDir, -offset)
      .setY(this._tmpCenter.y + lift);

    // ⬇️ posiciones en WORLD directamente
    this.backSpot.position.copy(this._tmpPos);
    this.backSpot.target.position.copy(this._tmpCenter);
    this.backSpot.target.updateMatrixWorld();
  }

  // On/off e intensidad de la luz interior (ya lo tienes)
  public setInteriorLight(on: boolean) {
    if (!this.interiorLight) return;
    this.interiorLight.visible = on;
  }

  public setInteriorWarmth(intensity = 2.2, color = 0xffc58f) {
    if (!this.interiorLight) return;
    this.interiorLight.intensity = intensity;
    this.interiorLight.color.set(color);
  }

  public update(dt: number) {
    this.mixer?.update(dt);
  }

  public setSpeed(speed: number) {
    if (!this.mixer) return;
    this.mixer.timeScale = speed;
  }

  public play(name?: string) {
    if (!this.mixer || this.clips.length === 0) return;
    const clip = name
      ? AnimationClip.findByName(this.clips, name)
      : this.clips[0];
    if (!clip) return;
    const action = this.mixer.clipAction(clip);
    action.reset().play();
  }

  public whenReady() {
    return this._ready ? Promise.resolve() : this._readyPromise;
  }
}
