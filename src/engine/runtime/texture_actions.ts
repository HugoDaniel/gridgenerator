import { Vector2D } from '../../data';
export interface ITextureChange {
	action: TextureAction;
}
export type TextureChange = TextureChangeUpdate | TextureChangeAlloc;
export const enum TextureAction { Alloc = 'Alloc', Update = 'Update' }
/** Allocate memory on the GPU for the texture atlas */
export class TextureChangeAlloc implements ITextureChange {
	public readonly action: TextureAction = TextureAction.Alloc;
	constructor(
		readonly emptyAtlas: Uint8Array,
		readonly width: number,
		readonly height: number
	) {}
}
/** Updates an existing space on the atlas */
export class TextureChangeUpdate implements ITextureChange {
	public readonly action: TextureAction = TextureAction.Update;
	public readonly xoffset: number;
	public readonly yoffset: number;
	public readonly width: number;
	public readonly height: number;
	public readonly data: Uint8Array;
	constructor(size: number, bottomLeftCoords: Vector2D, d: Uint8Array) {
		this.width = size;
		this.height = size;
		this.xoffset = bottomLeftCoords.x;
		this.yoffset = bottomLeftCoords.y;
		this.data = d;
	}
}
