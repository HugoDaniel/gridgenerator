import {
  ShapeFillSetId,
  ShapeId,
  Vector2D,
  VectorMap
} from "gridgenerator-data";
import { TextureAtlas, UVCoord } from "./texture_atlas";

export class TextureManager {
  private readonly singleTextureSize: number;
  private readonly atlasTextureSize: number;
  private units: TextureAtlas[];
  private readonly textureUnitsNum: number;
  private readonly emptyAtlas: Uint8Array;
  private readonly emptySingleTexture: Uint8Array;
  public idUnit: VectorMap<number>; // the TU index for this (shapeId, shapeFillId)
  private readonly dpr: number;
  constructor(
    dpr: number,
    singleTextureSize: number,
    textureUnits: number,
    maxTextureSize: number
  ) {
    this.singleTextureSize = singleTextureSize;
    this.textureUnitsNum = textureUnits;
    this.atlasTextureSize = maxTextureSize;
    this.dpr = dpr;
    this.emptyAtlas = new Uint8Array(maxTextureSize * maxTextureSize * 4);
    this.emptySingleTexture = new Uint8Array(
      singleTextureSize * singleTextureSize * 4
    );
    this.idUnit = new VectorMap();
    this.units = [
      new TextureAtlas(
        this.dpr,
        this.singleTextureSize,
        this.atlasTextureSize,
        0,
        this.emptyAtlas
      )
    ];
  }
  public getUnitIndex(shapeId: number, fillSetId: number): number {
    for (let i = 0; i < this.units.length; i++) {
      const curUnit = this.units[i];
      if (curUnit.indices.hasXY(shapeId, fillSetId)) {
        return i;
      }
    }
    throw new Error(
      `No Texture for shapeId ${shapeId} and fillSetId ${fillSetId}`
    );
  }
  public getUV(shapeId: number, fillSetId: number, unitIndex: number): UVCoord {
    return this.units[unitIndex].getUV(shapeId, fillSetId);
  }
  public getGLTexture(unitIndex: number): WebGLTexture {
    const texture = this.units[unitIndex].texture;
    if (!texture) {
      throw new Error(`No GL Texture for the unit index ${unitIndex}`);
    }
    return texture;
  }
  /** Clears the textures but keeps them in VRAM (to speed things up) */
  public resetUnits() {
    for (let i = 0; i < this.units.length; i++) {
      this.units[i].reset(this.emptyAtlas);
    }
  }
  /** Inserts an svg into the current texture atlas.
   *  Creates a new texture atlas if there is not enough space in the current one.
   *  Does not upload to GPU (just creates the array with the ImageData copy)
   */
  public texturize(
    img: HTMLImageElement,
    canvas: CanvasRenderingContext2D,
    shapeId: ShapeId,
    shapeFillId: ShapeFillSetId,
    svg: string
  ): Promise<TextureAtlas> {
    let curUnit = this.units.length - 1;
    // check if there is space availabled in the current unit
    if (!this.units[curUnit].hasSpace) {
      // create a new texture atlas in a new texture unit
      this.units.push(
        new TextureAtlas(
          this.dpr,
          this.singleTextureSize,
          this.atlasTextureSize,
          curUnit + 1,
          this.emptyAtlas
        )
      );
      curUnit++;
    }
    // add the texture
    return this.units[curUnit].addSvg(
      new Vector2D(shapeId, shapeFillId),
      svg,
      img,
      canvas
    );
  }
  /** Updates an svg on the texture atlas.
   *  Does not upload to GPU (just searches for the array with the ImageData copy)
   */
  public updateTexture(
    img: HTMLImageElement,
    canvas: CanvasRenderingContext2D,
    shapeId: ShapeId,
    shapeFillId: ShapeFillSetId,
    svg: string
  ): Promise<TextureAtlas> {
    for (let i = 0; i < this.units.length; i++) {
      const unit = this.units[i];
      if (unit.hasId(shapeId, shapeFillId)) {
        // found the unit to update
        return unit.updateSVG(
          new Vector2D(shapeId, shapeFillId),
          svg,
          img,
          canvas
        );
      }
    }
    // no unit found for the provided id
    return Promise.reject(
      `No unit found for the provided id ${shapeId} and fill ${shapeFillId}`
    );
  }
  /** Uploads all changes to VRAM; does nothing if texture was not changed; clears existing textures if changed; */
  public uploadToVRAM(gl: WebGLRenderingContext) {
    const result: Array<Promise<TextureAtlas>> = [];
    for (let i = 0; i < this.units.length; i++) {
      result.push(this.units[i].toGPU(gl));
    }
    return Promise.all(result);
  }
}
