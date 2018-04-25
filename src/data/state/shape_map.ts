import { ColorDefaults } from './color/defaults';
import { GridType } from './layer/grid';
import { RandomArray } from './math/random';
import { Vector2D } from './math/vector';
import { Path, PathActionReviver, PathReviver } from './shape/path';
import { Shape, ShapeFillSetId, ShapeReviver } from './shape/shape';
import { squareDefaultTemplate, squareDiagTemplate, squareRoundTrisTemplate, Template, TemplateReviver, triHDefaultTemplate, triVDefaultTemplate } from './shape/template';

export type ShapeId = number;
export interface ShapeMapReviver {
	s: Array<[number, ShapeReviver]>;
	c: number | null;
	t: Array<[number, TemplateReviver[]]>;
	e: PathReviver;
	ety: number;
	et: TemplateReviver;
}
// ShapeMap holds all the shapes in the project (in the map)
// Layers store the key of each shape used
export class ShapeMap {
	private shapes: Map<ShapeId, Shape>;
	public created: ShapeId | null;
	// ^ the last created id
	private templates: Map<GridType, Template[]>;
	// ^ the default template for each shape type;
	// this allows the user to change the default editor when creating
	// a new shape (it is always the first one)
	private _editor: Path;
	private _editorType: GridType;
	private _editorTemplate: Template;
	constructor(type: GridType = GridType.Square, shapeId: number = 1, fillsForDefaultShape = [ColorDefaults.YELLOW, ColorDefaults.BLUE, ColorDefaults.GREEN]) {
		this.templates = new Map();
		this.templates.set(GridType.Square, [squareDefaultTemplate(), squareDiagTemplate(), squareRoundTrisTemplate()]);
		/* IN THE FUTURE:
		this.templates.set(GridType.TriangleH, [triHDefaultTemplate()]);
		this.templates.set(GridType.TriangleV, [triVDefaultTemplate()]);
		*/
		const t = this.templates.get(type);
		if (!t || t.length === 0) {
			throw new Error(`Cannot create ShapeMap(), unknown grid type ${type}`);
		}
		const defaultTemplate = t[0];
		this._editor = new Path(defaultTemplate);
		this._editorType = type;
		this._editorTemplate = defaultTemplate;
		this.shapes = new Map();
		this.shapes.set(shapeId, Shape.FullSquare(fillsForDefaultShape, defaultTemplate));
		this.created = shapeId;
	}
	public toJSON(): ShapeMapReviver {
		return {
			s: [...this.shapes.entries()].map((sm) => [sm[0], sm[1].toJSON()] as [number, ShapeReviver]),
			c: this.created,
			t: [...this.templates.entries()].map((ts) =>
				[
					ts[0],
					ts[1].map((temp) => temp.toJSON()) as TemplateReviver[]
				] as [number, TemplateReviver[]]),
			e: this._editor.toJSON(),
			ety: this._editorType,
			et: this._editorTemplate.toJSON()
		};
	}
	public static revive(o: ShapeMapReviver) {
		const templates = new Map(
			o.t.map((smt) =>
				[smt[0], smt[1].map(Template.revive)] as [number, Template[]])
		);
		const shapes = new Map(
			o.s.map((sms) =>
				[sms[0], Shape.revive(sms[1])] as [ShapeId, Shape])
		);
		const result = new ShapeMap();
		result.shapes = shapes;
		result.created = o.c;
		result.templates = templates;
		result._editorType = o.ety;
		result._editorTemplate = Template.revive(o.et);
		result._editor = Path.revive(o.e, result._editorTemplate);
		return result;
	}
	public availableTemplates() {
		const type = this._editorType;
		const templates = this.templates.get(type);
		if (!templates || templates.length === 0) {
			throw new Error('No templates available for the selected shape type');
		}
		return templates;
	}
	public getRndShapeId(rndGen: RandomArray): number {
		let shapeId = rndGen.pop();
		while (this.shapes.has(shapeId)) {
			shapeId = rndGen.pop();
		}
		return shapeId;
	}
	public getAllShapeIds(): ShapeId[] {
		const result: ShapeId[] = [];
		for (const k of this.shapes.keys()) {
			result.push(k);
		}
		return result;
	}
	public svgShapeStrings(shapeIds: ShapeId[]): string[][] {
		const result: string[][] = [];
		for (let i = 0; i < shapeIds.length; i++) {
			const shape = this.shapes.get(shapeIds[i]);
			if (shape) {
				result.push(shape.svgPathStrings());
			}
		}
		return result;
	}
	public getShapeById(shapeId: ShapeId): Shape | undefined {
		return this.shapes.get(shapeId);
	}
	get editor(): Path {
		return this._editor;
	}
	public saveCurrentShape(type: GridType, shapeId: ShapeId, shapeFillId: ShapeFillSetId): Shape {
		this.created = shapeId;
		const result = new Shape(type, this._editor, shapeFillId);
		this.shapes.set(shapeId, result);
		this._editor = new Path(this._editor.template);
		return result;
	}
	public newShape(type: GridType): Path {
		const t = this.templates.get(type);
		if (!t || t.length === 0) {
			throw new Error(`Cannot find the default template for grid type ${type}`);
		}
		const defaultTemplate = t[0];
		this._editor = new Path(defaultTemplate);
		// don't create the shape here.
		// the shape is only created when the user has finished editing it
		return this._editor;
	}
	public editorNewTemplate(tid: number): Path {
		const type = this._editorType;
		const t = this.templates.get(type);
		if (!t || t.length <= tid) {
			throw new Error(`Cannot find the desired template for grid type ${type}`);
		}
		const template = t[tid];
		this._editor = new Path(template);
		this._editorTemplate = template;
		// don't create the shape here.
		// the shape is only created when the user has finished editing it
		return this._editor;
	}
	public editorCloseShape(pt: Vector2D, fillId: number) {
		this._editor.closeWithPt(pt, fillId);
		return this;
	}
	public editorSelectPt(pt: Vector2D): ShapeMap {
		this._editor.selectPoint(pt);
		return this;
	}
	public editorReverseTo(i: number): ShapeMap {
		this._editor.reverseTo(i);
		return this;
	}
	public editorSolveAmbiguity(i: number): ShapeMap {
		this._editor.solveAmbiguity(i);
		return this;
	}
	public editorDiscardCurrent(): ShapeMap {
		this._editor.discardCurrent();
		return this;
	}
	public editorDeleteShape(i: number): ShapeMap {
		this._editor.removeShape(i);
		return this;
	}
	public editorChangeShape(i: number): ShapeMap {
		this._editor.changeShape(i);
		return this;
	}
	public entries() {
		return this.shapes.entries();
	}
	/**
	 * Changes the FillId on the selected path of the given shape
	 */
	public setShapeFillId(shapeId: number, fillId: number) {
		const shape = this.shapes.get(shapeId);
		if (!shape) {
			throw new Error('Cannot find the shape');
		}
		shape.selectedFillId = fillId;
	}
	////////////////////
	////////////////////
	////////////////////
	/*

	public closeShapePt(pt: Vector2D, fillId: number): ShapeMap {
		this.editor.closeWithPt(pt, fillId);
		return this;
	}
	public toggleShape(shapeId: number): ShapeMap {
		this.editor.toggleVisibility(shapeId);
		return this;
	}
	public removeEditorShape(shapeId: number): ShapeMap {
		this.editor.removeShape(shapeId);
		return this;
	}
	public registerShape(shape: Shape, shapeId: number): ShapeMap {
		if (this.shapes.has(shapeId)) {
			throw new Error(`Cannot register shape id ${shapeId}: already present in shapes`);
		}
		this.shapes.set(shapeId, shape);
		this.created = shapeId;
		return this;
	}
	public editorDone(shapeId: number, shapeFillId: number): ShapeMap {
		this.registerShape(new Shape(this.editor, shapeFillId), shapeId);
		this.editor = new Path(this.editor.template);
		return this;
	}
	public editorExit(): ShapeMap {
		this.editor = new Path(this.editor.template);
		return this;
	}
	public selectShapeFill(shapeId: number, shapeFillId: number): ShapeMap {
		const shape = this.shapes.get(shapeId);
		if (!shape) {
			throw new Error(`Cannot select shape fill: shape id '${shapeId}' not found`);
		}
		shape.selectFill(shapeFillId);
		return this;
	}
	public addNewFills(shapeId: number, fillLst: number[], shapeFillId: number): ShapeMap {
		const shape = this.shapes.get(shapeId);
		if (!shape) {
			throw new Error(`Cannot add new fills to shape: shape id '${shapeId}' not found`);
		}
		shape.addNewFills(fillLst, shapeFillId);
		this.editor = shape.editor;
		return this;
	}
	public switchColors(shapeId: number): ShapeMap {
		const shape = this.shapes.get(shapeId);
		if (!shape) {
			throw new Error(`Cannot switch shape colors: shape id '${shapeId}' not found`);
		}
		const fills = shape.getSelectedFills();
		if (!fills) {
			throw new Error(`The selected shape fill is empty, shapeId: ${shapeId};`);
		}
		this.editor = shape.editor.updateWithFill(fills);
		return this;
	}
	public deleteNewFills(shapeId: number): ShapeMap {
		const shape = this.shapes.get(shapeId);
		if (!shape) {
			throw new Error(`Cannot delete shape new fills: shape id '${shapeId}' not found`);
		}
		shape.discardNewFill();
		return this;
	}
	public removeSelectedFill(shapeId: number): ShapeMap {
		const shape = this.shapes.get(shapeId);
		if (!shape) {
			throw new Error(`Cannot remove selected fill: shape id '${shapeId}' not found`);
		}
		shape.removeSelectedFill();
		return this;
	}
	public removeShape(shapeId: number): ShapeMap {
		this.shapes.delete(shapeId);
		if (this.created === shapeId) {
			this.created = null;
		}
		return this;
	}
	*/
}
