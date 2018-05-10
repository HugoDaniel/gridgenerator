import { pow2AtLeast, RandomArray, ShapeFillSetId, ShapeId, State, Viewport } from '../data';
import { CanvasContext, ColorPickerCanvasCtx, WebGLContext } from './render/context';
import { ClipSpace } from './runtime/clipspace';
import { Device } from './runtime/device';
import { DOMRects } from './runtime/dom_rects';
import { InitialStateWorker } from './runtime/initialStateWorker';
import { Loading } from './runtime/loading';
import { Movement } from './runtime/movement';
import { TextureAtlas } from './runtime/texture_atlas';
import { TextureManager } from './runtime/texture_manager';
export { RuntimeMediaSize } from './runtime/device';
import { Token } from './net/token';

// runtime gets updated by calling these methods
// (the events defined on the dom/events.ts are responsible for that)
// it is then used on the painter functions of the engine/render/2d ...
export class Runtime {
	public token: Token | null;
	public loading: Loading;
	public device: Device;
	public rects: DOMRects;
	public rnd: RandomArray;
	public movement: Movement | null;
	public colorPickerCtx: ColorPickerCanvasCtx | null;
	public webglCtx: WebGLContext | null;
	public textures: TextureManager | null;
	public clipSpace: ClipSpace;
	public textureCanvas: CanvasRenderingContext2D | null;
	public textureImg: HTMLImageElement | null;
	public playerCtx: CanvasRenderingContext2D | null;
	public playerImg: HTMLImageElement | null;
	public playerLoop: number | null;
	public initialStateWorker: InitialStateWorker;
	public isGobyAvailable: boolean;
	constructor(state: Readonly<State>) {
		this.loading = new Loading();
		this.colorPickerCtx = null;
		this.webglCtx = null;
		this.playerCtx = null;
		this.rnd = new RandomArray();
		this.device = new Device();
		this.rects = new DOMRects();
		this.isGobyAvailable = false;
		this.movement = null;
		this.initialStateWorker = new InitialStateWorker();
		this.textures = null;
		// ^ initialized when webgl context event happens in Runtime.setWebGLCtx
		this.clipSpace = new ClipSpace(this.device.width, this.device.height, state.viewport.minSize);
	}
	get width() {
		return this.device.width;
	}
	get height() {
		return this.device.height;
	}
	public setInitialState(s: Readonly<State>) {
		this.initialStateWorker.setInitialState(s);
	}
	public getInitialState() {
		return this.initialStateWorker.getInitialState();
	}
	public static newProject(rt: Runtime, state: Readonly<State>) {
		if (rt.webglCtx) {
			return Runtime.resetClipSpace(rt, state);
		}
		return Promise.resolve(rt);
	}
	public static setColorPickerCtx(rt: Runtime, context: ColorPickerCanvasCtx): Runtime {
		rt.colorPickerCtx = context;
		return rt;
	}
	public static unsetColorPickerCtx(rt: Runtime): Runtime {
		rt.colorPickerCtx = null;
		return rt;
	}
	public static setPlayerCtx(rt: Runtime, context: CanvasRenderingContext2D): Runtime {
		rt.playerCtx = context;
		return rt;
	}
	public static unsetPlayerCtx(rt: Runtime): Runtime {
		rt.playerCtx = null;
		return rt;
	}
	public static setWebGLCtx(rt: Runtime, ctx: WebGLContext, maxSize: number): Runtime {
		if (!rt.textureCanvas) {
			const size = ctx.ratio * maxSize;
			rt.textureImg = new Image(size, size);
			const canvas = document.createElement('canvas');
			canvas.width = size;
			canvas.height = size;
			rt.textureCanvas = canvas.getContext('2d');
		}
		rt.webglCtx = ctx;
		return rt;
	}
	public static resetClipSpace(rt: Runtime, state: Readonly<State>, dontTexturize?: boolean): Promise<Runtime> {
		const error = 'Cannot reset clip space because runtime has no TextureManager defined';
		const r: Promise<Runtime> = new Promise((resolve, reject) => {
			if (!dontTexturize) {
				rt.updateAllTextures(state).then((ta) => {
					if (rt.textures) {
						rt.clipSpace.fromGrid(state.viewport, state.currentLayer, rt.textures);
						resolve(rt);
					} else {
						reject(error);
					}
				});
			} else {
				if (!rt.textures) {
					reject(error);
				} else {
					rt.clipSpace.fromGrid(state.viewport, state.currentLayer, rt.textures);
					resolve(rt);
				}
			}
		});
		return r;
	}
	/** Inserts the svg in the texture atlas */
	public static texturize(rt: Runtime, shapeId: ShapeId, shapeFillId: ShapeFillSetId, svg: string): Promise<TextureAtlas> {
		if (!rt.webglCtx) {
			// tslint:disable-next-line:no-console
			console.trace();
			throw new Error(`Cannot texturize: No WebGL context available in the runtime`);
		} else if (!rt.textureCanvas) {
			// tslint:disable-next-line:no-console
			console.trace();
			throw new Error(`Cannot texturize: No texture canvas context available in the runtime`);
		} else if (!rt.textureImg) {
			// tslint:disable-next-line:no-console
			console.trace();
			throw new Error(`Cannot texturize: No texture image available in the runtime`);
		}
		const canvas = rt.textureCanvas;
		const img = rt.textureImg;
		const gl = rt.webglCtx.ctx;
		if (!rt.textures) {
			throw new Error('Trying to texturize without a valid TextureManager');
		}
		// put the svg in a texture altas:
		return rt.textures.texturize(img, canvas, shapeId, shapeFillId, svg);
	}
	public getTextureSize(v: Viewport) {
		/*
		if (this.webglCtx) {
			return pow2AtLeast(v.maxSize * this.webglCtx.ratio);
		} else {
			return pow2AtLeast(v.maxSize * (this.device.dpr / 100));
		}
		*/
		// return pow2AtLeast(v.maxSize * (this.device.dpr / 100));
		return v.maxSize;
	}
	/** Texturizes all the shapes present in the provided state ShapeMap; resets the runtime TextureManager to those textures */
	public updateAllTextures(state: Readonly<State>): Promise<TextureAtlas[]> {
		if (!this.webglCtx) {
			// tslint:disable-next-line:no-console
			console.trace();
			throw new Error('Cannot updateAllTextures without a WebGL context');
		}
		const result: Array<Promise<TextureAtlas>> = [];
		const ids: Array<[number, number, string]> = new Array();
		// ^ [shapeId, shapeFillSetId, svg string]
		const size = this.getTextureSize(state.viewport);
		// ^ adjust to screen ratios that are not power of 2
		if (this.textures) {
			// textures were already allocated, use this memory, just reset it
			this.textures.resetUnits();
		} else {
			this.textures = new TextureManager(this.device.dpr / 100, size, this.webglCtx.maxNumTextures, this.webglCtx.maxTextureSize / 4);
		}
		// build the svgs and id's array:
		for (const  [shapeId, shape] of state.shapes.entries()) {
			for (const [shapeFillSetId, fillMap] of shape.entries()) {
				ids.push([shapeId, shapeFillSetId, state.fills.buildSVG(shape.resolution, fillMap, size, size)]);
			}
		}
		const r: Promise<TextureAtlas[]> = new Promise( async (resolve, reject) => {
			// place each svg in texture atlas in sequence!
			// (this must be done in sequece, otherwise the image.onload gets overwritten)
			for (const [shapeId, shapeFillId, svg] of ids) {
				await Runtime.texturize(this, shapeId, shapeFillId, svg);
			}
			// Sends all the texture units (one texture atlas per TU) to the GPU
			if (!this.textures || !this.webglCtx) {
				reject('TextureManager is not present');
			} else {
				this.textures.uploadToVRAM(this.webglCtx.ctx).then(resolve);
			}
		});
		return r;
	}
	public addTexture(shapeId: ShapeId, shapeFillId: ShapeFillSetId, svg: string) {
		return Runtime.texturize(this, shapeId, shapeFillId, svg).then(() => {
			if (!this.textures || !this.webglCtx) {
				return Promise.resolve([]);
			}
			return this.textures.uploadToVRAM(this.webglCtx.ctx);
		});
	}
}
