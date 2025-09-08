import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  DynamicDrawUsage,
  Float32BufferAttribute,
  LinearFilter,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  Vector3
} from 'three';
import { makeStarTexture } from './startTexture';

export type StarfieldOptions = {
  count?: number;
  range?: number;
  size?: number;
  colorHueBase?: number;
  colorHueJitter?: number;
  colorSatBase?: number;
  colorSatJitter?: number;
  colorLumBase?: number;
  colorLumJitter?: number;
};

export class Starfield {
  public readonly points: Points;

  private readonly scene: Scene;
  private readonly count: number;
  private readonly range: number;

  private positions: Float32Array;
  private initial: Float32Array;
  private velocities: Float32Array;

  constructor(scene: Scene, opts: StarfieldOptions = {}) {
    this.scene = scene;

    this.count = opts.count ?? 20000;
    this.range = opts.range ?? 500;
    const size = opts.size ?? 3;

    const hueBase = opts.colorHueBase ?? 0.62;
    const hueJit = opts.colorHueJitter ?? 0.08;
    const satBase = opts.colorSatBase ?? 0.25;
    const satJit = opts.colorSatJitter ?? 0.25;
    const lumBase = opts.colorLumBase ?? 0.75;
    const lumJit = opts.colorLumJitter ?? 0.2;

    this.positions = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      this.positions[i3 + 0] = Math.random() * this.range - this.range / 2;
      this.positions[i3 + 1] = Math.random() * this.range - this.range / 2;
      this.positions[i3 + 2] = Math.random() * this.range - this.range / 2;
    }
    this.initial = new Float32Array(this.positions);
    this.velocities = new Float32Array(this.count * 3);

    // Geometría
    const geometry = new BufferGeometry();
    const posAttr = new Float32BufferAttribute(this.positions, 3);
    posAttr.setUsage(DynamicDrawUsage);
    geometry.setAttribute('position', posAttr);

    const colors = new Float32Array(this.count * 3);
    const c = new Color();
    for (let i = 0; i < this.count; i++) {
      const h = hueBase + (Math.random() * 2 - 1) * hueJit;
      const s = satBase + (Math.random() * 2 - 1) * satJit;
      const l = lumBase + (Math.random() * 2 - 1) * lumJit;
      c.setHSL(
        Math.max(0, Math.min(1, h)),
        Math.max(0, Math.min(1, s)),
        Math.max(0, Math.min(1, l))
      );
      const i3 = i * 3;
      colors[i3 + 0] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    const map = new CanvasTexture(makeStarTexture(128));
    map.colorSpace = SRGBColorSpace;
    map.minFilter = LinearFilter;
    map.magFilter = LinearFilter;
    map.generateMipmaps = false;

    const material = new PointsMaterial({
      map,
      vertexColors: true,
      size,
      sizeAttenuation: true,
      transparent: true,
      alphaTest: 0.28,
      depthWrite: false,
      blending: AdditiveBlending
    });

    // Points
    this.points = new Points(geometry, material);
    this.points.frustumCulled = false;
    this.points.name = 'Starfield';
    this.scene.add(this.points);
  }

  public poke(center: Vector3, radius = 160, strength = 120): number {
    const r2 = radius * radius;
    let affected = 0;

    for (let i = 0; i < this.count; i++) {
      const ix = i * 3;
      const x = this.positions[ix + 0];
      const y = this.positions[ix + 1];
      const z = this.positions[ix + 2];

      const dx = x - center.x;
      const dy = y - center.y;
      const dz = z - center.z;

      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > r2) continue;

      const d = Math.sqrt(d2) || 1e-6;
      const falloff = 1 - d / Math.sqrt(r2);

      this.velocities[ix + 0] += (dx / d) * strength * falloff;
      this.velocities[ix + 1] += (dy / d) * strength * falloff;
      this.velocities[ix + 2] += (dz / d) * strength * falloff;

      affected++;
    }
    return affected;
  }

  public pokeAtIndex(index: number, radius = 160, strength = 120): number {
    const i3 = index * 3;
    const cx = this.positions[i3 + 0];
    const cy = this.positions[i3 + 1];
    const cz = this.positions[i3 + 2];
    return this.poke(new Vector3(cx, cy, cz), radius, strength);
  }

  public update(dt: number) {
    const damping = 0.94;
    const springK = 0.3;

    for (let i = 0; i < this.count; i++) {
      const ix = i * 3;

      const sx = this.initial[ix + 0] - this.positions[ix + 0];
      const sy = this.initial[ix + 1] - this.positions[ix + 1];
      const sz = this.initial[ix + 2] - this.positions[ix + 2];

      this.velocities[ix + 0] += sx * springK * dt;
      this.velocities[ix + 1] += sy * springK * dt;
      this.velocities[ix + 2] += sz * springK * dt;

      this.positions[ix + 0] += this.velocities[ix + 0] * dt * 100;
      this.positions[ix + 1] += this.velocities[ix + 1] * dt * 100;
      this.positions[ix + 2] += this.velocities[ix + 2] * dt * 100;

      this.velocities[ix + 0] *= damping;
      this.velocities[ix + 1] *= damping;
      this.velocities[ix + 2] *= damping;
    }

    const posAttr = this.points.geometry.getAttribute(
      'position'
    ) as Float32BufferAttribute;
    posAttr.needsUpdate = true;
    this.points.geometry.computeBoundingSphere();
  }
}
