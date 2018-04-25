import { GridType } from '../layer/grid';
import { RandomArray } from '../math/random';
import { Path, PathActionReviver, PathReviver } from './path';
import { Template, TemplateReviver } from './template';

export type ShapeFillSetId = number;
export interface ShapeReviver {
	e: PathReviver;
	pf: Array<[number, Array<[string, number]>]>;
	s: number;
	ps: number | null;
	sp: string;
	c: number;
	ty: number;
	t: TemplateReviver;
}
export class Shape {
	private _editor: Path;
	private pathFills: Map<ShapeFillSetId, Map<string, number>>;
	// ^ 	fill sets are displayed in the UI when this shape is selected
	// ShapeFillSetId is a number managed by this ShapeItem
	// It keyes a Map<path d string, FillId>
	private selected: ShapeFillSetId;
	// ^ the selected pathFill
	private previousSelected: ShapeFillSetId | null;
	// ^ the previous selected pathFill
	private _selectedPath: string;
	// ^ the path selected on the current shape fill set id
	private created: ShapeFillSetId;
	// ^ the last created path fill set it
	public type: GridType;
	private template: Template;
	constructor(type: GridType, editor: Path, shapeFillSetId: number) {
		this._editor = editor;
		this.created = shapeFillSetId;
		this.selected = shapeFillSetId;
		this.previousSelected = null;
		const fillMap = editor.getFillMap();
		this.pathFills = new Map( [ [shapeFillSetId, fillMap] ] );
		this.type = type;
		this._selectedPath = fillMap.keys().next().value;
		this.template = editor.template;
	}
	public toJSON(): ShapeReviver {
		const pathFills = [...this.pathFills.entries()].map(([k, v]) =>
			[k, [...v.entries()]]) as Array<[number, Array<[string, number]>]>;
		return {
			e: this._editor.toJSON(),
			pf: pathFills,
			s: this.selected,
			ps: this.previousSelected,
			sp: this._selectedPath,
			c: this.created,
			ty: this.type,
			t: this.template.toJSON()
		};
	}
	public static revive(o: ShapeReviver) {
		const t = Template.revive(o.t);
		const path = Path.revive(o.e, t);
		const fills = new Map(o.pf.map( (f) =>
			[f[0], new Map(f[1])] as [number, Map<string, number>]));
		const result = new Shape(o.ty, path, 0);
		result.pathFills = fills;
		result.selected = o.s;
		result.previousSelected = o.ps;
		result._selectedPath = o.sp;
		result.created = o.c;
		result.type = o.ty;
		result.template = Template.revive(o.t);
		return result;
	}
	public static FullSquare(fillIds: number[], t: Template): Shape {
		const fillSetId = 1;
		const s = new Shape(GridType.Square, Path.FullSquare(fillIds[0], t), fillSetId);
		for (let i = 0; i < fillIds.length; i++) {
			s.addNewFills([fillIds[i]], i + 1);
		}
		return s;
	}
	public rndShapeFillSetId(rnd: RandomArray) {
		let fillId = rnd.pop();
		while (this.pathFills.has(fillId)) {
			fillId = rnd.pop();
		}
		return fillId;
	}
	get selectedPath(): string {
		return this._selectedPath;
	}
	get selectedPathFillId(): number {
		const pathFillIds = this.pathFills.get(this.selected);
		if (!pathFillIds) {
			throw new Error(`Unknown selected shape fill set id ${this.selected}`);
		}
		const fillId = pathFillIds.get(this._selectedPath);
		if (!fillId) {
			throw new Error(`FillId not found for the selected path ${this._selectedPath}`);
		}
		return fillId;
	}
	set selectedFillId(fid: number) {
		const pathFillIds = this.pathFills.get(this.selected);
		if (!pathFillIds) {
			throw new Error(`Unknown selected shape fill set id ${this.selected}`);
		}
		for (const [pathd, pathfid] of pathFillIds.entries()) {
			if (pathfid === fid) {
				this._selectedPath = pathd;
				return;
			}
		}
		throw new Error(`Cannot set shape fillID ${fid}`);
	}
	get resolution(): number {
		return this._editor.template.resolution;
	}
	public entries() {
		return this.pathFills.entries();
	}
	get selectedFillSet(): ShapeFillSetId {
		return this.selected;
	}
	public svgPathStrings(): string[] {
		return this._editor.getSvgShapes();
	}
	get editor(): Path {
		return this._editor;
	}
	public getSelectedFills(): Map<string, number> {
		const fills = this.pathFills.get(this.selected);
		if (!fills) {
			throw new Error(`Cannot get fills: no fills found in this shape`);
		}
		return fills;
	}
	public addNewFills(fillIds: number[], shapeFillSetId: number): Shape {
		this.pathFills.set(shapeFillSetId, this._editor.changeFills(fillIds));
		this.previousSelected = this.selected;
		this.selected = shapeFillSetId;
		this.created = shapeFillSetId;
		return this;
	}
	public selectFill(fid: number): Shape {
		if (this.pathFills.has(fid)) {
			this.selected = fid;
			return this;
		} else {
			throw new Error(`Cannot select fill because fillId '${fid}' is not present in this brush path fills`);
		}
	}
	public removeSelectedFill(): Shape {
		// do not remove if there is only one fill left
		if (this.pathFills.size === 1) {
			return this;
		} else if (!this.pathFills.has(this.selected)) {
			throw new Error(`Cannot delete because there is no selected fill '${this.selected}' `);
		}
		this.pathFills.delete(this.selected);
		this.selected = this.previousSelected || this.pathFills.keys().next().value;
		return this;
	}
	public discardNewFill(): Shape {
		this.pathFills.delete(this.created);
		this.selected = this.previousSelected || this.pathFills.keys().next().value;
		const fills = this.pathFills.get(this.selected);
		if (!fills) {
			throw new Error(`Cannot discard new Shape fills: No selected fill found in shape ${this.selected}`);
		}
		this._editor.updateWithFill(fills);
		return this;
	}
	public canBeUsed(t: Template): boolean {
		return this._editor.canBeUsedWith(t);
	}
}
