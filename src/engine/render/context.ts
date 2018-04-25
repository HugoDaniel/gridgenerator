import { Locations } from './3d/shaders/locations';
export class ShaderProgram {
	public readonly program: WebGLProgram;
	public readonly loc: Locations;
	constructor(p: WebGLProgram, loc: Locations) {
		this.program = p;
		this.loc = loc;
	}
	public activateAll(gl: WebGLRenderingContext) {
		for (let i = 0; i < this.loc.attributesIds.length; i++) {
			gl.enableVertexAttribArray(this.loc.attributesIds[i]);
		}
		// this.loc.attributes.forEach(gl.enableVertexAttribArray, gl);
		/*
		for (const id of this.loc.attributes.values()) {
			gl.enableVertexAttribArray(id);
		}
		*/
	}
	public switchFrom(gl: WebGLRenderingContext,  oldProgram: ShaderProgram) {
		// deactive all old attribs
		for (let i = 0; i < oldProgram.loc.attributesIds.length; i++) {
			gl.disableVertexAttribArray(oldProgram.loc.attributesIds[i]);
		}
		// activate new attribs
		this.activateAll(gl);
	}
}

export function switchProgramTo(canvas: WebGLContext, newProgram: ShaderProgram) {
	// gl is canvas.ctx;
	if (canvas.program === null) {
		newProgram.activateAll(canvas.ctx);
	} else {
		newProgram.switchFrom(canvas.ctx, canvas.program);
	}
	canvas.program = newProgram;
	canvas.ctx.useProgram(newProgram.program);
}

export class ShaderBuffer {
	public buffer: WebGLBuffer;
	public data: Float32Array | Uint16Array;
	public readonly numItems: number;
	public readonly itemSize: number;
	constructor(buffer: WebGLBuffer, data: Float32Array | Uint16Array, numItems: number, itemSize: number) {
		this.buffer = buffer;
		this.data = data;
		this.numItems = numItems;
		this.itemSize = itemSize;
	}
}

export interface CanvasContext {
	ctx: CanvasRenderingContext2D;
	width: number;
	height: number;
	ratio: number;
	svg: SVGElement;
}
export interface WebGLContext {
	propsWidth: number;
	propsHeight: number;
	ratio: number;
	width: number;
	height: number;
	ctx: WebGLRenderingContext;
	program: ShaderProgram | null;
	maxTextureSize: number;
	maxNumTextures: number;
}
export function toCanvasCtx(ctx: CanvasRenderingContext2D, width: number, height: number, svg: SVGElement): CanvasContext {
	return {
		ctx,
		height,
		svg,
		width,
		ratio: 1
	};
}
export function toWebGLCtx(ctx: WebGLRenderingContext, width: number, height: number): WebGLContext {
	return {
		width: ctx.canvas.clientWidth,
		height: ctx.canvas.clientHeight,
		propsWidth: width,
		propsHeight: height,
		ctx,
		ratio: 1,
		program: null,
		maxTextureSize: ctx.getParameter(ctx.MAX_TEXTURE_SIZE),
		maxNumTextures: ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS)
	};
}
export interface ColorPickerCanvasCtx extends CanvasContext {
	canvasCache: object;
}
export function toColorPickerCanvasCtx(ctx: CanvasContext): ColorPickerCanvasCtx {
	return Object.assign(ctx, { canvasCache: {}});
}
