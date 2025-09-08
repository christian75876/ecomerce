import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { Group } from 'three';

export default class Loader {
  private gltf: GLTFLoader;

  constructor() {
    const draco = new DRACOLoader();
    draco.setDecoderPath('/draco/');
    draco.preload();

    this.gltf = new GLTFLoader();
    this.gltf.setDRACOLoader(draco);
  }

  load(url: string): Promise<Group> {
    return new Promise((resolve, reject) => {
      this.gltf.load(
        url,
        gltf => resolve(gltf.scene),
        undefined,
        err => reject(err)
      );
    });
  }
}
