import { State } from "gridgenerator-data";
import { ClipSpace } from "../../../runtime/clipspace";
import { TextureManager } from "../../../runtime/texture_manager";
import {
  CanvasContext,
  ShaderBuffer,
  ShaderProgram,
  switchProgramTo,
  WebGLContext
} from "../../context";
import { HelpersGL } from "./helpersgl";
import { LayersShader } from "./layers.shader";
import { Locations } from "./locations";
import { AnimationDirection, ShaderAnimation } from "./shader_animation";

const enum FullscreenAnimations {
  None = 0,
  Open,
  Shift,
  Blur
}
export const enum FullscreenMode {
  Full,
  Expand,
  Cols
}
export class FullscreenShader {
  private _state: Readonly<State>;
  public readonly gl: WebGLRenderingContext;
  public readonly context: WebGLContext;
  public textures: WebGLTexture[];
  public buffers: ShaderBuffer[];
  public shader: ShaderProgram;
  public width: number;
  public height: number;
  public ratio: number;
  public isNotSmall: boolean;
  public mode: FullscreenMode;
  private colsBuffers: ShaderBuffer[];
  private colsShader: ShaderProgram;
  // ^ does the device have a large screen ? (tablets and desktops)
  // private canvas: CanvasContext;
  public layers: LayersShader;
  private openAnimation: ShaderAnimation;
  private openAmmount: number;
  private onAnimationDone: (() => void) | undefined;
  public draw: (t: number | undefined) => void;
  public debugTextures: TextureManager;
  constructor(
    canvas: WebGLContext,
    state: Readonly<State>,
    textures: TextureManager,
    clipspace: ClipSpace
  ) {
    this.ratio = canvas.ratio;
    this.width = canvas.width;
    this.height = canvas.height;
    this.gl = canvas.ctx;
    this.context = canvas;
    this._state = state;
    this.layers = new LayersShader(canvas, state, textures, clipspace);
    this.isNotSmall = true;
    this.mode = FullscreenMode.Cols;
    const duration = 333;
    this.debugTextures = textures;
    this.openAnimation = new ShaderAnimation(
      duration,
      FullscreenAnimations.Open,
      ShaderAnimation.linearRev
    );
    this.openAmmount = 4;
    this.onAnimationDone = undefined;
    this.openAnimation.onEnd = (runOnEnd: boolean) => {
      if (this.openAnimation.direction === AnimationDirection.Normal) {
        this.openAnimation.direction = AnimationDirection.Reverse;
      } else {
        this.openAnimation.direction = AnimationDirection.Normal;
      }
      if (runOnEnd && this.onAnimationDone) {
        this.onAnimationDone();
      }
    };
    this.draw = () => {
      // draw() gets initialized in init()
      return;
    };
  }
  public init() {
    this.layers.init();
    this.shader = this.initShaders(this.gl);
    this.buffers = this.initBuffers(this.gl);
    this.textures = this.initTextures();
    this.draw = (t: number | undefined) => {
      // const gl = this.gl;
      this.gl.viewport(
        0,
        0,
        this.gl.drawingBufferWidth,
        this.gl.drawingBufferHeight
      );
      this.layers.draw();
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); // draw to canvas
      switchProgramTo(this.context, this.shader);
      // const [vBuffer, viBuffer, tBuffer, shapeIds, shapeDelays, shapeRevDelays] = this.buffers;
      this.openAnimation.draw(
        this.gl,
        this.shader.loc,
        this.buffers[3],
        this.buffers[4],
        this.buffers[5]
      );
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[0].buffer);
      this.gl.vertexAttribPointer(
        this.shader.loc.attrib("aVertexPosition"),
        this.buffers[0].itemSize,
        this.gl.FLOAT,
        false,
        0,
        0
      );
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[2].buffer);
      this.gl.vertexAttribPointer(
        this.shader.loc.attrib("aTextureCoord"),
        this.buffers[2].itemSize,
        this.gl.FLOAT,
        false,
        0,
        0
      );
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
      // console.log('TEXTURE AT 0', this.debugTextures.getGLTexture(0))
      // this.gl.bindTexture(this.gl.TEXTURE_2D, this.debugTextures.getGLTexture(0));
      this.shader.loc.setSamplerUniform(this.gl, "uSampler", 0);
      this.setUniforms();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers[1].buffer);
      this.gl.drawElements(
        this.gl.TRIANGLES,
        this.buffers[1].numItems,
        this.gl.UNSIGNED_SHORT,
        0
      );
    };
  }
  /*
uniform float      PI;
uniform float      iTime;
uniform float      iTimeDelta;
uniform float      iDuration;
uniform int        iAnimationId;
uniform int        iAnimationDirection;
attribute float    aShapeIndex;
attribute float    aShapeDelay;
*/
  public static vShaderCols = `
	${ShaderAnimation.AnimationVars}
	uniform float iOpenAmmount;
	attribute vec4 aVertexPosition;
	attribute vec2 aTextureCoord;
	varying vec2 vTextureCoord;
	// varying float vFaceIndex;
	void main() {
		// float openUntil = iOpenAmmount;
		// float deltaT = iTimeDelta;
		// float animId = iAnimationId;
		vec4 pos = aVertexPosition;
		if (aShapeIndex <= iOpenAmmount) {
		if (iAnimationDirection == 1.0) {
			float delay = aShapeDelay * 0.001;
			float curTime = max(iTime, delay) - delay;
			float param = min(curTime / iDuration, 1.0);
			pos.y = pos.y + 2.0 * sin(param * 0.5 * PI);
		} else {
			float delay = aShapeRevDelay * 0.001;
			float curTime = iTime + delay;
			float param = min(curTime / iDuration, 1.0);
			pos.y = pos.y + 2.0 * cos(param * 0.5 * PI);
		}
	}
		gl_Position = pos;
		vTextureCoord = aTextureCoord;
		// vFaceIndex = aShapeIndex;
	}
	`;
  public static fShaderCols = `
	precision mediump float;
	uniform sampler2D uSampler;
	varying vec2 vTextureCoord;
	// varying float vFaceIndex;
	void main() {
		vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
		gl_FragColor = textureColor;
	}
	`;
  private setUniforms() {
    this.shader.loc.set1Uniform(this.gl, "iOpenAmmount", this.openAmmount);
  }
  private locations(gl: WebGLRenderingContext, p: WebGLProgram): Locations {
    const loc = new Locations("FullscreenShader");
    loc.locateAttrib(gl, p, "aVertexPosition");
    loc.locateAttrib(gl, p, "aShapeIndex");
    loc.locateAttrib(gl, p, "aTextureCoord");
    loc.locateUniform(gl, p, "uSampler");
    loc.locateUniform(gl, p, "iOpenAmmount");
    return ShaderAnimation.Locations(gl, p, loc);
    // return loc;
  }
  private _addColVertex(
    vData: number[],
    iData: number[],
    x1: number,
    x2: number,
    index: number
  ): void {
    vData.push(x1);
    vData.push(-1.0);
    vData.push(0);
    vData.push(x2);
    vData.push(-1.0);
    vData.push(0);
    vData.push(x1);
    vData.push(1.0);
    vData.push(0);
    vData.push(x2);
    vData.push(1.0);
    vData.push(0);
    iData.push(index);
    iData.push(index + 1);
    iData.push(index + 2);
    iData.push(index + 2);
    iData.push(index + 1);
    iData.push(index + 3);
  }
  private _textureColData(
    tData: number[],
    w: number,
    cols: number,
    fstColPx: number
  ) {
    // adjust uv to square coordinates
    const yAspect = 1.0;
    const xAspect = 1.0;
    const uLen = xAspect;
    const vLen = yAspect;
    const fstU = (uLen * fstColPx) / w;
    const colUSize = (uLen - fstU) / cols;
    const diffAdjustment = Math.ceil(fstU);
    /* Columns start at right side of display:
		for (let i = 0; i < cols + diffAdjustment; i++) {
			let u1;
			let u2;
			if (i === 0 && fstU > 0) {
				// the last column is not a full column, manually calc the uv for it here
				u1 = 0.0;
				u2 = fstU;
			} else {
				u1 = (i - diffAdjustment) * colUSize + fstU;
				u2 = u1 + colUSize;
			}
			tData.push(u1); tData.push(0);
			tData.push(u2); tData.push(0);
			tData.push(u1); tData.push(vLen);
			tData.push(u2); tData.push(vLen);
		}
		*/
    for (let i = 0; i < cols; i++) {
      const u1 = i * colUSize;
      const u2 = u1 + colUSize;
      tData.push(u1);
      tData.push(0);
      tData.push(u2);
      tData.push(0);
      tData.push(u1);
      tData.push(vLen);
      tData.push(u2);
      tData.push(vLen);
    }
    if (diffAdjustment) {
      // the last column is not a full column, manually calc the uv for it here
      const i = cols;
      const u1 = i * colUSize;
      const u2 = u1 + fstU;
      tData.push(u1);
      tData.push(0);
      tData.push(u2);
      tData.push(0);
      tData.push(u1);
      tData.push(vLen);
      tData.push(u2);
      tData.push(vLen);
    }
    return tData;
  }
  private _colPolys(w) {
    const clipSpaceDim = 2.0; // in clip space (-1.0, 1.0)
    const colSize = 128; // in px
    const cols = Math.floor(w / colSize);
    // ^ number of columns
    const fstColPx = w % colSize;
    // ^ the width (in px) of the first column if screen width is not a multiple of colSize
    const fstColClip = (clipSpaceDim * fstColPx) / w;
    const colClipSize = (clipSpaceDim - fstColClip) / cols;
    const vData: number[] = [];
    const iData: number[] = [];
    const diffAdjustment = Math.ceil(fstColClip);
    let x1;
    let x2;
    /* Columns starting at the left size of the display:
		for (let i = 0; i < cols + diffAdjustment; i++) {
			if (i === 0 && fstColClip > 0) {
				// the column is not a full column, so lets manually add it here
				// at the begining
				x1 = -1.0;
				x2 = x1 + fstColClip;
			} else {
				x1 = -1.0 + (i - diffAdjustment) * colClipSize + fstColClip;
				x2 = x1 + colClipSize;
			}
			const index = i * 4;
			this._addColVertex(vData, iData, x1, x2, index);
		}
		*/
    for (let i = 0; i < cols; i++) {
      x1 = -1.0 + i * colClipSize;
      x2 = x1 + colClipSize;
      const index = i * 4;
      this._addColVertex(vData, iData, x1, x2, index);
    }
    // add the remainder space:
    if (diffAdjustment) {
      // the last column is not a full column, so lets manually add it here
      // at the end
      const i = cols;
      x1 = -1.0 + i * colClipSize;
      x2 = x1 + fstColClip;
      const index = i * 4;
      this._addColVertex(vData, iData, x1, x2, index);
    }
    // calc the uv texture coordinates
    const tData: number[] = [];
    this._textureColData(tData, w, cols, fstColPx);
    return { vData, iData, tData };
  }
  private _shapeIds(verticesAmmount: number): number[] {
    const result = new Array(verticesAmmount);
    const vertsPerFace = 4;
    for (let i = 0; i < verticesAmmount; i++) {
      result[i] = Math.floor(i / vertsPerFace);
    }
    return result;
  }
  private _shapeDelays(verticesAmmount: number, itemDelay: number) {
    const result = new Array(verticesAmmount);
    const vertsPerFace = 4;
    for (let i = 0; i < verticesAmmount; i++) {
      result[i] = Math.floor(i / vertsPerFace) * itemDelay;
    }
    return result;
  }
  private initBuffersCols(gl: WebGLRenderingContext): ShaderBuffer[] {
    // generate vertex positions, vertext indices and texture uv coords
    const { vData, iData, tData } = this._colPolys(this.width * this.ratio);
    const numberOfVerts = vData.length / 3;
    const vBuffer = HelpersGL.buffer(gl, vData, numberOfVerts, 3);
    const iBuffer = HelpersGL.buffer(
      gl,
      iData,
      iData.length,
      1,
      gl.ELEMENT_ARRAY_BUFFER
    );
    const tBuffer = HelpersGL.buffer(gl, tData, tData.length / 2, 2);
    const delaysArray = this._shapeDelays(numberOfVerts, 40);
    this.openAnimation.maxDelay = delaysArray.reduce((a, b) => Math.max(a, b));
    const [shapeIds, delays, revDelays] = ShaderAnimation.initBuffers(
      gl,
      this._shapeIds(numberOfVerts),
      delaysArray
    );
    return [vBuffer, iBuffer, tBuffer, shapeIds, delays, revDelays];
    /*
		vertex data is assumed to be in clip space (-1.0, 1.0)
		vertex indices are specified by column
		*/
  }
  private initBuffers(gl: WebGLRenderingContext): ShaderBuffer[] {
    this.colsBuffers = this.initBuffersCols(gl);
    return this.choseBuffers();
  }
  // choseBuffers is called on initialization and then whenever the mode changes!
  private choseBuffers(): ShaderBuffer[] {
    switch (this.mode) {
      case FullscreenMode.Cols:
        return this.colsBuffers;
    }
    return [];
  }
  private initTextures(): WebGLTexture[] {
    if (!this.layers.targetTexture) {
      throw new Error("Unable to access the layers target texture");
    }
    return [this.layers.targetTexture];
  }
  private initShadersCols(gl: WebGLRenderingContext): ShaderProgram {
    const program = HelpersGL.initShaderProgram(
      gl,
      FullscreenShader.vShaderCols,
      FullscreenShader.fShaderCols
    );
    gl.useProgram(program);
    const locations = this.locations(gl, program);
    return new ShaderProgram(program, locations);
  }
  private initShaders(gl: WebGLRenderingContext): ShaderProgram {
    this.colsShader = this.initShadersCols(gl);
    return this.choseShader();
  }
  private choseShader(): ShaderProgram {
    switch (this.mode) {
      case FullscreenMode.Cols:
        return this.colsShader;
    }
    return this.colsShader; // default
  }
  public openCols(onDone?: () => void, onStart?: () => void): void {
    this.openAnimation.stop(false);
    this.onAnimationDone = onDone;
    this.openAnimation.start(this.draw);
    if (onStart) {
      onStart();
    }
  }
  public closeCols(onDone?: () => void, onStart?: () => void): void {
    this.openAnimation.stop(false);
    this.onAnimationDone = onDone;
    this.openAnimation.startReverse(this.draw);
    if (onStart) {
      onStart();
    }
  }
  set state(state: Readonly<State>) {
    this._state = state;
    this.layers.state = state;
  }
  public cursorMove(sqId: number) {
    this.layers.sqgrid.cursorAt = sqId;
    this.draw(0);
  }
}
