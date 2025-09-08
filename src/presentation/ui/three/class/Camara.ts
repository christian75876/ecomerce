import { PerspectiveCamera, MathUtils } from 'three';

export default class Camara extends PerspectiveCamera {
  private container: HTMLElement;
  private onScroll = () => this.moverCamara();
  private onResize = () => this.actualizarAspect();
  private targetX = 0;
  private targetZ = 0;
  private targetRotY = 0;

  constructor(container: HTMLElement) {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    super(75, w / Math.max(1, h), 0.1, 2000);

    this.container = container;
    this.container.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize);

    this.position.set(0, 2, 5); // arranque visible
    this.actualizarAspect();
    this.moverCamara();
  }

  dispose() {
    this.container.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
  }

  private actualizarAspect() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.aspect = w / Math.max(1, h);
    this.updateProjectionMatrix();
  }

  private moverCamara() {
    const { scrollTop, scrollHeight, offsetHeight } = this.container;
    const denom = Math.max(1, scrollHeight - offsetHeight);
    const t = Math.min(1, Math.max(0, scrollTop / denom)); // 0..1

    // objetivos (luego interpolamos en update externo si quieres suavidad)
    this.targetZ = t * 3;
    this.targetX = t * 0.8;
    this.targetRotY = t * 10;

    // movimiento directo (simple)
    this.position.z = this.targetZ;
    this.position.x = this.targetX;
    this.rotation.y = this.targetRotY;
  }

  /** opcional si quieres suavizar desde un loop */
  lerpTo(delta: number) {
    this.position.z = MathUtils.lerp(this.position.z, this.targetZ, delta * 3);
    this.position.x = MathUtils.lerp(this.position.x, this.targetX, delta * 3);
    this.rotation.y = MathUtils.lerp(
      this.rotation.y,
      this.targetRotY,
      delta * 3
    );
  }
}
