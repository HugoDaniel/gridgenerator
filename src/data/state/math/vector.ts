export class Vector2D {
	public readonly x: number;
	public readonly y: number;
	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}
	public toJSON() {
		return ({ x: this.x, y: this.y });
	}
	public static revive(v: { x: number, y: number}): Vector2D {
		return new Vector2D(v.x, v.y);
	}
	get fst(): number {
		return this.x;
	}
	get snd(): number {
		return this.y;
	}
	public toString(): string {
		return `(${this.x}, ${this.y})`;
	}
	public isEqual(v: Vector2D): boolean {
		return (this.x === v.x && this.y === v.y);
	}
	public static isEqual(v1: Vector2D, v2: Vector2D): boolean {
		return (v1.x === v2.x && v1.y === v2.y);
	}
	public static fromObj(obj: { x: number, y: number }): Vector2D {
		return new Vector2D(obj.x, obj.y);
	}
	public static zero(): Vector2D {
		return new Vector2D();
	}
	public static pow7(): Vector2D {
		return new Vector2D(127, 127);
	}
	// checks if a point (c) is in line and between two points (a, b)
	public static isBetween(a: Vector2D, b: Vector2D, c: Vector2D): boolean {
		const epsilon = 0.1;
		const crossproduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y);
		if (Math.abs(crossproduct) > epsilon) {
			return false;
		}
		const dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y);
		if (dotproduct < 0) {
			return false;
		}
		const squaredlengthba = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
		if (dotproduct > squaredlengthba) {
			return false;
		}
		return true;
	}
	public static getNearSet(pt: Vector2D, _epsilon: number = 1): Vector2D[] {
		const result = new Array();
		let epsilon = Math.abs(Math.round(_epsilon));
		const x = pt.x;
		const y = pt.y;
		while (epsilon > 0) {
			const xA = x - epsilon;
			const xB = x + epsilon;
			const yA = y - epsilon;
			const yB = y + epsilon;
			result.push(new Vector2D(xA, yA));
			result.push(new Vector2D(x, yA));
			result.push(new Vector2D(xB, yA));
			result.push(new Vector2D(xA, y));
			result.push(new Vector2D(xB, y));
			result.push(new Vector2D(xA, yB));
			result.push(new Vector2D(x, yB));
			result.push(new Vector2D(xB, yB));
			epsilon = epsilon - 1;
		}
		return result;
	}
	public static abs(p: Vector2D): Vector2D {
		return (new Vector2D(Math.abs(p.x), Math.abs(p.y)));
	}
	public static createRounded(res: number, x: number, y: number): Vector2D {
		const halfRes = res / 2;
		let result;
		if (x >= halfRes && y < halfRes) {
			// 1st quadrant
			result = new Vector2D(Math.floor(x), Math.ceil(y));
		} else if (x < halfRes && y < halfRes) {
			// 2nd quadrant
			result = new Vector2D(Math.ceil(x), Math.ceil(y));
		} else if (x < halfRes && y >= halfRes) {
			// 3rd quadrant
			result = new Vector2D(Math.ceil(x), Math.floor(y));
		} else {
			// 4th quadrant
			result = new Vector2D(Math.floor(x), Math.floor(y));
		}
		return result;
	}
	public static insideTriangle(x: number, y: number, p0: Vector2D, p1: Vector2D, p2: Vector2D): boolean {
		const area = (0.5 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x)
			+ p0.x * (p1.y - p2.y) + p1.x * p2.y));
		const s = 1 / (2 * area) * (p0.y * p2.x - p0.x * p2.y
			+ (p2.y - p0.y) * x + (p0.x - p2.x) * y);
		const t = 1 / (2 * area) * (p0.x * p1.y - p0.y * p1.x
			+ (p0.y - p1.y) * x + (p1.x - p0.x) * y);
		return (s >= -0.1 && t >= -0.1 && (1 - s - t) >= 0);
	}
}
