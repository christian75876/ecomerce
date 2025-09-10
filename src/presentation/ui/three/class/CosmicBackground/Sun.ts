// Sun.ts
import {
  Scene,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  AdditiveBlending,
  PointLight,
  Group,
  Color
} from 'three';

export default class Sun {
  private group: Group;
  private core: Mesh;
  private light: PointLight;
  private time = 0;

  constructor(scene: Scene, color: number = 0xffee99) {
    this.group = new Group();

    // ---- Núcleo visible (auto-iluminado)
    const geom = new SphereGeometry(0.5, 80, 80);
    const mat = new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 1.0,
      blending: AdditiveBlending,
      depthWrite: false
    });
    this.core = new Mesh(geom, mat);
    this.group.add(this.core);

    // ---- Luz real que irradia
    this.light = new PointLight(color, 250, 200, 2); // intensidad alta
    this.light.castShadow = false;
    this.group.add(this.light);

    // ---- Añadir al mundo
    scene.add(this.group);
  }

  // posiciona el sol en el mundo
  public setPosition(x: number, y: number, z: number) {
    this.group.position.set(x, y, z);
  }

  // animación tipo "pulso solar"
  public update(dt: number) {
    this.time += dt;

    // pulso suave en la escala
    const scale = 1 + 0.1 * Math.sin(this.time * 2.0);
    this.core.scale.set(scale, scale, scale);

    // variación de la intensidad de la luz
    this.light.intensity = 220 + 60 * Math.sin(this.time * 3.0);
  }

  // cambiar color dinámicamente
  public setColor(hex: number) {
    (this.core.material as MeshBasicMaterial).color = new Color(hex);
    this.light.color.set(hex);
  }
}
