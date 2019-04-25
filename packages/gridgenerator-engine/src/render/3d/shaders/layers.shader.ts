import { State } from "gridgenerator-data";
import { ClipSpace } from "../../../runtime/clipspace";
import { TextureManager } from "../../../runtime/texture_manager";
import { CanvasContext, WebGLContext } from "../../context";
import { SqGridShader } from "./sqgrid.shader";

export class LayersShader {
  private _state: Readonly<State>;
  public readonly gl: WebGLRenderingContext;
  public width: number;
  public height: number;
  public ratio: number;
  public targetTexture: WebGLTexture | null;
  public framebuffer: WebGLFramebuffer | null;
  public sqgrid: SqGridShader;
  public draw: () => void;
  constructor(
    canvas: WebGLContext,
    state: Readonly<State>,
    textures: TextureManager,
    clipspace: ClipSpace
  ) {
    this._state = state;
    this.ratio = canvas.ratio;
    this.width = canvas.width;
    this.height = canvas.height;
    this.sqgrid = new SqGridShader(canvas, state, textures, clipspace);
    this.gl = canvas.ctx;
    this.draw = () => {
      // draw() gets initialized in init()
      throw new Error("Trying to draw() before initialization in LayersShader");
    };
  }
  public init() {
    // create the screen texture to render at
    this.targetTexture = this._initTargetTexture();
    this.framebuffer = this._initFrameBuffer();
    // initialize the grid shader
    this.sqgrid.init();
    this.draw = () => {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
      // this.gl.clearColor(0, 0, 0, 0); // clear to transparent black
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.sqgrid.draw();
    };
  }
  private _initFrameBuffer() {
    const gl = this.gl;
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      attachmentPoint,
      gl.TEXTURE_2D,
      this.targetTexture,
      0
    );
    return fb;
  }
  private _initTargetTexture() {
    const gl = this.gl;
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.width * this.ratio,
      this.height * this.ratio,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return targetTexture;
  }
  set state(state: Readonly<State>) {
    this._state = state;
    this.sqgrid.state = state;
  }
}
