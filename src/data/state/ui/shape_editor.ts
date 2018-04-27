import { VectorSet } from '../math/set';
import { Vector2D } from '../math/vector';
import { Path } from '../shape/path';
export interface UIShapeEditorReviver {
	m: number;
	act: string;
	cpts: Array<[number, number, any]>;
	spts: Array<[number, number, any]>;
	apts: Array<{x: number, y: number}>;
	ce: {x: number, y: number} | null;
	oe: {x: number, y: number} | null;
	tp: string;
	tb: string;
	tr: number;
	trot: number;
	tcs: string;
	ts: string[];
	f: string[];
	ss: number;
	csa: string[];
	sa: number;
	a: string[];
}
export enum UIShapeEditorMode { Shape = 1, Fill, TemplateSelector }
export class UIShapeEditor {
	public editorMode: UIShapeEditorMode;
	public primaryActionTitle: string;
	// ^ button title
	public clickablePts: VectorSet;
	public selectedPts: VectorSet;
	public allPts: Vector2D[];
	// ^ template points
	public currentEdge: Vector2D | null;
	public otherEdge: Vector2D | null;
	// ^ user edges
	public templatePath: string;
	public templateBase: string;
	public templateRes: number;
	public templateRot: number;
	// ^ template stuff
	public currentShape: string;
	public shapesD: string[];
	public fills: string[];
	public selectedShape: number;
	// ^ shapes menu
	public currentShapeActions: string[];
	public selectedAction: number;
	// ^ current shape actions (time-travel)
	public ambiguities: string[];
	constructor() {
		this.editorMode = UIShapeEditorMode.Shape;
		this.primaryActionTitle = 'Create Shape';
		this.clickablePts = new VectorSet();
		this.selectedPts = new VectorSet();
		this.allPts = [];
		this.templatePath = '';
		this.templateBase = '';
		this.currentShape = '';
		this.currentEdge = null;
		this.otherEdge = null;
		this.fills = [];
		this.shapesD = [];
		this.selectedShape = -1;
		this.currentShapeActions = [];
		this.selectedAction = 0;
		this.ambiguities = [];
	}
	public toJSON(): UIShapeEditorReviver {
		return {
			m: this.editorMode,
			act: this.primaryActionTitle,
			cpts: this.clickablePts.toJSON(),
			spts: this.selectedPts.toJSON(),
			apts: this.allPts.map((e) => e.toJSON()),
			ce: this.currentEdge ? this.currentEdge.toJSON() : null,
			oe: this.otherEdge ? this.otherEdge.toJSON() : null,
			tp: this.templatePath,
			tb: this.templateBase,
			tr: this.templateRes,
			trot: this.templateRot,
			tcs: this.currentShape,
			ts: this.shapesD.slice(0),
			f: this.fills.slice(0),
			ss: this.selectedShape,
			csa: this.currentShapeActions.slice(0),
			sa: this.selectedAction,
			a: this.ambiguities.slice(0)
		};
	}
	public static revive(o: UIShapeEditorReviver) {
		const result = new UIShapeEditor();
		result.editorMode = o.m;
		result.primaryActionTitle = o.act;
		result.clickablePts = VectorSet.revive(o.cpts, () => null);
		result.selectedPts = VectorSet.revive(o.spts, () => null);
		result.allPts = o.apts.map(Vector2D.revive);
		result.currentEdge = o.ce ? Vector2D.revive(o.ce) : null;
		result.otherEdge = o.oe ? Vector2D.revive(o.oe) : null;
		result.templatePath = o.tp;
		result.templateBase = o.tb;
		result.templateRes = o.tr;
		result.templateRot = o.trot;
		result.currentShape = o.tcs;
		result.shapesD = o.ts;
		result.fills = o.f;
		result.selectedShape = o.ss;
		result.currentShapeActions = o.csa;
		result.selectedAction = o.sa;
		result.ambiguities = o.a;
		return result;
	}
	public fromPath(p: Path, fills: string[]) {
		this.editorMode = UIShapeEditorMode.Shape;
		this.templatePath = p.template.pathString;
		this.templateBase = p.template.baseString;
		this.templateRes = p.template.resolution;
		this.templateRot = p.template.rotation;
		this.clickablePts = p.getReachable();
		this.selectedPts = p.getSelectedPts();
		this.allPts = p.template.points.toArray();
		const shapes = p.getVisibleShapes();
		const shapeIndex = p.curShapeIndex();
		this.currentShape = shapes[shapeIndex];
		this.currentEdge = p.currentEdge;
		this.otherEdge = p.otherEdge;
		this.shapesD = shapes.slice(0, shapes.length - 1);
		this.fills = fills || [];
		this.currentShapeActions = p.getShapeInstances();
		this.selectedAction = p.getSelectedInstance();
		this.selectedShape = -1;
		this.ambiguities = p.ambiguities;
	}
	public unselectShape(): void {
		this.selectedShape = -1;
	}
	public selectMostRecentShape(): void {
		this.selectedShape = this.shapesD.length - 1;
	}
	public selectShape(shape: string): void {
		this.selectedShape = this.shapesD.indexOf(shape);
	}
	public updateFill(fill: string) {
		this.fills[this.selectedShape] = fill;
	}
}
