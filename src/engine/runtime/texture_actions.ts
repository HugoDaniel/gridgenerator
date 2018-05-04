import { Vector2D } from '../../data';

const enum TextureAction { Alloc = 'Alloc', Add = 'Add', Remove = 'Remove', Update = 'Update' }
/** Allocate memory on the GPU for the texture atlas */
class TextureChangeAlloc {
	public readonly action: TextureAction = TextureAction.Alloc;
	constructor(
		readonly emptyAtlas: Uint8Array
	) {}
}
/** Add a new SVG to the atlas */
class TextureChangeAdd {
	public readonly action: TextureAction = TextureAction.Add;
	constructor(
		readonly id: Vector2D, readonly svg: string
	) {}
}
/** Remove an existing SVG from the atlas */
class TextureChangeRemove {
	public readonly action: TextureAction = TextureAction.Remove;
	constructor(
		readonly id: Vector2D
	) {}
}
/** Updates an existing SVG on the atlas */
class TextureChangeUpdate {
	public readonly action: TextureAction = TextureAction.Update;
	constructor(
		readonly id: Vector2D, readonly svg: string
	) {}
}
