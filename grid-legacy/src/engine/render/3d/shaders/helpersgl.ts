import { CanvasContext, ShaderBuffer } from '../../context';

export class HelpersGL {
	public static initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string, verticesLocName?: string): WebGLProgram {
		const vertexShader = HelpersGL.loadShader(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = HelpersGL.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
		const shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		if (verticesLocName) {
			gl.bindAttribLocation(shaderProgram, 0, verticesLocName);
		}
		gl.linkProgram(shaderProgram);
		// Check for errors
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) || !shaderProgram) {
			throw new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		}
		return shaderProgram;
	}
	public static checkError(gl: WebGLRenderingContext) {
		const e = gl.getError();
		let msg;
		switch (e) {
			case gl.NO_ERROR: msg = 'No error has been recorded.'; break;
			case gl.INVALID_ENUM: msg = 'An unacceptable value has been specified for an enumerated argument.'; break;
			case gl.INVALID_VALUE: msg = 'A numeric argument is out of range.'; break;
			case gl.INVALID_OPERATION: msg = 'The specified command is not allowed for the current state.'; break;
			case gl.INVALID_FRAMEBUFFER_OPERATION: msg = 'The currently bound framebuffer is not framebuffer complete when trying to render to or to read from it.'; break;
			case gl.OUT_OF_MEMORY: msg = 'Not enough memory is left to execute the command.'; break;
			case gl.CONTEXT_LOST_WEBGL: msg = 'WebGL context is lost!'; break;
		}
		// tslint:disable-next-line:no-console
		console.log(msg);
	}
	public static loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		// Check for errors
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) || !shader) {
			const e = new Error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			throw e;
		}
		return shader;
	}
	private static glBuffer(gl: WebGLRenderingContext, data: Uint16Array | Float32Array, numItems: number, itemSize: number, type: number, isStatic: boolean, buffer?: ShaderBuffer) {
		let b: WebGLBuffer;
		if (buffer === undefined) {
			const _b = gl.createBuffer();
			if (!_b) {
				throw new Error('Unable to create WebGL Buffer in HelpersGL()');
			}
			b = _b;
		} else {
			b = buffer.buffer;
		}
		gl.bindBuffer(type, b);
		gl.bufferData(type, data, isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
		// gl.bindBuffer(gl.ARRAY_BUFFER, null);
		if (buffer === undefined) {
			return new ShaderBuffer(b, data, numItems, itemSize);
		} else {
			return buffer;
		}
	}
	public static bufferFloat32(gl: WebGLRenderingContext, data: Float32Array, numItems: number, itemSize: number, isStatic?: boolean, buffer?: ShaderBuffer | undefined) {
		let drawStatic = isStatic;
		if (drawStatic === undefined) {
			drawStatic = true;
		}
		return HelpersGL.glBuffer(gl, data, numItems, itemSize, gl.ARRAY_BUFFER, drawStatic, buffer);
	}
	public static buffer(gl: WebGLRenderingContext, data: number[], numItems: number, itemSize: number, type?: number): ShaderBuffer {
		const t = type || gl.ARRAY_BUFFER;
		let bData;
		if (t === gl.ELEMENT_ARRAY_BUFFER) {
			bData = new Uint16Array(data);
		} else {
			bData = new Float32Array(data);
		}
		return HelpersGL.glBuffer(gl, bData, numItems, itemSize, t, true);
	}
	private static putTextureInGPU(gl: WebGLRenderingContext, toGPU: (gl: WebGLRenderingContext) => void, doMipMap: boolean = false): WebGLTexture {
		const glTexture = gl.createTexture();
		if (glTexture === null) {
			throw new Error('Unable to create WebGL texture');
		}
		// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		toGPU(gl);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		if (doMipMap) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		return glTexture;
	}
	public static texture(gl: WebGLRenderingContext, _texture: HTMLImageElement, doMipMap: boolean = false): WebGLTexture {
		const toGPU = (_gl: WebGLRenderingContext) =>
			_gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _texture);
		return HelpersGL.putTextureInGPU(gl, toGPU, doMipMap);
	}
	public static textureArray(gl: WebGLRenderingContext, _texture: ArrayBufferView, width: number, height: number, doMipMap: boolean = false): WebGLTexture {
		const toGPU = (_gl: WebGLRenderingContext) => {
			return _gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, _texture);
		};
		return HelpersGL.putTextureInGPU(gl, toGPU, doMipMap);
	}
}
