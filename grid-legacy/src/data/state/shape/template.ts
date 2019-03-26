import { arcEllipse, isBetweenEllipseAngles } from '../math/ellipse';
import { Line } from '../math/line';
import { solveQuadraticEquation } from '../math/quadratic';
import { VectorSet } from '../math/set';
import { Vector2D } from '../math/vector';

export const enum ElementType { Line = 0, HLine, VLine, Ellipse }

function elemTypeFromNum(n: number): ElementType {
	switch (n) {
		case 1: return ElementType.HLine;
		case 2: return ElementType.VLine;
		case 3: return ElementType.Ellipse;
		default: return ElementType.Line;
	}
}
export interface TemplateElementReviver {
	args: number[];
	type: number;
}
export class TemplateElement {
	public readonly args: number[];
	public readonly type: ElementType;
	constructor(args: number[], type: ElementType) {
		this.args = args;
		this.type = type;
	}
	public toJSON() {
		return {
			args: this.args.slice(0),
			type: this.type as number
		};
	}
	public static revive(obj: { args: number[], type: ElementType}) {
		return new TemplateElement(obj.args, elemTypeFromNum(obj.type));
	}
	public isEqual(e: TemplateElement): boolean {
		if (this.type === e.type) {
			for (let i = 0; i < this.args.length; i++) {
				if (this.args[i] !== e.args[i]) {
					return false;
				}
			}
			return true;
		}
		return false;
	}
	public arcEllipse(pt: Vector2D) {
		const [ cx, cy, h, v, a ] = this.args;
		return arcEllipse(cx, cy, h, v, a, pt);
	}
	public ellipseIsBetween(pt1: Vector2D, pt2: Vector2D, testPt: Vector2D): boolean {
		const angle1 = this.arcEllipse(pt1);
		const angle2 = this.arcEllipse(pt2);
		const tangle = this.arcEllipse(testPt);
		return isBetweenEllipseAngles(angle1, angle2, tangle);
	}
	/*
	If sweep-flag is '1', then the arc will be drawn in a
	"positive-angle" direction (i.e., the ellipse
	formula x=cx+rx*cos(theta) and y=cy+ry*sin(theta) is evaluated
	such that theta starts at an angle corresponding to the current
	point and increases positively until the arc reaches (x,y)).
	A value of 0 causes the arc to be drawn in a "negative-angle"
	direction (i.e., theta starts at an angle value corresponding
	to the current point and decreases until the arc reaches (x,y)).
	*/
	public ellipseSweep(pt1: Vector2D, pt2: Vector2D): boolean {
		const [cx, cy, rx, ry, a] = this.args;
		const x1 = pt1.x - cx;
		const y1 = pt1.y - cy;
		const x2 = pt2.x - cx;
		const y2 = pt2.y - cy;
		const crossProduct = x1 * y2 - x2 * y1;
		return (crossProduct > 0);
	}
	private lineEquation(lineArgs: number[]) {
		const [x0, y0, x1, y1] = lineArgs;
		return Line.equation(x0, y0, x1, y1);
	}
	private intersectLines(l1: number[], l2: number[]): Vector2D[] {
		const [x1, y1, x2, y2] = l1;
		const [x3, y3, x4, y4] = l2;
		const v = Line.intersect(x1, y1, x2, y2, x3, y3, x4, y4);
		if (v) {
			return [Vector2D.createRounded(512, v.x, v.y)];
		}
		return [];
	}
	private intersectLineEllipse(l: number[], e: number[]): Vector2D[] {
		const [ cx, cy, h, v, a ] = e;
		const lineEq = this.lineEquation(l);
		const m = lineEq.m;
		const b = lineEq.b + (lineEq.m * cx) - cy;
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		const qa = v * v * cosa * cosa
						 + 2 * (v * v) * m * cosa * sina
						 + v * v * m * m * sina * sina
						 + h * h * m * m * cosa * cosa
						 - 2 * h * h * m * cosa * sina
						 + h * h * sina * sina;
		const qb = 2 * v * v * b * cosa * sina
						 + 2 * v * v * m * b * sina * sina
						 + 2 * h * h * m * b * cosa * cosa
						 - 2 * h * h * b * cosa * sina;
		const qc = v * v * b * b * sina * sina
						 + h * h * b * b * cosa * cosa
						 - h * h * v * v;
		const roots = solveQuadraticEquation(qa, qb, qc).filter( (num) => num && !isNaN(num)) as number[];
		const intersections = roots.map( (_cr) => {
			const cr = Math.floor(_cr * 100) * 0.01;
			const r = cr + cx;
			const lineY = r * m + lineEq.b;
			return Vector2D.createRounded(512, r, lineY);
		});
		return intersections;
	}
	private intersectVLineEllipse(l: number[], e: number[]): Vector2D[] {
		const [ cx, cy, h, v, a ] = e;
		const lx = l[0];
		const x = lx - cx;
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		const qa = v * v * sina * sina + h * h * cosa * cosa;
		const qb = 2 * x * cosa * sina * (v * v - h * h);
		const qc = x * x * (v * v * cosa * cosa + h * h * sina * sina) - h * h * v * v;
		const roots = solveQuadraticEquation(qa, qb, qc).filter( (num) => num && !isNaN(num)) as number[];
		const intersections = roots.map((_cr) => {
			const cr = Math.floor(_cr * 100) * 0.01;
			const r = cr + cy;
			return Vector2D.createRounded(512, lx, r);
		});
		// console.log("VLINE RESULT", intersections.map(v => `(${v.x}, ${v.y})`));
		return intersections;
	}
	private intersectEllipses(e1: number[], e2: number[]): Vector2D[] {
		// TODO: adapt the following gist:
		// https://gist.github.com/drawable/92792f59b6ff8869d8b1
		// https://gist.githubusercontent.com/drawable/92792f59b6ff8869d8b1/raw
		// /d532a348fcb9db7f6fafc7daee77e0efb79ba919/gistfile1.ts
		return [];
	}
	private intersectLineWith(args: number[], e: TemplateElement): Vector2D[] {
		switch (e.type) {
			case ElementType.VLine:
			case ElementType.HLine:
			case ElementType.Line:
				return this.intersectLines(args, e.args);
			case ElementType.Ellipse:
				return this.intersectLineEllipse(args, e.args);
		}
	}
	private intersectEllipseWith(args: number[], e: TemplateElement): Vector2D[] {
		switch (e.type) {
			case ElementType.VLine:
				return this.intersectVLineEllipse(e.args, args);
			case ElementType.HLine:
			case ElementType.Line:
				return this.intersectLineEllipse(e.args, args);
			case ElementType.Ellipse:
				return this.intersectEllipses(args, e.args);
		}
	}
	private intersectVLineWith(args: number[], e: TemplateElement): Vector2D[] {
		switch (e.type) {
			case ElementType.HLine:
			case ElementType.Line:
				return this.intersectLines(e.args, args);
			case ElementType.Ellipse:
				return this.intersectVLineEllipse(args, e.args);
			case ElementType.VLine:
				return [];
		}
	}
	public intersect(e: TemplateElement): Vector2D[] {
		switch (this.type) {
			case ElementType.VLine:
				return this.intersectVLineWith(this.args, e);
			case ElementType.HLine:
			case ElementType.Line:
				return this.intersectLineWith(this.args, e);
			case ElementType.Ellipse:
				return this.intersectEllipseWith(this.args, e);
			default:
				throw new Error('Intersection of unknown element types');
			// default should not happen, if more intersection elements
			// if more intersection types are needed dont forget to
			// add them in the switch cases of the above functions
		}
	}
	public static line(x1: number, y1: number, x2: number, y2: number): TemplateElement {
		let type = ElementType.Line;
		if (y1 === y2) {
			type = ElementType.HLine;
		} else if (x1 === x2) {
			type = ElementType.VLine;
		}
		return new TemplateElement(
			[x1, y1, x2, y2], type
		);
	}
	public static ellipse(cx: number, cy: number, rx: number, ry: number, alpha: number): TemplateElement {
		return new TemplateElement(
			[cx, cy, rx, ry, alpha], ElementType.Ellipse
		);
	}
}

export class Intersection {
	// a point and the index of the two elements that intersect it
	public readonly point: Vector2D;
	public readonly elementA: number;
	public readonly elementB: number;
	// ^ the index in the template elements array
	constructor(pt: Vector2D, elemA: number, elemB: number) {
		this.point = pt;
		this.elementA = elemA;
		this.elementB = elemB;
	}
	public toJSON() {
		return {
			pt: this.point.toJSON(),
			a: this.elementA,
			b: this.elementB
		};
	}
	public static revive(o: {pt: {x: number, y: number}, a: number, b: number}) {
		return new Intersection(Vector2D.revive(o.pt), o.a, o.b);
	}
	public equals(i: Intersection) {
		return (this.point.isEqual(i.point)
		&& (this.elementA === i.elementA || this.elementA === i.elementB)
		&& (this.elementB === i.elementB || this.elementB === i.elementA)
		);
	}
	public hasElement(elemId: number): boolean {
		return this.elementA === elemId || this.elementB === elemId;
	}
}

export interface TemplateReviver { base: number; res: number; rot: number; elements: TemplateElementReviver[]; }
export class Template {
	public readonly points: VectorSet;
	public readonly elements: TemplateElement[];
	public readonly intersections: Set<Intersection>;
	public readonly resolution: number;
	public readonly rotation: number;
	// ^ triangle templates might need rotation for their diff. grid types
	public readonly base: number;
	public readonly baseIntersections: Set<Intersection>;
	public readonly basePoints: VectorSet;
	public readonly pathString: string;
	public readonly baseString: string;
	public toJSON(): TemplateReviver {
		return {
			base: this.base,
			elements: this.elements.map((e) => e.toJSON()),
			res: this.resolution,
			rot: this.rotation
		};
	}
	public static revive(o: TemplateReviver) {
		return new Template(
			o.base, o.elements.map(TemplateElement.revive), o.res, o.rot
		);
	}
	private toSvgPath(num: number): string {
		let result = '';
		for (let i = 0; i < num; i++) {
			const elem = this.elements[i];
			const a = elem.args;
			switch (elem.type) {
				case ElementType.Line:
				result += `M${a[0]} ${a[1]} L${a[2]} ${a[3]} `;
				continue;
				case ElementType.HLine:
				result += `M${a[0]} ${a[1]} H${a[2]} `;
				continue;
				case ElementType.VLine:
				result += `M${a[0]} ${a[1]} V${a[3]} `;
				continue;
				case ElementType.Ellipse:
				const [cx, cy, rx, ry, alpha] = a;
				result += `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 -${rx * 2} 0`;
			}
		}
		return result;
	}
	constructor(baseUntil: number, elements: TemplateElement[], resolution: number = 512, rotation: number = 0) {
		this.rotation = rotation; // triangle templates might need rotation for their diff. grid types
		this.resolution = resolution;
		this.base = baseUntil;
		this.points = new VectorSet([]);
		this.basePoints = new VectorSet();
		this.elements = elements;
		this.intersections = new Set();
		this.baseIntersections = new Set();
		// check intersection for each element with every other element
		for (let i = 0; i < elements.length; i++) {
			const e1 = elements[i];
			for (let j = 0; j < elements.length; j++) {
				if (j === i) {
					continue;
					// ^ don't intersect current element with itself
				}
				const ipts = e1.intersect(elements[j]); // intersectF(e1.args, e2);
				for (let p = 0; p < ipts.length; p++) {
					let pt = ipts[p];
					pt = this.addPoint(pt);
					const intersection = new Intersection(pt, i, j);
					this.intersections.add(intersection);
					if (i < baseUntil && j < baseUntil) {
						this.baseIntersections.add(intersection);
						this.basePoints.add(pt);
					}
				}
			}
		}
		const clipped = this.clip(this.points, this.intersections);
		this.points = clipped.points;
		this.intersections = clipped.intersections;
		this.pathString = this.toSvgPath(this.elements.length);
		this.baseString = this.toSvgPath(this.base);
	}
	public elementPoints(te: TemplateElement): VectorSet {
		const result = new VectorSet();
		// find the te index in the elements array
		for (let i = 0; i < this.elements.length; i++) {
			if (this.elements[i].isEqual(te)) {
				// index found: i, now add the points of each intersection
				// that has it
				for (const intersection of this.intersections) {
					if (intersection.hasElement(i)) {
						result.add(intersection.point);
					}
				}
				return result; // don't proceed the initial for
			}
		}
		return result;
	}
	// adds a point to the set if there is no point near it
	// near is +-1
	// if a point exists near it, then return it to be used
	// returns { set, pt }
	private addPoint(pt: Vector2D): Vector2D {
		const epsilon = 1;
		const nearSet = Vector2D.getNearSet(pt, epsilon);
		const nearPoint = nearSet.find((v) => this.points.has(v));
		if (!nearPoint) {
			this.points.add(pt);
			return pt;
		} else {
			return nearPoint;
		}
	}
	private getIntersections(pt: Vector2D): Set<Intersection> {
		const filtered = new Set();
		for (const i of this.intersections) {
			if (i.point.isEqual(pt)) {
				filtered.add(i);
			}
		}
		return filtered;
	}
	// getElements => gets the elements in the intersections
	public getElements(pt: Vector2D): Set<TemplateElement> {
		const result = new Set();
		for (const i of this.getIntersections(pt)) {
			result.add(this.elements[i.elementA]);
			result.add(this.elements[i.elementB]);
		}
		return result;
	}
	public getReachable(pt: Vector2D): VectorSet {
		const result = new VectorSet();
		const elementsIndices = new Set();
		for (const i of this.getIntersections(pt)) {
			elementsIndices.add(i.elementA);
			elementsIndices.add(i.elementB);
		}
		for (const i of this.intersections) {
			if (!pt.isEqual(i.point) && (elementsIndices.has(i.elementA) || elementsIndices.has(i.elementB)) ) {
				result.add(i.point);
			}
 		}
		return result;
	}
	public getReachableFrom(edge1: Vector2D, edge2: Vector2D, without: Vector2D[]): VectorSet {
		const result = new VectorSet();
		const elementsIndices = new Set();
		const withoutPts = new VectorSet(without);
		for (const i of this.intersectBoth(edge1, edge2)) {
			elementsIndices.add(i.elementA);
			elementsIndices.add(i.elementB);
		}
		for (const i of this.intersections) {
			if (!withoutPts.has(i.point) && !edge1.isEqual(i.point) && !edge2.isEqual(i.point) && (elementsIndices.has(i.elementA) || elementsIndices.has(i.elementB)) ) {
				result.add(i.point);
			}
 		}
		return result;
	}
	private intersectBoth(pt1: Vector2D, pt2: Vector2D): Set<Intersection> {
		const filtered = new Set();
		for (const i of this.intersections) {
			if (i.point.isEqual(pt1) || i.point.isEqual(pt2)) {
				filtered.add(i);
			}
		}
		return filtered;
	}
	public isBaseEqual(t: Template) {
		return (this.base === t.base
		&& this.baseIntersections.size === t.baseIntersections.size
		&& this.basePoints.equals(t.basePoints));
	}
	private clip(points: VectorSet, intersections: Set<Intersection>) {
		let resultPoints;
		let resultIntersections = new Set();
		if (this.base === 3) {
			const [pt1, pt2, pt3] = this.basePoints.toArray();
			resultPoints = points.filter( (e, x, y) => {
					if (!x || !y) {
						return false;
					}
					return Vector2D.insideTriangle(x, y, pt1, pt2, pt3);
			});
			for (const i of intersections) {
				if (Vector2D.insideTriangle(i.point.x, i.point.y, pt1, pt2, pt3)) {
					resultIntersections.add(i);
				}
			}
		} else  {
			// do other bases here if necessary
			resultPoints = points;
			resultIntersections = intersections;
		}
		return { points: resultPoints, intersections: resultIntersections };
	}
}
export const squareRoundTrisTemplate: () => Template = () => new Template(4,
	[
		// square:
		TemplateElement.line(0, 0, 512, 0),     // 0: th
		TemplateElement.line(512, 0, 512, 512), // 1: rv
		TemplateElement.line(512, 512, 0, 512), // 2: bh
		TemplateElement.line(0, 512, 0, 0),     // 3: lv
		// cross:
		TemplateElement.line(256, 0, 256, 512), // 4: cv
		TemplateElement.line(0, 256, 512, 256), // 5: ch
		// tri1:
		TemplateElement.line(0, 512, 128, 0),
		TemplateElement.line(128, 0, 256, 512),
		// tri2:
		TemplateElement.line(256, 512, 384, 0),
		TemplateElement.line(384, 0, 512, 512),
		// tri1-inv:
		TemplateElement.line(256, 0, 384, 512),
		TemplateElement.line(384, 512, 512, 0),
		// tri2-inv:
		TemplateElement.line(0, 0, 128, 512),
		TemplateElement.line(128, 512, 256, 0),
		// circle tl
		TemplateElement.ellipse(128, 128, 93.08, 94, 0),
		TemplateElement.ellipse(384, 128, 93.08, 94, 0),
		TemplateElement.ellipse(384, 384, 93.08, 94, 0),
		TemplateElement.ellipse(128, 384, 93.08, 94, 0)
		]);

export const squareDiagTemplate: () => Template = () => new Template(4,
		[
		// square:
		TemplateElement.line(0, 0, 512, 0),     // 0: th
		TemplateElement.line(512, 0, 512, 512), // 1: rv
		TemplateElement.line(512, 512, 0, 512), // 2: bh
		TemplateElement.line(0, 512, 0, 0),     // 3: lv
		// cross:
		TemplateElement.line(256, 0, 256, 512),
		TemplateElement.line(0, 256, 512, 256),
		TemplateElement.line(128, 0, 128, 512),
		TemplateElement.line(384, 0, 384, 512),
		TemplateElement.line(0, 128, 512, 128),
		TemplateElement.line(0, 384, 512, 384),
		// subcrosses:
		TemplateElement.line(64, 0, 64, 512),   // vertical 1
		TemplateElement.line(192, 0, 192, 512), // vertical 2
		TemplateElement.line(320, 0, 320, 512), // vertical 3
		TemplateElement.line(448, 0, 448, 512), // vertical 4
		TemplateElement.line(0, 64, 512, 64),   // horizont 1
		TemplateElement.line(0, 192, 512, 192), // horizont 2
		TemplateElement.line(0, 320, 512, 320), // horizont 3
		TemplateElement.line(0, 448, 512, 448), // horizont 4
		// diag1
		TemplateElement.line(64, 0, 0, 64),
		TemplateElement.line(128, 0, 0, 128),
		TemplateElement.line(192, 0, 0, 192),
		TemplateElement.line(256, 0, 0, 256),
		TemplateElement.line(320, 0, 0, 320),
		TemplateElement.line(384, 0, 0, 384),
		TemplateElement.line(448, 0, 0, 448),
		TemplateElement.line(512, 0, 0, 512),
		TemplateElement.line(512, 64, 64, 512),
		TemplateElement.line(512, 128, 128, 512),
		TemplateElement.line(512, 192, 192, 512),
		TemplateElement.line(512, 256, 256, 512),
		TemplateElement.line(512, 320, 320, 512),
		TemplateElement.line(512, 384, 384, 512),
		TemplateElement.line(512, 448, 448, 512),
		// diag2
		TemplateElement.line(448, 0, 512, 64),
		TemplateElement.line(384, 0, 512, 128),
		TemplateElement.line(320, 0, 512, 192),
		TemplateElement.line(256, 0, 512, 256),
		TemplateElement.line(192, 0, 512, 320),
		TemplateElement.line(128, 0, 512, 384),
		TemplateElement.line(64, 0, 512, 448),
		TemplateElement.line(0, 0, 512, 512),
		TemplateElement.line(0, 64, 448, 512),
		TemplateElement.line(0, 128, 384, 512),
		TemplateElement.line(0, 192, 320, 512),
		TemplateElement.line(0, 256, 256, 512),
		TemplateElement.line(0, 320, 192, 512),
		TemplateElement.line(0, 384, 128, 512),
		TemplateElement.line(0, 448, 64, 512)
		// circles
		/*
		TemplateElement.ellipse(512, 0, 128, 128, 0),
		TemplateElement.ellipse(0, 512, 128, 128, 0),
		TemplateElement.ellipse(512, 512, 128, 128, 0),
		TemplateElement.ellipse(0, 0, 128, 128, 0),
		*/
		// , TemplateElement.ellipse(256, 512, 100, 192, 0)
		]);

export const squareBasicTemplate: () => Template = () => new Template(4, [
	// square:
	TemplateElement.line(0, 0, 512, 0),     // 0: th
	TemplateElement.line(512, 0, 512, 512), // 1: rv
	TemplateElement.line(512, 512, 0, 512), // 2: bh
	TemplateElement.line(0, 512, 0, 0),     // 3: lv
	// cross:
	TemplateElement.line(256, 0, 256, 512), // 4: cv
	TemplateElement.line(0, 256, 512, 256), // 5: ch
	// diagonal:
	TemplateElement.line(0, 0, 512, 512),   // 6: dtl
	TemplateElement.line(0, 512, 512, 0),   // 7: dtr
	// circles:
	TemplateElement.ellipse(256, 256, 90, 90, 0),
	TemplateElement.ellipse(256, 256, 90 + 38, 90 + 38, 0),
	TemplateElement.ellipse(256, 256, 90 + 90 + 38, 90 + 90 + 38, 0),
	TemplateElement.ellipse(256, 256, 90 + 90 + 38 + 38, 90 + 90 + 38 + 38, 0),
	// h lines:
	TemplateElement.line(0, 410, 512, 410), // 11: b1
	TemplateElement.line(0, 384, 512, 384), // 12: b2
	TemplateElement.line(0, 346, 512, 346), // 13: b3
	TemplateElement.line(0, 166, 512, 166), // 14: b4
	TemplateElement.line(0, 128, 512, 128), // 15: b5
	TemplateElement.line(0, 102, 512, 102), // 16: b6
	// v lines:
	TemplateElement.line(102, 0, 102, 512), // 17: l1
	TemplateElement.line(128, 0, 128, 512),
	TemplateElement.line(166, 0, 166, 512),
	TemplateElement.line(346, 0, 346, 512),
	TemplateElement.line(384, 0, 384, 512),
	TemplateElement.line(410, 0, 410, 512)
]);

export const triVDefaultTemplate: () => Template =
	() => new Template(3,
	// sides: 418
	// h: 362 (s/2 * sqrt(3))
	// top margin: 28
	// top:   209, 362
	// right: 418, 390
	// left:  0,   390
	// Centroid: 209,  269
	[
	// triangle:
	TemplateElement.line(418, 390, 209, 26),  // 0: rt
	TemplateElement.line(0, 390, 209, 26),   // 1: lt
	TemplateElement.line(0, 390, 418, 390),  // 2: bh
	// main cross
	TemplateElement.line(209, 26, 209, 390),
	TemplateElement.line(128, 0, 128, 512), // 4: cv
	TemplateElement.line(384, 0, 384, 512), // 5: ch
	TemplateElement.line(0, 128, 512, 128), // 5: ch
	TemplateElement.line(0, 384, 512, 384), // 5: ch
	// circles
	TemplateElement.ellipse(209, 269, 121, 121, 0),
	TemplateElement.ellipse(209, 269, 70, 70, 0),
	// centroid cross
	TemplateElement.ellipse(104, 209, 418, 390, 0),
	TemplateElement.ellipse(313, 209, 0, 390, 0),
	// bottom equilateral vlines
	TemplateElement.line(281, 390, 348, 269),
	TemplateElement.line(138, 390, 70, 270),
	TemplateElement.line(279, 148, 139, 148),
	// TRI
	TemplateElement.line(138, 148, 281, 390),
	TemplateElement.line(279, 148, 138, 390),
	TemplateElement.line(347, 269, 70, 269) ],
	418, 0);

export const triHDefaultTemplate: () => Template = () => {
	const d: Template = triVDefaultTemplate();
	return new Template(d.base, d.elements, d.resolution, 30);
};
