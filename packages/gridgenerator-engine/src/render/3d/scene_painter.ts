import { RGBColor, State } from "gridgenerator-data";
import { ClipSpace } from "../../runtime/clipspace";
import { TextureManager } from "../../runtime/texture_manager";
import { CanvasContext, WebGLContext } from "../context";
import { FullscreenShader } from "./shaders/fullscreen.shader";

export class ScenePainter {
  private webgl: WebGLContext;
  private _state: Readonly<State>;
  private fullscreenShader: FullscreenShader;
  constructor(
    webgl: WebGLContext,
    state: Readonly<State>,
    textures: TextureManager,
    clipspace: ClipSpace
  ) {
    this.webgl = webgl;
    this._state = state;
    this.fullscreenShader = new FullscreenShader(
      webgl,
      state,
      textures,
      clipspace
    );
  }
  get shader() {
    return this.fullscreenShader;
  }
  set state(s: Readonly<State>) {
    this._state = s;
    this.fullscreenShader.state = s;
  }
  public init() {
    const gl = this.webgl.ctx;
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    // shader init here:
    this.fullscreenShader.init();
    const [r, g, b, a] = RGBColor.fromHex("#f4f4f4").toGL();
    gl.clearColor(r, g, b, a);
    // gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    // shader draw here:
    this.fullscreenShader.draw(0);
  }
  public openCols(
    _state: Readonly<State>,
    onDone?: () => void,
    onStart?: () => void
  ) {
    this.fullscreenShader.openCols(onDone, onStart);
  }
  public closeCols(
    _state: Readonly<State>,
    onDone?: () => void,
    onStart?: () => void
  ) {
    this.fullscreenShader.closeCols(onDone, onStart);
  }
  public cursorMove(sqId: number) {
    this.fullscreenShader.cursorMove(sqId);
  }
  public gridLines(visible: boolean) {
    this.fullscreenShader.layers.sqgrid.isGridVisible = visible;
    this.fullscreenShader.draw(0);
  }
  public redraw(
    textures: TextureManager,
    clipspace: ClipSpace,
    state: Readonly<State>
  ) {
    this.fullscreenShader.layers.sqgrid.textureIdsChanged = true;
    this.fullscreenShader.layers.sqgrid.shapeTextures = textures;
    this.fullscreenShader.layers.sqgrid.clipspace = clipspace;
    this.fullscreenShader.layers.sqgrid._state = state;
    this.fullscreenShader.draw(0);
  }
  public hideCursor() {
    this.fullscreenShader.layers.sqgrid.cursorAt = -10;
  }
}
