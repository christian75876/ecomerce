import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  Scene,
  Vector3
} from 'three';

type GalaxyOptions = {
  count?: number;
  radius?: number;
  branches?: number;
  spin?: number;
  randomness?: number;
  randomnessPower?: number;
  insideColor?: string | number;
  outsideColor?: string | number;
  size?: number;
  rotationSpeed?: number;
};

export default class Galaxy {
  public readonly points: Points;

  private scene: Scene;
  private options: Required<GalaxyOptions>;
  private geometry: BufferGeometry;
  private material: PointsMaterial;

  private positions!: Float32Array;
  private initial!: Float32Array;
  private velocities!: Float32Array;

  constructor(scene: Scene, opts: GalaxyOptions = {}) {
    this.scene = scene;

    const defaults: Required<GalaxyOptions> = {
      count: 15000,
      radius: 50,
      branches: 4,
      spin: 1.2,
      randomness: 0.25,
      randomnessPower: 2.5,
      insideColor: '#ffb3ff',
      outsideColor: '#4ab3ff',
      size: 0.15, // tamaño de punto más visible
      rotationSpeed: 0.15
    };
    this.options = { ...defaults, ...opts };

    this.geometry = new BufferGeometry();
    this.material = new PointsMaterial({
      size: this.options.size,
      sizeAttenuation: true,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
      vertexColors: true
    });

    const positions = new Float32Array(this.options.count * 3);
    const colors = new Float32Array(this.options.count * 3);

    const colorInside = new Color(this.options.insideColor);
    const colorOutside = new Color(this.options.outsideColor);

    for (let i = 0; i < this.options.count; i++) {
      const i3 = i * 3;

      const r = Math.random() * this.options.radius;
      const branchAngle =
        ((i % this.options.branches) / this.options.branches) * Math.PI * 2;
      const spinAngle = r * this.options.spin;

      const rand = (a: number) =>
        Math.pow(Math.random(), this.options.randomnessPower) *
        (Math.random() < 0.5 ? -1 : 1) *
        this.options.randomness *
        a;

      const x = Math.cos(branchAngle + spinAngle) * r + rand(1.0);
      const y = rand(0.5);
      const z = Math.sin(branchAngle + spinAngle) * r + rand(1.0);

      positions[i3 + 0] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      const mixed = colorInside
        .clone()
        .lerp(colorOutside, r / this.options.radius);
      colors[i3 + 0] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    this.positions = positions;
    this.initial = new Float32Array(positions);
    this.velocities = new Float32Array(positions.length);

    const posAttr = new Float32BufferAttribute(this.positions, 3);
    posAttr.setUsage(DynamicDrawUsage);
    this.geometry.setAttribute('position', posAttr);
    this.geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.name = 'Galaxy';

    this.scene.add(this.points);
  }

  /** Atrae partículas hacia un punto (coords locales del Points). */
  public attract(center: Vector3, radius = 90, strength = 160): number {
    const r2 = radius * radius;
    let affected = 0;

    for (let i = 0; i < this.positions.length; i += 3) {
      const x = this.positions[i + 0];
      const y = this.positions[i + 1];
      const z = this.positions[i + 2];

      const dx = center.x - x;
      const dy = center.y - y;
      const dz = center.z - z;

      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > r2) continue;

      const d = Math.sqrt(d2) || 1e-6;
      const falloff = 1 - d / radius;

      this.velocities[i + 0] += (dx / d) * strength * falloff;
      this.velocities[i + 1] += (dy / d) * strength * falloff;
      this.velocities[i + 2] += (dz / d) * strength * falloff;

      affected++;
    }
    return affected;
  }

  /** Integración + autorrotación. Llamar cada frame. */
  update(delta: number) {
    // giro leve de la galaxia
    this.points.rotation.y += this.options.rotationSpeed * delta;

    // física (resorte amortiguado)
    const damping = 0.95;
    const springK = 0.18;
    const step = 180; // ganancia para que sea visible

    for (let i = 0; i < this.positions.length; i += 3) {
      const sx = this.initial[i + 0] - this.positions[i + 0];
      const sy = this.initial[i + 1] - this.positions[i + 1];
      const sz = this.initial[i + 2] - this.positions[i + 2];

      this.velocities[i + 0] += sx * springK * delta;
      this.velocities[i + 1] += sy * springK * delta;
      this.velocities[i + 2] += sz * springK * delta;

      this.positions[i + 0] += this.velocities[i + 0] * delta * step;
      this.positions[i + 1] += this.velocities[i + 1] * delta * step;
      this.positions[i + 2] += this.velocities[i + 2] * delta * step;

      this.velocities[i + 0] *= damping;
      this.velocities[i + 1] *= damping;
      this.velocities[i + 2] *= damping;
    }

    (
      this.geometry.getAttribute('position') as Float32BufferAttribute
    ).needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

  dispose() {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
  }
}
