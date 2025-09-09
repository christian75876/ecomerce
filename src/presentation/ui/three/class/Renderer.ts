// Renderer.ts
import { WebGLRenderer, SRGBColorSpace } from 'three';
import Scene from './Scene';

export default class Renderer extends WebGLRenderer {
  private container: HTMLElement;
  private appScene: Scene;

  constructor(canvas: HTMLCanvasElement, container: HTMLElement) {
    super({ antialias: true, alpha: true, canvas });

    this.container = container;
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.setSize(container.clientWidth, container.clientHeight);
    this.outputColorSpace = SRGBColorSpace;

    window.addEventListener('resize', this.onResize);

    this.appScene = new Scene(this, this.container);
  }

  /** ⬅️ Paso clave: expone la escena para que el exterior pueda invocar sus métodos públicos */
  public getScene(): Scene {
    return this.appScene;
  }

  /** (Opcional) expón directamente un API reducido que puedas pasar a React */
  public getAPI() {
    return {
      focusStore: (duration?: number) => this.appScene.focusStore(duration),
      focusPlanet: (duration?: number) => this.appScene.focusPlanet(duration)
    };
  }

  private onResize = () => {
    this.setSize(this.container.clientWidth, this.container.clientHeight);
    // Si tu Camara ya escucha resize y actualiza aspect, no necesitas tocarla aquí.
  };

  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.appScene.dispose();
    super.dispose();
  }
}
