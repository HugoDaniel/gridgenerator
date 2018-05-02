import { RGBColor, State } from '../../../../data';
import { ClipSpace } from '../../../runtime/clipspace';
import { TextureShape, UVCoord } from '../../../runtime/texture_shape';
import { CanvasContext, ShaderBuffer, ShaderProgram, switchProgramTo, WebGLContext } from '../../context';
import { HelpersGL } from './helpersgl';
import { Locations } from './locations';

export class SqGridShader {
	public _state: Readonly<State>;
	public readonly gl: WebGLRenderingContext;
	public context: WebGLContext;
	public width: number;
	public height: number;
	public isGridVisible: boolean;
	public ratio: number;
	public cursorAt: number; // square index of cursor position
	public cursorColor: number[]; // gl rgb color array
	public texture: WebGLTexture;
	public buffers: ShaderBuffer[];
	public shader: ShaderProgram;
	public clipspace: ClipSpace;
	public shapeTextures: TextureShape;
	public offset: [number, number];
	private textureRot: Float32Array;
	private textureRotBuffer: ShaderBuffer;
	private textureIds: Float32Array;
	public textureIdsChanged: boolean;
	private textureIdsBuffer: ShaderBuffer | undefined;
	private textureCoords: Float32Array;
	private textureCoordsBuffer: ShaderBuffer;
	private cursorFaceId: number;
	private readonly emptyUV: UVCoord;
	public draw: () => void;
	constructor(canvas: WebGLContext, state: Readonly<State>, textures: TextureShape, clipspace: ClipSpace) {
		this._state = state;
		this.clipspace = clipspace;
		this.shapeTextures = textures;
		this.ratio = canvas.ratio;
		this.width = canvas.width;
		this.height = canvas.height;
		this.cursorAt = -1;
		this.context = canvas;
		this.cursorColor = [1.0, 0.0, 0.0, 1.0];
		this.cursorFaceId = -123;
		this.gl = canvas.ctx;
		this.offset = new Array(2) as [number, number];
		this.emptyUV = new Float32Array([0, 0, 0, -1]); // unit is -1: no texture
		this.isGridVisible = true;
		this.draw = () => {
			// draw() gets initialized in init()
			throw new Error('Trying to draw() before initialization in SqGridShader');
		};
	}
	private setCursorColor(): number[] {
		const color = this._state.fills.getFillObj(this._state.currentLayer.cursorColor);
		if (color) {
			this.cursorColor = color.toGL();
		}
		return this.cursorColor;
	}
	private drawTextures(drawBuffer: ShaderBuffer) {
		const squares = this.clipspace.textures.length;
		if (this.textureIdsChanged) {
			// console.log(`%c WEBGL DRAW`, 'background: maroon; color: white; display: block;');
			this.textureIds.fill(0);
			for (let sq = 0; sq < squares; sq++) {
				const t = this.clipspace.textures[sq];
				const verts = 4;
				for (let v = 0; v < verts; v++) {
					const vindex = (sq * verts + v) * 2;
					this.textureIds[vindex] = t[0];
					this.textureIds[vindex + 1] = t[1];
				}
			}
			if (this.textureIdsBuffer) {
				this.textureIdsBuffer = HelpersGL.bufferFloat32(this.gl, this.textureIds, this.textureIds.length / 2, 2, false, this.textureIdsBuffer);
			}
			// this.textureIdsChanged = false;
		}
		if (this.textureIdsBuffer) {
			// this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureIdsBuffer.buffer);
			// this.gl.vertexAttribPointer(this.shader.loc.attrib('aFaceTexture'),
			// this.textureIdsBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
		}
		// prepare the rotation array:
		this.textureRot.fill(0);
		for (let sq = 0; sq < squares; sq++) {
			const rot = this.clipspace.rotation[sq];
			const verts = 4;
			for (let v = 0; v < verts; v++) {
				this.textureRot[ (sq * verts + v) ] = rot;
			}
		}
		if (this.textureRotBuffer) {
			this.textureRotBuffer = HelpersGL.bufferFloat32(this.gl, this.textureRot, this.textureIds.length, 1, false, this.textureRotBuffer);
		} else {
			this.textureRotBuffer = HelpersGL.bufferFloat32(this.gl, this.textureRot, this.textureIds.length, 1, false, undefined);
		}
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureRotBuffer.buffer);
		this.gl.vertexAttribPointer(this.shader.loc.attrib('aFaceRot'),
			this.textureRotBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
		// render texture coords and draw the elements
		for (let u = 0; u < this.clipspace.uv.length; u++) {
			const uv = this.clipspace.uv[u];
			for (let sq = 0; sq < squares; sq++) {
				const coords = uv[sq] || this.emptyUV;
				const verts = 4;
				for (let v = 0; v < verts; v++) {
					this.textureCoords.set(coords, (sq * verts * coords.length) + v * coords.length);
				}
			}
			if (this.textureCoordsBuffer) {
				this.textureCoordsBuffer = HelpersGL.bufferFloat32(this.gl, this.textureCoords, this.textureCoords.length / 4, 4, true, this.textureCoordsBuffer);
			} else {
				this.textureCoordsBuffer = HelpersGL.bufferFloat32(this.gl, this.textureCoords, this.textureCoords.length / 4, 4, true, undefined);
			}
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordsBuffer.buffer);
			this.gl.vertexAttribPointer(this.shader.loc.attrib('aFaceTextureCoords'),
				this.textureCoordsBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.shapeTextures.getGLTexture(u));
			this.shader.loc.set1UniformInt(this.gl, 'texture', 0);
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, drawBuffer.buffer);
			this.gl.drawElements(this.gl.TRIANGLES, drawBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
		}
	}
	public init() {
		this.shader = this.initShaders(this.gl);
		this.buffers = this.initBuffers(this.gl);
		this.textureIdsChanged = true; // render the texture ids on first draw
		this.shader.loc.setUniform(this.gl, 'iResolution',
			[this.width, this.height, this.width / this.height]);
		this.shader.loc.setUniform(this.gl, 'iGridLineColor',
			this._state.currentLayer.gridLineColor);
		this.shader.loc.set1Uniform(this.gl, 'iCursorAt', this.cursorAt);
		// set cursor color from state
		this.shader.loc.setUniform(this.gl, 'iCursorColor',
			this.setCursorColor());
		this.draw = () => {
			switchProgramTo(this.context, this.shader);
			this.offset[0] = this._state.viewport.x;
			this.offset[1] = this._state.viewport.y;
			// console.log('DRAWING OFFSET', this.offset);
			this.shader.loc.set1Uniform(this.gl, 'iUnitSize', this._state.viewport.unitSize);
			this.shader.loc.setUniform(this.gl, 'iOffset', this.offset);
			/*
			const [
				aVertexPositionData,
				aVertexIdData,
				aFaceIndexData,
				aFaceVertexIdData,
				indices,
				lines
			] = this.buffers;
			*/
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[0].buffer);
			this.gl.vertexAttribPointer(this.shader.loc.attrib('aVertexPosition'),
				this.buffers[0].itemSize, this.gl.FLOAT, false, 0, 0);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[1].buffer);
			this.gl.vertexAttribPointer(this.shader.loc.attrib('aVertexIdd'),
				this.buffers[1].itemSize, this.gl.FLOAT, false, 0, 0);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[2].buffer);
			this.gl.vertexAttribPointer(this.shader.loc.attrib('aFaceIndex'),
				this.buffers[2].itemSize, this.gl.FLOAT, false, 0, 0);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[3].buffer);
			// this.gl.vertexAttribPointer(this.shader.loc.attrib('aFaceVertexIdd'),
			// 	this.buffers[3].itemSize, this.gl.FLOAT, false, 0, 0);
			// draw the grid cell contents:
			this.shader.loc.set1Uniform(this.gl, 'iRenderingCursor', 0);
			this.shader.loc.set1Uniform(this.gl, 'iRenderingLines', 0);
			this.drawTextures(this.buffers[4]);
			// draw the grid lines:
			this.shader.loc.set1Uniform(this.gl, 'iRenderingLines', 1);
			this.shader.loc.set1Uniform(this.gl, 'iCursorAt', this.cursorAt);
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers[5].buffer);
			if (this.isGridVisible) {
				this.gl.drawElements(this.gl.LINES, this.buffers[5].numItems, this.gl.UNSIGNED_SHORT, 0);
			}
			if (this.cursorAt >= 0) {
				this.shader.loc.set1Uniform(this.gl, 'iRenderingLines', 0);
				this.shader.loc.set1Uniform(this.gl, 'iRenderingCursor', 1);
				this.gl.drawElements(this.gl.LINES, 8, this.gl.UNSIGNED_SHORT, 16 * this.cursorAt);
			}
		};
	}
	private vShader = () => `
	attribute vec3 aVertexPosition;
	attribute float aVertexIdd;
	attribute float aFaceIndex;
	// attribute float aFaceVertexIdd;
	// attribute vec2 aFaceTexture;
	attribute vec4 aFaceTextureCoords;
	attribute float aFaceRot;
	uniform vec3 iResolution;
	uniform float iUnitSize;
	uniform vec2 iOffset;
	uniform float iRenderingLines;
	uniform float iRenderingCursor;
	uniform float iCursorAt;
	uniform vec4 iGridLineColor;
	uniform vec4 iCursorColor;
	// uniform vec2 iCurrentTexture;
	varying vec4 v_color;
	varying float fromTexture;
	varying vec2 v_texCoord;
	vec2 rotate(vec2 v, float a, vec2 c) {
		return vec2(
			c.x + (v.x - c.x) * cos(a) - (v.y - c.y) * sin(a),
			c.y + (v.x - c.x) * sin(a) + (v.y - c.y) * cos(a));
	}
	void main() {
		float rot = aFaceRot;
		float z = 0.0;
		float vid = aVertexIdd;
		// float fid = aFaceVertexIdd;
		float isRenderingLines = iRenderingLines;
		vec4 lineColor = iGridLineColor;
		float cursorAt = iCursorAt;
		vec4 cursorColor = iCursorColor;
		// vec2 ft = aFaceTexture;
		// vec2 curT = iCurrentTexture;
		vec4 curTextureCoords = aFaceTextureCoords;
		float face = aFaceIndex;
		// code starts here:
		v_color = vec4(0.0, 0.0, 0.0, 0.0);
		fromTexture = 0.0;
		v_color = iRenderingLines * iGridLineColor;
		if (face == cursorAt && iRenderingCursor == 1.0) {
			v_color = v_color + iRenderingCursor * iCursorColor;
		} else
		if ((curTextureCoords.w != -1.0) && iRenderingLines != 1.0) {
			fromTexture = 1.0;
			// calculate the texture coords
			float faceVertexNum = vid - (face * 4.0);
			v_texCoord = rotate(
				vec2(
					curTextureCoords.x + mod(faceVertexNum, 2.0) * curTextureCoords.z,
					curTextureCoords.y + curTextureCoords.z - step(1.5, faceVertexNum) * curTextureCoords.z),
				-2.0 * 3.14156 * (aFaceRot),
				vec2(
					curTextureCoords.x + (curTextureCoords.z / 2.0),
					curTextureCoords.y + curTextureCoords.z - (curTextureCoords.z / 2.0)
				));
		}
		vec2 len = vec2(
			iUnitSize * 2.0 / iResolution.x,
			iUnitSize * 2.0 / iResolution.y
		);
		vec2 numSquares = ceil((iResolution.xy / vec2(iUnitSize, iUnitSize))) + vec2(2.0, 2.0);
		vec2 off = iOffset;
		float offX = mod((iOffset.x / iResolution.x) * 2.0, len.x);
		float offY = mod((iOffset.y / iResolution.y) * 2.0, len.y);
		float faceX = -1.0 + mod(face, (numSquares.x)) * len.x - len.x / 2.0 - offX;
		float faceY = -1.0 + ceil(face / (numSquares.x)) * len.y - len.y / 2.0 - offY - step(0.0, iOffset.y) * len.y;
		float x = faceX + aVertexPosition.x * len.x / 2.0;
		float y = faceY + aVertexPosition.y * len.y / 2.0;
		float faceVisible = step(face, (numSquares.x) * (numSquares.y));
		/*
		float faceX = -1.0 + mod(face, numSquares.x) * len.x + len.x / 2.0;
		float faceY = -1.0 + floor(face / numSquares.x) * len.y + len.y / 2.0;
		float x = faceX + aVertexPosition.x * len.x / 2.0;
		float y = faceY + aVertexPosition.y * len.y / 2.0;
		float faceVisible = step(face, numSquares.x * numSquares.y);
		*/
		gl_Position = vec4(x, -y, z, faceVisible);
	}
	`
	private fShader = () => `
	precision mediump float;
	uniform sampler2D texture;
	varying float fromTexture;
	varying vec4 v_color;
	varying vec2 v_texCoord;
	void main() {
		// vec4 textureColor = vec4(fromTexture, 0.5, 0.5, 1.0);
		vec4 textureColor = texture2D(texture, v_texCoord);
		gl_FragColor = (1.0 - fromTexture) * v_color + fromTexture * textureColor;
		// gl_FragColor = texture2D(texture, v_texCoord);
	}
	`
	private locations(gl: WebGLRenderingContext, p: WebGLProgram): Locations {
		if (!p) {
			return;
		}
		const loc = new Locations('SqGrid');
		loc.locateAttrib(gl, p, 'aVertexIdd');
		loc.locateAttrib(gl, p, 'aFaceIndex');
		loc.locateAttrib(gl, p, 'aVertexPosition');
		// loc.locateAttrib(gl, p, 'aFaceVertexIdd');
		// loc.locateAttrib(gl, p, 'aFaceTexture');
		loc.locateAttrib(gl, p, 'aFaceTextureCoords');
		loc.locateAttrib(gl, p, 'aFaceRot');
		loc.locateUniform(gl, p, 'iResolution');
		loc.locateUniform(gl, p, 'iUnitSize');
		loc.locateUniform(gl, p, 'iOffset');
		loc.locateUniform(gl, p, 'iGridLineColor');
		loc.locateUniform(gl, p, 'iCursorAt');
		loc.locateUniform(gl, p, 'iCursorColor');
		loc.locateUniform(gl, p, 'iRenderingLines');
		loc.locateUniform(gl, p, 'iRenderingCursor');
		// loc.locateUniform(gl, p, 'iCurrentTexture');
		loc.locateUniform(gl, p, 'texture');
		return loc;
	}
	public initShaders(gl: WebGLRenderingContext): ShaderProgram {
		const program = HelpersGL.initShaderProgram(gl, this.vShader(), this.fShader(), 'aVertexPosition');
		gl.useProgram(program);
		// get locations
		return new ShaderProgram(program, this.locations(gl, program));
	}
	private quad(pos: number[], vid: number[], faces: number[], indices: number[], lines: number[], faceNum: number, offset: number) {
		pos.push(-1.0); pos.push( 1.0); pos.push(0.0);
		pos.push( 1.0); pos.push( 1.0); pos.push(0.0);
		pos.push(-1.0); pos.push(-1.0); pos.push(0.0);
		pos.push( 1.0); pos.push(-1.0); pos.push(0.0);
		for (let v = 0; v < 4; v++) {
			vid.push(offset + v);
			faces.push(faceNum);
		}
		// quad position indexations:
		indices.push(offset);
		indices.push(offset + 1);
		indices.push(offset + 2);
		indices.push(offset + 2);
		indices.push(offset + 1);
		indices.push(offset + 3);
		// lines indexation:
		lines.push(offset + 0);
		lines.push(offset + 1);
		lines.push(offset + 1);
		lines.push(offset + 3);
		lines.push(offset + 3);
		lines.push(offset + 2);
		lines.push(offset + 2);
		lines.push(offset + 0);
	}
	public initBuffers(gl: WebGLRenderingContext): ShaderBuffer[] {
		// generate vertex positions, vertext indices and texture uv coords
		// const { vData, iData, tData } = this._colPolys(this.width * this.ratio);
		const aVertexPositionData: number[] = [];
		const aVertexIdData: number[] = [];
		const aFaceVertexIdData: number[] = [];
		const aFaceIndexData: number[] = [];
		const lines: number[] = [];
		const w = this.width;
		const h = this.height;
		const minSize = this._state.viewport.minSize;
		const totalSquaresH = Math.ceil(w / minSize) + 2;
		const totalSquaresV = Math.ceil(h / minSize) + 1;
		const totalSquares = totalSquaresH * totalSquaresV;
		// const totalSquares = Math.ceil(((w + 1) * (h + 1)) / minSize);
		const out = 0;
		// initialize the draw cycle arrays:
		this.textureRot = new Float32Array(totalSquares * 4);
		this.textureIds = new Float32Array(totalSquares * 4 * 2);
		this.textureCoords = new Float32Array(totalSquares * 4 * 4);
		for (let sq = 0; sq < totalSquares; sq++) {
			const sqNumPts = 4;
			const sqVertexOffset = sq * sqNumPts;
			this.quad(aVertexPositionData, aVertexIdData, aFaceIndexData, aFaceVertexIdData, lines, sq, sqVertexOffset);
		}
		const bufVertexPositionData = HelpersGL.buffer(gl, aVertexPositionData, aVertexPositionData.length / 3, 3);
		const bufVertexIdData = HelpersGL.buffer(gl, aVertexIdData, aVertexIdData.length, 1);
		const bufFaceIndexData = HelpersGL.buffer(gl, aFaceIndexData, aFaceIndexData.length, 1);
		const bufFaceVertexIdData = HelpersGL.buffer(gl, aFaceVertexIdData, aFaceVertexIdData.length, 1);
		const indices = HelpersGL.buffer(gl, aFaceVertexIdData, aFaceVertexIdData.length, 1, gl.ELEMENT_ARRAY_BUFFER);
		const lineIndices = HelpersGL.buffer(gl, lines, lines.length, 1, gl.ELEMENT_ARRAY_BUFFER);
		return [bufVertexPositionData, bufVertexIdData, bufFaceIndexData, bufFaceVertexIdData, indices, lineIndices];
	}
	set state(state: Readonly<State>) {
		this._state = state;
	}
}
