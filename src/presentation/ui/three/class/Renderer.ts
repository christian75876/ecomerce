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
    this.outputColorSpace = SRGBColorSpace ?? SRGBColorSpace;

    window.addEventListener('resize', this.onResize);

    this.appScene = new Scene(this, this.container);
  }

  private onResize = () => {
    this.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.appScene.dispose();
    super.dispose();
  }
}
