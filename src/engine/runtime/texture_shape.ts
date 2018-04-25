// @ts-ignore
import logo2 from '../../assets/test/logo-fs8.png';
// @ts-ignore
import logo1 from '../../assets/test/logo.png';
import { pow2AtLeast, ShapeFillSetId, ShapeId, Vector2D, VectorMap } from '../../data';
import { HelpersGL } from '../render/3d/shaders/helpersgl';

export type UVCoord = Float32Array; // holds 4 floats: (startX, startY, uv length, texture unit index)
/** Texture holds a bunch of svg's mapped in a WebGL texture atlas. Each Texture is put into a WebGL Texture Unit */
export class Texture {
	/** The WebGL texture unit number for this texture atlas */
	private readonly unitIndex: number;
	/** Each texture in the atlas has an id, which is a pair of two numbers: (shapeId, shapeFillSetId) */
	public readonly ids: number[][];
	/** Each texture id is then mapped on the atlas through an index (2D coords -> 1D index).
	 * A VectorMap of (shapeId, shapeFillSetId) -> Atlas index
	 */
	public readonly indices: VectorMap<number>;
	/** The current available position (index) in the Atlas */
	private at: number;
	/** The UV coords for each svg in the Atlas */
	public uvCoords: UVCoord[] | null;
	public readonly svgs: Uint8Array[];
	public readonly svgSize: number;
	public readonly texturesPerLine: number;
	public readonly maxTextures: number;
	public readonly lineSize: number;
	public readonly glTextureSize: number;
	/** The WebGL texture atlas */
	public texture: WebGLTexture | null;
	public changed: boolean;
	constructor(svgSize: number, glTextureSize: number, unitIndex: number) {
		this.unitIndex = unitIndex;
		this.texturesPerLine = glTextureSize / svgSize;
		this.maxTextures = this.texturesPerLine * this.texturesPerLine;
		// tslint:disable-next-line:no-console
		console.log(`Texture size ${svgSize}px (max ${glTextureSize}), texturesPerLine ${this.texturesPerLine}, maxTextures: ${this.maxTextures}`);
		this.ids = new Array(this.maxTextures);
		for (let i = 0; i < this.maxTextures; i++) {
			this.ids[i] = new Array(2);
		}
		this.svgs = new Array(this.maxTextures);
		this.at = 0;
		this.svgSize = svgSize;
		this.indices = new VectorMap();
		this.changed = false;
	}
	get hasSpace(): boolean {
		return this.at < (this.maxTextures - 1);
	}
	public getUV(shapeId: number, shapeFillId: number): UVCoord {
		const i = this.indices.getXY(shapeId, shapeFillId);
		if (i === undefined) {
			// tslint:disable-next-line:no-console
			console.trace();
			throw new Error(`Cannot get Texture uvCoords for shapeId ${shapeId} and shapeFillID ${shapeFillId}: no index found`);
		}
		if (!this.uvCoords) {
			// tslint:disable-next-line:no-console
			console.trace();
			throw new Error(`Texture uvCoords is not defined (when trying to get the coords for shapeId ${shapeId} and shapeFillID ${shapeFillId})\nPlease call toGPU() before accessing uvCoords[]`);
		}
		return this.uvCoords[i];
	}
	public hasId(shapeId: number, shapeFillId: number): boolean {
		return this.indices.hasXY(shapeId, shapeFillId);
	}
	/** Renders the SVG into an Image and then into a Canvas. Adds the result to the Texture */
	public addSvg(id: Vector2D, svg: string, img: HTMLImageElement, ctx: CanvasRenderingContext2D): Promise<Texture> {
		return new Promise((resolve, reject) => {
			if (this.indices.has(id)) {
				reject('Texture already present');
			}
			this.ids[this.at][0] = id.x;
			this.ids[this.at][1] = id.y;
			img.src = `data:image/svg+xml,${svg}`;
			img.onload = () => {
				// render the texture to canvas
				if (ctx) {
					ctx.clearRect(0, 0, this.svgSize, this.svgSize);
					ctx.drawImage(img, 0, 0, this.svgSize, this.svgSize);
					const d = ctx.getImageData(0, 0, this.svgSize, this.svgSize);
					const arrData = new Uint8Array(d.data.copyWithin(0, 0));
					this.svgs[this.at] = arrData;
					this.indices.addValue(id, this.at);
					this.at++;
					this.changed = true;
					resolve(this);
				}
			};
		});
	}
	public toGPU(gl: WebGLRenderingContext, atlasWorker: Worker): Promise<Texture> {
		// do nothing if this texture was not changed
		if (!this.changed) {
			return Promise.resolve(this);
		}
		this.changed = false;
		// delete the existing texture
		if (this.texture) {
			gl.deleteTexture(this.texture);
		}
		return new Promise( (resolve, reject) => {
			const buffers: ArrayBuffer[] = [];
			for (let i = 0; i < this.svgs.length; i++) {
				const data: Uint8Array = this.svgs[i];
				if (data) {
					buffers.push(data.buffer);
				}
			}
			const num = pow2AtLeast(Math.ceil(Math.log2(this.at)));
			atlasWorker.onmessage = (e) => {
				const size = e.data.size * e.data.num;
				this.texture = HelpersGL.textureArray(gl, e.data.result, size, size, true);
				this.uvCoords = e.data.uvCoords as Float32Array[];
				// transfer buffer ownership back to the svgs array:
				for (let i = 0; i < e.data.images.length; i++) {
					this.svgs[i] = e.data.images[i];
				}
				// DEBUG:
				/*
				const _canvas = document.createElement('canvas');
				const s = this.svgSize * num;
				_canvas.width = s;
				_canvas.height = s;
				const _ctx = _canvas.getContext('2d');
				if (!_ctx) {
					console.log('NO CTX');
					return;
				}
				const _imgData = new ImageData(new Uint8ClampedArray(e.data.result), s, s);
				_ctx.putImageData(_imgData, 0, 0);
				document.getElementsByTagName('body')[0].appendChild(_canvas);
				*/
				resolve(this);
			};
			atlasWorker.postMessage(
				{ num
				, images: this.svgs
				, size: this.svgSize
				, ammount: this.at
				, unitIndex: this.unitIndex
				},
				buffers
			);
		});
	}
}
export class TextureShape { // per layer
	private readonly textureSize: number;
	private readonly maxTextureSize: number;
	private readonly maxContainedTextures: number;
	private textures: WebGLTexture[];
	private texturesAt: number;
	private curContainedTexture: number;
	private units: Texture[];
	private readonly textureUnitsNum: number;
	public idUnit: VectorMap<number>; // the TU index for this (shapeId, shapeFillId)
	private atlasWorker: Worker;
	constructor(textureSize: number, textureUnits: number, maxTextureSize: number) {
		this.textureSize = textureSize;
		this.textureUnitsNum = textureUnits;
		this.maxTextureSize = maxTextureSize;
		// tslint:disable-next-line:no-console
		// console.log(`Using ${textureSize}x${textureSize} textures`);
		this.maxContainedTextures = this.maxTextureSize / this.textureSize;
		this.idUnit = new VectorMap();
		this.units = [new Texture(this.textureSize, this.maxTextureSize, 0)];
		const workerCode = new Blob([`
		onmessage = function(e) {
			const { num, images, size, ammount, unitIndex } = e.data;
			const tLineSize = size * 4;
			const destLineLen = num * tLineSize;
			const resultLen = destLineLen * (size * num);
			const result = new Uint8Array(resultLen);
			const emptyLine = new Uint8Array(tLineSize);
			emptyLine.fill(0);
			// result.fill(0, 0, resultLen);
			// create the texture atlas, line by line:
			for (let l = 0; l < size; l++) {
				for (let t = 0; t < num * num; t++) {
					const destL = Math.floor(t / num) * size + l;
					const lineOffset = destL * destLineLen;
					const tnum = t % num;
					const numOffset = tnum * tLineSize;
					// copy the data:
					let tdata = emptyLine;
					if (t < ammount) {
						tdata = images[t].slice(l * tLineSize, Math.max(l * tLineSize + tLineSize, tLineSize * size));
					}
					result.set(tdata, lineOffset + numOffset)
				}
			}
			// set the uv coords for the created atlas
			const uvCoords = new Array(ammount);
			const uvLen = 1 / num;
			for (let t = 0; t < ammount; t++) {
				const startX = (t % num) * uvLen;
				const startY = Math.floor(t / num) * uvLen;
				uvCoords[t] = new Float32Array([ startX, startY, uvLen, unitIndex ]);
			}
			// prepare the message with the buffers (transferable)
			const buffers = [];
			for (let i = 0; i < images.length; i++) {
				const data = images[i];
				if (data) {
					buffers.push(data.buffer);
				}
			}
			buffers.push(result.buffer);
			// send it
			self.postMessage({ num, images, result, size, ammount, uvCoords }, buffers);
		}
		`], {type: 'text/javascript'});
		this.atlasWorker = new Worker(window.URL.createObjectURL(workerCode));
	}

	public getUnitIndex(shapeId: number, fillSetId: number): number {
		for (let i = 0; i < this.units.length; i++) {
			const curUnit = this.units[i];
			if (curUnit.indices.hasXY(shapeId, fillSetId)) {
				return i;
			}
		}
		throw new Error(`No Texture for shapeId ${shapeId} and fillSetId ${fillSetId}`);
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
			const curT = this.units[i];
			const newT = new Texture(this.textureSize, this.maxTextureSize, i);
			newT.texture = curT.texture;
			this.units[i] = newT;
		}
	}
	/** Inserts an svg into the current texture atlas. Creates a new texture atlas if there is not enough space in the current one */
	public texturize(img: HTMLImageElement, canvas: CanvasRenderingContext2D, shapeId: ShapeId, shapeFillId: ShapeFillSetId, svg: string): Promise<Texture> {
		let curUnit = this.units.length - 1;
		// check if there is space availabled in the current unit
		if (!this.units[curUnit].hasSpace) {
			// create a new texture atlas in a new texture unit
			this.units.push(
				new Texture(this.textureSize, this.maxTextureSize, curUnit + 1)
			);
			curUnit++;
		}
		// add the texture
		return this.units[curUnit].addSvg(new Vector2D(shapeId, shapeFillId), svg, img, canvas);
	}
	/** Puts all textures in VRAM; does nothing if texture was not changed; clears existing textures if changed; */
	public uploadToVRAM(gl: WebGLRenderingContext) {
		const result: Array<Promise<Texture>> = [];
		for (let i = 0; i < this.units.length; i++) {
			result.push(this.units[i].toGPU(gl, this.atlasWorker));
		}
		return Promise.all(result);
	}
}
