import { CanvasContext, ShaderBuffer, ShaderProgram, switchProgramTo, WebGLContext } from '../../context';
import { HelpersGL } from './helpersgl';

export interface GridShaderLocations {
	aVertexPosition: number;
	aTextureCoord: number;
	uSampler: WebGLUniformLocation | null;
}
export class GridShader {
	public readonly gl: WebGLRenderingContext;
	public context: WebGLContext;
	public width: number;
	public height: number;
	public ratio: number;
	public gridCanvas: CanvasContext;
	public texture: WebGLTexture;
	public buffers: ShaderBuffer[];
	public shader: ShaderProgram<GridShaderLocations>;
	public draw: () => void;
	constructor(canvas: WebGLContext, grid: CanvasContext) {
		this.ratio = canvas.ratio;
		this.width = canvas.width;
		this.height = canvas.height;
		this.context = canvas;
		this.gridCanvas = grid;
		this.gl = canvas.ctx;
		this.draw = () => {
			// draw() gets initialized in init()
			throw new Error('Trying to draw() before initialization in GridShader');
		};
	}
	public init() {
		this.shader = this.initShaders(this.gl);
		this.buffers = this.initBuffers(this.gl);
		this.texture = HelpersGL.texture(this.gl, this.gridCanvas);
		this.draw = () => {
			switchProgramTo(this.context, this.shader);
			// [vBuffer, viBuffer, tBuffer] = this.buffers;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[0].buffer);
			this.gl.vertexAttribPointer(this.shader.loc.aVertexPosition, this.buffers[0].itemSize, this.gl.FLOAT, false, 0, 0);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[2].buffer);
			this.gl.vertexAttribPointer(this.shader.loc.aTextureCoord, this.buffers[2].itemSize, this.gl.FLOAT, false, 0, 0);
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
			this.gl.uniform1i(this.shader.loc.uSampler, 0);
			// this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers[1].buffer);
			// this.gl.drawElements(this.gl.TRIANGLES, this.buffers[1].numItems, this.gl.UNSIGNED_SHORT, 0);
		};
	}
	public static vShader = `
	attribute vec4 aVertexPosition;
	attribute vec2 aTextureCoord;
	varying vec2 vTextureCoord;
	void main() {
		gl_Position = aVertexPosition;
		vTextureCoord = aTextureCoord;
	}
	`;
	public static fShader = `
	precision mediump float;
	uniform sampler2D uSampler;
	varying vec2 vTextureCoord;
	void main() {
		vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));

		gl_FragColor = textureColor;
		// gl_FragColor = vec4(fract(gl_FragCoord.xy / vec2(16., 32.)),0,1);
	}
	`;
	private locations(gl: WebGLRenderingContext, p: WebGLProgram): GridShaderLocations {
		const loc = {} as GridShaderLocations;
		const aVertexPosition = 'aVertexPosition';
		loc[aVertexPosition] = gl.getAttribLocation(p, aVertexPosition);
		if (loc[aVertexPosition] === -1) {
			throw new Error('Unable to find aVertexPosition in GridShader');
		}
		const aTextureCoord = 'aTextureCoord';
		loc[aTextureCoord] = gl.getAttribLocation(p, aTextureCoord);
		if (loc[aTextureCoord] === -1) {
			throw new Error('Unable to find aTextureCoord in GridShader');
		}

		const uSampler = 'uSampler';
		loc[uSampler] = gl.getUniformLocation(p, uSampler);
		return loc;
	}
	public initShaders(gl: WebGLRenderingContext): ShaderProgram<GridShaderLocations> {
		const program = HelpersGL.initShaderProgram(gl, GridShader.vShader, GridShader.fShader);
		gl.useProgram(program);
		// get locations
		return new ShaderProgram(program, this.locations(gl, program));
	}
	public initBuffers(gl: WebGLRenderingContext): ShaderBuffer[] {
		// generate vertex positions, vertext indices and texture uv coords
		// const { vData, iData, tData } = this._colPolys(this.width * this.ratio);
		const vData =
			[ -1.0, -1.0, 0.0,
				 1.0, -1.0, 0.0,
				-1.0,  1.0, 0.0,
				 1.0,  1.0, 0.0
			];
		const iData = [ 0, 1, 2, 2, 1, 3 ];
		const tData =
			[ 0.0, 1.0,
				1.0, 1.0,
				0.0, 0.0,
				1.0, 0.0
			];
		const vBuffer = HelpersGL.buffer(gl, vData, vData.length / 3, 3);
		const iBuffer = HelpersGL.buffer(gl, iData, iData.length, 1, gl.ELEMENT_ARRAY_BUFFER);
		const tBuffer = HelpersGL.buffer(gl, tData, tData.length / 2, 2);
		return [vBuffer, iBuffer, tBuffer];
	}
}
