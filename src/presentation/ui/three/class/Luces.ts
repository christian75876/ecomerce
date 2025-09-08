import { AmbientLight, DirectionalLight, Group, Scene } from 'three';

export default class Luces {
  public readonly object3d: Group;

  constructor(scene: Scene) {
    this.object3d = new Group();

    const ambient = new AmbientLight(0xffffff, 0.6);
    const dir = new DirectionalLight(0xffffff, 1);
    const sol = new DirectionalLight(0xffffff, 0.5);
    sol.position.set(20, 20, 5);
    dir.position.set(5, 10, 7);
    scene.add(sol);
    this.object3d.add(ambient);
    this.object3d.add(dir);
  }
}
