class UniformLocation {
	public id: WebGLUniformLocation;
	public values: number[];
	constructor(id: WebGLUniformLocation, values: number[]) {
		this.id = id;
		this.values = values;
	}
}
export class Locations {
	private uniforms: Map<string, UniformLocation>;
	private attributes: Map<string, number>;
	public attributesIds: number[];
	public moduleName: string;
	constructor(moduleName: string) {
		this.uniforms = new Map();
		this.attributes = new Map();
		this.moduleName = moduleName;
		this.attributesIds = [];
	}
	public attribs() {
		return this.attributes.entries();
	}
	public attribIds() {
		return this.attributes.values();
	}
	public locateAttrib(gl: WebGLRenderingContext, p: WebGLProgram, name: string): number {
		const location = gl.getAttribLocation(p, name);
		if (location === -1) {
			throw new Error(`Unable to find ${name} in ${this.moduleName}`);
		}
		this.attributes.set(name, location);
		this.attributesIds.push(location);
		return location;
	}
	public locateUniform(gl: WebGLRenderingContext, p: WebGLProgram, name: string): WebGLUniformLocation {
		const location = gl.getUniformLocation(p, name);
		if (!location) {
			throw new Error(`Unable to find ${name} in ${this.moduleName}`);
		}
		const uniform = new UniformLocation(location, []);
		this.uniforms.set(name, uniform);
		return location;
	}
	public attrib(name: string): number {
		const a = this.attributes.get(name);
		if (a === undefined) {
			throw new Error(`Cannot get attribute ${name} in ${this.moduleName}`);
		}
		return a;
	}
	public setSamplerUniform(gl: WebGLRenderingContext, name: string, value: number) {
		const u = this.uniforms.get(name);
		if (u === undefined) {
			throw new Error(`Cannot set uniform ${name} in ${this.moduleName}: Not found`);
		}
		if (u.values[0] !== value) {
			u.values[0] = value;
			gl.uniform1i(u.id, value);
		}
	}
	public set1Uniform(gl: WebGLRenderingContext, name: string, value: number) {
		const u = this.uniforms.get(name);
		if (u === undefined) {
			throw new Error(`Cannot set uniform ${name} in ${this.moduleName}: Not found`);
		}
		if (u.values[0] !== value) {
			u.values[0] = value;
			gl.uniform1f(u.id, value);
		}
	}
	public set1UniformInt(gl: WebGLRenderingContext, name: string, value: number) {
		const u = this.uniforms.get(name);
		if (u === undefined) {
			throw new Error(`Cannot set uniform ${name} in ${this.moduleName}: Not found`);
		}
		if (u.values[0] !== value) {
			u.values[0] = value;
			gl.uniform1i(u.id, value);
		}
	}
	public setUniform(gl: WebGLRenderingContext, name: string, values: number[]) {
		const u = this.uniforms.get(name);
		if (!u) {
			throw new Error(`Cannot set uniform ${name} in ${this.moduleName}: Not found`);
		}
		// set uniforms if they are new
		if (u.values.length === 0) {
			u.values = values.slice(0);
			gl[`uniform${values.length}fv`](u.id, values);
			return;
		}
		// or only when they change:
		for (let i = 0; i < u.values.length; i++) {
			if (u.values[i] !== values[i]) {
				u.values = values.slice(0);
				gl[`uniform${values.length}fv`](u.id, values);
				return;
			}
		}
	}
}
