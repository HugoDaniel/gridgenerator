import { Grid, ShapeFillSetId, ShapeId, Vector2D, VectorMap, Viewport } from '../../data';
import { TextureManager } from './texture_manager';

/** ClipSpaceTexture is made of [ShapeId, ShapeFillSetId] */
export type ClipSpaceTexture = [number, number];
export type ClipSpaceTextureCoords = Float32Array | undefined; // [startX, startY, uvlen, unit]
export class ClipSpace {
	/** clip space array, from (0,0) to (max. horz. item, max. vert. item) */
	public rotation: number[];
	public textures: ClipSpaceTexture[];
	public uv: ClipSpaceTextureCoords[][];
	private w: number;
	private h: number;
	private length: number;
	constructor(width: number, height: number, minItemSize: number) {
		const entryLength = 3;
		const totalSquaresH = Math.ceil(width / minItemSize) + 2;
		const totalSquaresV = Math.ceil(height / minItemSize) + 1;
		const length = totalSquaresH * totalSquaresV;
		this.length = length;
		this.rotation = new Array(length);
		this.textures = new Array(length);
		this.uv = [new Array(length)];
		// initialization of inner arrays
		for (let i = 0; i < length; i++) {
			this.textures[i] = new Array(0, 0) as [number, number];
		}
		this.w = width;
		this.h = height;
	}
	public static gridUnitIndex(x: number, y: number, width: number, v: Viewport) {
		const u = v.unitSize;
		const numLineUnits = Math.ceil(width / u) + 2.0;
		return x + (y) * numLineUnits + 1;
	}
	/** Returns the clipspace index for the current grid item. Clipspace is a 2D x,y grid mapped in a continuous array */
	public static gridIndex(absX: number, absY: number, view: Viewport, width: number): number {
		const u = view.unitSize;
		const x = view.squareX(absX);
		const y = view.squareY(absY);
		const i = this.gridUnitIndex(x, y, width, view);
		return i;
	}
	public deleteAt(sqIndex: number, shapeId: number, shapeFillSetId: number, gpuTextures: TextureManager) {
		this.textures[sqIndex][0] = 0;
		this.textures[sqIndex][1] = 0;
		this.rotation[sqIndex] = 0;
		const unitIndex = gpuTextures.getUnitIndex(shapeId, shapeFillSetId);
		this.uv[unitIndex][sqIndex] = undefined;
	}
	public paintAt(sqIndex: number, shapeId: number, shapeFillSetId: number, rotation: number, gpuTextures: TextureManager) {
		// console.log('Painting at index', sqIndex);
		// the whole screen is mapped into a texture array,
		// get the corresponding texture for the sqIndex:
		this.textures[sqIndex][0] = shapeId;
		this.textures[sqIndex][1] = shapeFillSetId;
		this.rotation[sqIndex] = rotation;
		// set the uvs array
		const unitIndex = gpuTextures.getUnitIndex(shapeId, shapeFillSetId);
		if (this.uv.length <= unitIndex) {
			this.newUVArray();
		}
		const uvInfo = gpuTextures.getUV(shapeId, shapeFillSetId, unitIndex);
		this.uv[unitIndex][sqIndex] = uvInfo;
	}
	private newUVArray(): number {
		return this.uv.push(new Array(length));
	}
	private clearTextures() {
		for (let i = 0; i < this.textures.length; i++) {
			this.textures[i][0] = 0;
			this.textures[i][1] = 0;
		}
		for (let u = 0; u < this.uv.length; u++) {
			this.uv[u] = new Array(this.length);
		}
	}
	public fromGrid(v: Viewport, grid: Grid, gpuTextures: TextureManager, isPatternOn?: boolean) {
		this.clearTextures();
		const u = v.unitSize;
		const totalHorizSq = Math.ceil(this.w / u) + 2.0;
		const totalVertSq = Math.ceil(this.h / u) + 2.0;
		const signX = Math.sign(v.x);
		const signY = Math.sign(v.y);
		const initX = v.squareLayerX();
		const initY = v.squareLayerY();
		const usePattern = isPatternOn; // isPatternOn;
		// read the layer grid x,y painted elements
		for (let x = 0; x < totalHorizSq; x++) {
			for (let y = 0; y < totalVertSq; y++) {
				let atX = initX + x;
				let atY = initY + y;
				if (usePattern && grid.pattern) {
					atX = grid.pattern.getX(atX);
					atY = grid.pattern.getY(atY);
				}
				const elem = grid.getElementAt(atX, atY);
				if (!elem) {
					continue;
				}
				// get the square index on the screen array
				const uIndex = ClipSpace.gridUnitIndex(x, y, this.w, v);
				this.paintAt(uIndex, elem.shapeId, elem.fillSetId, elem.rotation, gpuTextures);
			}
		}
	}
}
