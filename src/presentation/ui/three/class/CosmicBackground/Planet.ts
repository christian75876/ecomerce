import { Group, Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Planet {
  private object!: Group;
  private counter: number = 0;

  constructor(scene: Scene, loader: GLTFLoader) {
    loader.load('/scene.glb', gltf => {
      this.object = gltf.scene;
      this.posicionar();
      scene.add(this.object);
    });
    this.animate();
  }

  private posicionar() {
    this.object.translateY(2.5);
    this.object.scale.set(0.05, 0.05, 0.05);
  }

  private animate() {
    this.counter -= 0.01;
    if (this.object) this.object.rotation.y = Math.sin(this.counter) / 7 + 1.9;
    requestAnimationFrame(this.animate.bind(this));
  }
}
