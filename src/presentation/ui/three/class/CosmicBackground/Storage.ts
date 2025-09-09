// Storage.ts
import { Group, MathUtils, Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Storage {
  public object3d!: Group;
  private _ready = false;
  private _resolve?: () => void;
  private _readyPromise: Promise<void>;

  constructor(scene: Scene, loader: GLTFLoader) {
    this._readyPromise = new Promise<void>(res => (this._resolve = res));

    loader.load('/storage.glb', gltf => {
      this.object3d = gltf.scene;
      this.configurarBase(); // solo escala/orientación base
      scene.add(this.object3d); // agregar a la escena (NO al planeta)
      this._ready = true;
      this._resolve?.();
    });
  }

  private configurarBase() {
    // Y: -90° base y +10° extra hacia la izquierda (ajusta el 10 a tu gusto)
    this.object3d.rotation.y = MathUtils.degToRad(-220 + 10);
    // X: 142° si de verdad lo querías en grados
    this.object3d.rotation.x = MathUtils.degToRad(162);

    this.object3d.scale.set(10, 10, 10);
  }

  public whenReady() {
    return this._ready ? Promise.resolve() : this._readyPromise;
  }
}
