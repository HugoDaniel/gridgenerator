import { GridType } from '../layer/grid';
import { RandomArray } from '../math/random';
import { Path, PathActionReviver, PathReviver } from './path';
import { Template, TemplateReviver } from './template';

export interface IDupsNeeded { fillIds: number[]; size: number; }
export interface IUpdatedShapeCmds {
	deleted: Map<string, number>; // d, fillId
	created: Array<[string, number]>; // [d, fid]
	changed: Map<string, string>; // oldD, newD
	unchanged: Map<string, number>; // d, fillId
}
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
	get pathFillsSize(): number {
		return this.pathFills.size;
	}
	get fillSetSize(): number {
		return this.pathFills.values().next().value.size;
	}
	/** Returns the maximum fill ids needed to duplicate this whole shape
	 *  Fill ids are counted in the editor (so it counts even if the shape is
	 *  being edited and has new figures to be added)
	 */
	public maxFillIds(): number {
		return this.pathFills.size * Math.max(
			this._editor.fillIds.length,
			this.getSelectedFills().size);
	}
	/**
	 * Returns the fill ids that need to be duplicated, and the number of duplicates needed
	 */
	public needsNewFillIds(cmds: IUpdatedShapeCmds): IDupsNeeded {
		const result = {
			fillIds: [],
			size: this.pathFills.size
		} as IDupsNeeded;
		// deleted fillIds are reused, so disccount them here:
		// const ammount = cmds.created.length - cmds.deleted.size; // reuse old fill ids ?
		const ammount = cmds.created.length;
		if (ammount > 0) {
			/*
			for (let i = ammount - 1; i < cmds.created.length; i++) {
				result.fillIds.push(
					cmds.created[i][1]
				);
			}
			*/
			for (let i = 0; i < cmds.created.length; i++) {
				result.fillIds.push(
					cmds.created[i][1]
				);
			}
		}
		return result;
	}
	/** Compares the shape on the provided path to the current selected shape
	 * creates the commands interface that specify how to transform the current
	 * shapes into the one from the path
	 */
	public analyzeUpdatedShape(p: Path): IUpdatedShapeCmds {
		/*
		assumes that path fillids remain the same
		fill representations must be changed in the fill_map
		for the shape what can happen is:
		- figure removed
			(when fillId is not present in the path fillids)
		- figure added
			(when path fillId is not present in the shape fillids)
		- figure d-string changed
			(when fillId is present but the d string is different from the path svg)
		*/
		const result = {
			deleted: new Map(),
			changed: new Map(),
			created: [],
			unchanged: new Map()
		} as IUpdatedShapeCmds;
		const selected = this.pathFills.get(this.selected);
		if (!selected) {
			throw new Error(`No fill set id is selected`);
		}
		// temporary set of the fillId's present in the current shape fill set id
		const tmpSet = new Set();
		const pfills = p.fillIds;
		const pathFillIds = new Set(pfills);
		// on the selected fill set id from the pathFills:
		for (const [d, fillId] of selected.entries()) {
			if (!pathFillIds.has(fillId)) {
				// current fillId was removed
				result.deleted.set(d, fillId);
			} else {
				// is present, check if d-string is changed
				const newD = p.svgForFillId(fillId);
				const oldD = d;
				if (!newD) {
					// hmm deleted, maybe ?
					// tslint:disable-next-line:no-console
					console.warn('Should not happen, new d string not found for fillId', fillId);
					result.deleted.set(d, fillId);
				} else if (newD !== oldD) {
					result.changed.set(oldD, newD);
				} else {
					// unchanged
					result.unchanged.set(d, fillId);
				}
			}
			// add it to the tmpSet (to speed up the search in the second pass bellow)
			tmpSet.add(fillId);
		}
		// check for new figures
		for (const fig of p.figures()) {
			if (!fig.isHidden) {
				if (!tmpSet.has(fig.fillId)) {
					// new figure
					result.created.push([ fig.d, fig.fillId ]);
				}
			}
		}
		return result;
	}
	/** Updates the current shape with the values present on the editor (path) */
	public updateShape(p: Path, duplicateIds: Map<number, number[]>, cmds: IUpdatedShapeCmds) {
		// DEBUG: console.log('UPDATING SHAPE WITH PATH', p, 'CHANGES', cmds);
		// 1. create a new Map<ShapeFillSetId, Map<string, number>> to replace the current one
		const result = new Map() as Map<ShapeFillSetId, Map<string, number>>;
		// 2. traverse the old map, for each ShapeFillSetId in it
		let at = 0; // keeps track of the position of duplicate fillIds in the dups map from the args
		for (const entry of this.pathFills.entries()) {
			//    a) get the dups map for this shape fill set it
			const dupMap = new Map();
			for (const dup of duplicateIds.entries()) {
				dupMap.set(dup[0], dup[1][at]);
			}
			//    b) update the entry map with the cmds applied on it (returns a new map)
			result.set(entry[0], this.applyCmds(entry[1], cmds, dupMap));
			at++; // update the dups position for the next shape fill set id
		}
		this.pathFills = result;
		// 3. after this function: remove the fill id's present in the IUpdateShapeCmds structure
	}
	/** Applies the commands on a shape fill set map, a new map is created that keeps the order of the old map.
	 *  Returns the updated new map.
	 */
	private applyCmds(m: Map<string, number>, cmds: IUpdatedShapeCmds, dups: Map<number, number>): Map<string, number> {
		const deleteFids = [] as number[];
		const result = [] as Array<[string, number]>;
		// 1. transform the m into an array of [d, fid]
		for (const entry of m.entries()) {
			const d = entry[0];
			const fid = entry[1];
			// 2. traverse this array and build a new one
			// check if the shape was changed and update it
			const changed = cmds.changed.get(d);
			if (changed) {
				entry[0] = changed; // <- updates the shape
				result.push(entry);
			} else if (cmds.deleted.has(d)) {
				// shape was deleted, store the fid to reuse on an eventual new shape
				deleteFids.push(fid);
			} else {
				// unchanged, just push it into the new array
				result.push(entry);
			}
		}
		// 3. in the end put all the created shapes
		for (let i = 0; i < cmds.created.length; i++) {
			// created shape goes in with one of the previously deleted fids
			let fid = deleteFids.pop();
			if (!fid) {
				// if there are no fids available, use the duplicated fids
				fid = dups.get(cmds.created[i][1]);
			}
			// push the new shape into the result (with the reused/duped fid)
			if (fid) {
				result.push([cmds.created[i][0], fid]);
			}
		}
		// 4. return the new Map
		return new Map(result);
	}
	/** Updates the editor by setting its fills with the current selected ones from the shape */
	public updateEditorFills(): Path {
		// this.selected = this.previousSelected || this.pathFills.keys().next().value;
		const fills = this.pathFills.get(this.selected);
		if (!fills) {
			throw new Error(`Cannot discard new Shape fills: No selected fill found in shape ${this.selected}`);
		}
		this._editor.updateWithFill(fills);
		return this._editor;
	}
	public entries() {
		return this.pathFills.entries();
	}
	get selectedFillSet(): ShapeFillSetId {
		return this.selected;
	}
	get fillSetIds(): IterableIterator<ShapeFillSetId> {
		return this.pathFills.keys();
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
