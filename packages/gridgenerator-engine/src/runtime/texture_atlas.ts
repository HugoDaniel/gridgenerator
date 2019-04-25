import { Vector2D, VectorMap } from "gridgenerator-data";
import { HelpersGL } from "../render/3d/shaders/helpersgl";
import {
  TextureAction,
  TextureChange,
  TextureChangeAlloc,
  TextureChangeUpdate
} from "./texture_actions";
export type UVCoord = Float32Array; // holds 4 floats: (startX, startY, uv length, texture unit index)
/** TextureAtlas holds a bunch of svg's mapped in a big WebGL texture. Each TextureAtlas is put into a WebGL Texture Unit by the Texture Manager */
export class TextureAtlas {
  /** The WebGL texture unit number for this texture atlas */
  private readonly unitIndex: number;
  /** Each texture in the atlas has an id, which is a pair of two numbers: (shapeId, shapeFillSetId) */
  public readonly ids: Array<[number, number]>;
  /** Each texture id is then mapped on the atlas through an index (2D coords -> 1D index).
   * A VectorMap of (shapeId, shapeFillSetId) -> Atlas index
   */
  public readonly indices: VectorMap<number>;
  /** The current available position (index) in the Atlas */
  private at: number;
  /** The UV coords for each svg in the Atlas */
  public uvCoords: UVCoord[];
  public readonly svgs: Uint8Array[];
  public readonly svgSize: number;
  /** number of textures in each atlas line */
  public readonly texturesPerLine: number;
  public readonly maxTextures: number;
  /** the maximum number of textures that this atlas can hold */
  public readonly lineSize: number;
  public readonly glTextureSize: number;
  public readonly dpr: number;
  /** The WebGL texture atlas */
  public texture: WebGLTexture | null;
  /** Flag that indicates if changes need to be flushed to the GPU */
  public changed: boolean;
  /** List of changes yet to be flushed to the GPU */
  public changes: TextureChange[];
  constructor(
    dpr: number,
    svgSize: number,
    glTextureSize: number,
    unitIndex: number,
    emptyAtlas: Uint8Array
  ) {
    this.unitIndex = unitIndex;
    this.dpr = dpr;
    this.texturesPerLine = glTextureSize / svgSize;
    this.maxTextures = this.texturesPerLine * this.texturesPerLine;
    this.uvCoords = new Array(this.maxTextures);
    // tslint:disable-next-line:no-console
    console.log(
      `Texture size ${svgSize}px (max ${glTextureSize}), texturesPerLine ${
        this.texturesPerLine
      }, maxTextures: ${this.maxTextures}`
    );
    this.ids = new Array(this.maxTextures);
    const p = new Promise((resolve, reject) => {
      for (let i = 0; i < this.maxTextures; i++) {
        this.ids[i] = new Array(2) as [number, number];
        this.uvCoords[i] = new Float32Array(4);
      }
    });
    this.svgs = new Array(this.maxTextures);
    this.at = 0;
    this.svgSize = svgSize;
    this.indices = new VectorMap();
    // on the next gpu flush: allocate the memory space on the gpu
    this.changed = true;
    this.changes = [
      new TextureChangeAlloc(emptyAtlas, glTextureSize, glTextureSize)
    ];
  }
  /** Returns the bottom left x,y coordinates for a given texture index on the atlas */
  private textureCoords(index: number): Vector2D {
    // return new Vector2D(512, 512);
    return new Vector2D(
      (index % this.texturesPerLine) * this.svgSize,
      // (this.svgSize * (this.texturesPerLine - 1) - Math.floor(index / this.texturesPerLine) * this.svgSize));
      Math.floor(index / this.texturesPerLine) * this.svgSize
    );
  }
  get hasSpace(): boolean {
    return this.at < this.maxTextures - 1;
  }
  public getUV(shapeId: number, shapeFillId: number): UVCoord {
    const i = this.indices.getXY(shapeId, shapeFillId);
    if (i === undefined) {
      // tslint:disable-next-line:no-console
      console.trace();
      throw new Error(
        `Cannot get Texture uvCoords for shapeId ${shapeId} and shapeFillID ${shapeFillId}: no index found`
      );
    }
    if (!this.uvCoords) {
      // tslint:disable-next-line:no-console
      console.trace();
      throw new Error(
        `Texture uvCoords is not defined (when trying to get the coords for shapeId ${shapeId} and shapeFillID ${shapeFillId})\nPlease call toGPU() before accessing uvCoords[]`
      );
    }
    return this.uvCoords[i];
  }
  public hasId(shapeId: number, shapeFillId: number): boolean {
    return this.indices.hasXY(shapeId, shapeFillId);
  }
  /** Renders the SVG string into an Image and then into the Canvas and then copies the ImageData to a final Uint8Array */
  private renderToArray(
    svg: string,
    img: HTMLImageElement,
    ctx: CanvasRenderingContext2D
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      img.src = `data:image/svg+xml,${svg}`;
      img.onload = () => {
        // render the image to canvas
        // which is the only way to get an ImageData/Uint8Array
        // for the GPU
        if (ctx) {
          ctx.clearRect(0, 0, this.svgSize, this.svgSize);
          ctx.drawImage(img, 0, 0, this.svgSize, this.svgSize);
          const d = ctx.getImageData(0, 0, this.svgSize, this.svgSize);
          // perfom a copy of the ImageData into a Uint8Array
          // this is because Apple limits the total ImageData available size
          // so I circumvent by transforming it into a Uint8Array :P
          resolve(new Uint8Array(d.data.copyWithin(0, 0)));
        }
      };
      img.onerror = (e: ErrorEvent) => reject(e.message);
    });
  }
  /** Renders the SVG into an Image and then into a Canvas. Adds the result to the Texture */
  public addSvg(
    id: Vector2D,
    svg: string,
    img: HTMLImageElement,
    ctx: CanvasRenderingContext2D
  ): Promise<TextureAtlas> {
    return new Promise((resolve, reject) => {
      if (this.indices.has(id)) {
        reject("Texture already present");
      }
      this.ids[this.at][0] = id.x; // shapeId
      this.ids[this.at][1] = id.y; // shapeFillId
      this.renderToArray(svg, img, ctx).then(arrData => {
        this.svgs[this.at] = arrData;
        // adjust the positions with this new texture
        this.indices.addValue(id, this.at);
        const index = this.at;
        this.at++;
        // calculate the uv coord for this new texture
        const num = this.texturesPerLine;
        const uvLen = 1 / num;
        const ammount = this.maxTextures;
        const u = (index % num) * uvLen;
        const v = Math.floor(index / num) * uvLen;
        this.uvCoords[index][0] = u;
        this.uvCoords[index][1] = v;
        this.uvCoords[index][2] = uvLen;
        this.uvCoords[index][3] = this.unitIndex;
        // set it to be flushed to the GPU when a flush occurs
        this.changed = true;
        this.changes.push(
          new TextureChangeUpdate(
            this.svgSize,
            this.textureCoords(index),
            arrData
          )
        );
        resolve(this);
      }, reject);
    });
  }
  /** Renders the SVG into an Image and then into a Canvas. Replaces the Texture with the provided id */
  public updateSVG(
    id: Vector2D,
    svg: string,
    img: HTMLImageElement,
    ctx: CanvasRenderingContext2D
  ): Promise<TextureAtlas> {
    return new Promise((resolve, reject) => {
      this.renderToArray(svg, img, ctx).then(arrData => {
        const index = this.indices.get(id);
        if (!index) {
          reject("Texture not present. Cannot update it.");
          return;
        }
        this.svgs[index] = arrData;
        // set it to be flushed to the GPU when a flush occurs
        this.changed = true;
        this.changes.push(
          new TextureChangeUpdate(
            this.svgSize,
            this.textureCoords(index),
            arrData
          )
        );
        resolve(this);
      }, reject);
    });
  }
  /** Flushes all changes to the GPU; does nothing if there aren't any changes to perform */
  public toGPU(gl: WebGLRenderingContext): Promise<TextureAtlas> {
    // do nothing if this texture was not changed
    if (!this.changed) {
      return Promise.resolve(this);
    }
    for (let i = 0; i < this.changes.length; i++) {
      const c = this.changes[i];
      switch (c.action) {
        case TextureAction.Alloc:
          this.gpuTextureAlloc(gl, c as TextureChangeAlloc);
          break;
        case TextureAction.Update:
          this.gpuTextureUpdate(gl, c as TextureChangeUpdate);
          break;
      }
      // HelpersGL.checkError(gl);
    }
    // clear the changes array:
    this.changed = false;
    this.changes.length = 0;
    return Promise.resolve(this);
  }
  /** Allocates space on the GPU for the atlasData and copies it there */
  private gpuTextureAlloc(
    gl: WebGLRenderingContext,
    change: TextureChangeAlloc
  ): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const webglTexId = HelpersGL.textureArray(
        gl,
        change.emptyAtlas,
        change.width,
        change.height,
        false
      );
      this.texture = webglTexId;
      // console.log('GPU: MALLOC TEXTURE ID', change);
      resolve(webglTexId);
    });
  }
  /** Updates a single texture space in the atlas texture on the GPU */
  private gpuTextureUpdate(
    gl: WebGLRenderingContext,
    change: TextureChangeUpdate
  ): Promise<void> {
    // console.log('GPU: UPDATE TEXTURE ', change);
    return new Promise((resolve, reject) => {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        change.xoffset,
        change.yoffset,
        change.width,
        change.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        change.data
      );
      gl.bindTexture(gl.TEXTURE_2D, null);
      resolve();
    });
  }
  /** Keeps the atlas texture allocated in the GPU, but clears it */
  public reset(emptyAtlas: Uint8Array) {
    this.at = 0;
    this.indices.clear();
    this.changed = true;
    this.changes.push(
      new TextureChangeUpdate(
        this.glTextureSize,
        new Vector2D(0, 0),
        emptyAtlas
      )
    );
  }
}
