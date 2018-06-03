import { FillId, FillMap, FillMapReviver } from './state/fill_map';
import { Grid, GridType, IGridDimension } from './state/layer/grid';
import { LayerMap, LayerMapReviver } from './state/layer_map';
import { RandomArray } from './state/math/random';
import { Vector2D } from './state/math/vector';
import { Shape, ShapeFillSetId } from './state/shape/shape';
import { ShapeId, ShapeMap, ShapeMapReviver } from './state/shape_map';
import { UI, UIReviver } from './state/ui';
import { ClipPattern, PatternHit } from './state/ui/clip_pattern';
import { Viewport, ViewportReviver } from './state/viewport';
export interface IStateSVGParts {
	viewbox: [number, number, number, number];
	defs: string[];
	layerUse: string[];
}
export interface StateReviver {
	version: number;
	fills: FillMapReviver;
	shapes: ShapeMapReviver;
	viewport: ViewportReviver;
	layers: LayerMapReviver;
	ui: UIReviver;
}
export class State {
	public readonly version: number;
	private _fills: FillMap;
	private _shapes: ShapeMap;
	private _viewport: Viewport;
	private _layers: LayerMap;
	private _ui: UI;
	constructor(maxSize: number = 256) {
		this.version = 0;
		this._fills = new FillMap();
		this._shapes = new ShapeMap();
		this._viewport = new Viewport(undefined, undefined, undefined, maxSize);
		const shapeIds = this._shapes.getAllShapeIds();
		const shape = this._shapes.getShapeById(shapeIds[0]);
		if (!shape) {
			throw new Error(`Cannot initialize State, no shape can be selected`);
		}
		this._layers = new LayerMap(GridType.Square, shapeIds, shapeIds[0], shape.selectedFillSet);
		this._ui = new UI(this._layers.getSelected(), this._shapes, this._fills);
	}
	public toJSON(): StateReviver {
		return {
			version: this.version,
			fills: this._fills.toJSON(),
			shapes: this._shapes.toJSON(),
			viewport: this._viewport.toJSON(),
			layers: this._layers.toJSON(),
			ui: this._ui.toJSON()
		};
	}
	public static revive(r: StateReviver) {
		const result = new State();
		// ^ implicitly sets the version to the most current on
		result._fills = FillMap.revive(r.fills);
		result._shapes = ShapeMap.revive(r.shapes);
		result._viewport = Viewport.revive(r.viewport);
		result._layers = LayerMap.revive(r.layers);
		result._ui = UI.revive(r.ui);
		return result;
	}
	get isEmpty(): boolean {
		const numLayers = this._layers.layers.size;
		const dims = this.currentLayer.dimensions();
		return numLayers === 1 && dims.height === 0 && dims.width === 0;
	}
	get viewport(): Viewport {
		return this._viewport;
	}
	get fills(): FillMap {
		return this._fills;
	}
	get shapes(): ShapeMap {
		return this._shapes;
	}
	get ui(): UI {
		return this._ui;
	}
	//#region Layer
	get layers(): LayerMap {
		return this._layers;
	}
	get currentLayer(): Grid {
		return this._layers.getSelected();
	}
	get pattern(): ClipPattern | null {
		if (!this.currentLayer.pattern) {
			return null; // no pattern in the grid
		}
		const lid = this._layers.selectedLayerId;
		const clipPattern = this._ui.patterns.get(lid);
		if (!clipPattern) {
			return null;
		} else {
			return clipPattern;
		}
	}
	get isPatternOn(): boolean {
		return this.ui.toolsSubmenus.isGridPatternOn;
	}
	public updatePatternsPos(): State {
		for (const clip of this.ui.patterns.values()) {
			if (clip) {
				// console.log('UPDATING CLIP PATTERN POS');
				clip.updateFromViewport(this.viewport);
			}
		}
		return this;
	}
	public patternHit(x: number, y: number): PatternHit {
		const pattern = this.pattern;
		if (pattern) {
			return pattern.hit(x, y);
		}
		return PatternHit.Inside;
	}
	//#endregion
	//#region Shape
	get currentLayerType(): GridType {
		return this._layers.getSelected().type;
	}
	get layerShapeOutline(): string {
		return this._shapes.editor.template.baseString;
	}
	get layerShapeRes(): number {
		return this._shapes.editor.template.resolution;
	}
	get selectedShape(): Shape {
		const shape = this._shapes.getShapeById(this._layers.getSelected().selectedShape);
		if (!shape) {
			throw new Error('state.selectedShape -> No shape is selected in the current layer');
		}
		return shape;
	}
	get selectedShapeId(): number {
		return this._layers.getSelected().selectedShape;
	}
	// returns the number of svg paths in the current selected shape
	get selectedShapeNumFills(): number {
		return this.selectedShape.editor.numVisibleShapes;
	}
	public newShapeFillSetId(rnd: RandomArray): ShapeFillSetId {
		return this.selectedShape.rndShapeFillSetId(rnd);
	}
	public newShapeId(rnd: RandomArray): ShapeId {
		return this._shapes.getRndShapeId(rnd);
	}
	public nearestActivePt(x: number, y: number): Vector2D | undefined {
		return this._shapes.editor.nearestActivePt(x, y);
	}
	public isCurrentEdge(x: number, y: number): boolean {
		const edge = this._shapes.editor.currentEdge;
		if (!edge) {
			return false;
		}
		return edge.x === x && edge.y === y;
	}
	public isOtherEdge(x: number, y: number): boolean {
		const edge = this._shapes.editor.otherEdge;
		if (!edge) {
			return false;
		}
		return edge.x === x && edge.y === y;
	}
	//#endregion
	//#region Fills
	public newFillIds(rnd: RandomArray, ammount: number): FillId[] {
		const unique = new Set();
		const result: FillId[] = [];
		while (unique.size < ammount) {
			const fillId = this._fills.rndFillId(rnd);
			if (unique.has(fillId)) {
				continue;
			}
			unique.add(fillId);
			result.push(fillId);
		}
		return result;
	}
	//#endregion
	private renderSVGDefs(): string[] {
		const result = [] as string[];
		for (const [shapeId, shape] of this._shapes.entries()) {
			result.push(this._fills.buildShapeSymbol(shape, shapeId).join('\n'));
		}
		return result;
	}
	private renderSVGLayer(dim: IGridDimension): string[] {
		const res = this.layerShapeRes;
		return this.currentLayer.renderSVGUse(dim, res);
	}
	public renderSVG(dim: IGridDimension, w: number, h: number): string {
		const res = this.layerShapeRes;
		return (
		`
		<svg ${w && h ? `width="${w}px" height="${h}px"` : ''} viewBox="0 0 ${dim.width * res} ${dim.height * res}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
			<!-- Rendered by GRID GENERATOR at https://gridgenerator.com -->
			<defs>
				${this.renderSVGDefs().join('\n')}
			</defs>
			<g>
			${this.renderSVGLayer(dim).join('\n')}
			</g>
		</svg>
		`);
	}
	public createSVGParts(dim: IGridDimension): IStateSVGParts {
		const res = this.layerShapeRes;
		return {
			viewbox: [0, 0, dim.width * res, dim.height * res ],
			defs: this.renderSVGDefs(),
			layerUse: this.renderSVGLayer(dim)
		};
	}
	public createSVG(): { svg: string, viewbox: [number, number, number, number] } {
		const parts = this.createSVGParts(
			this.currentLayer.dimensions());
		return {
			viewbox: parts.viewbox,
			svg: `
		<defs>
		${parts.defs.join('\n')}
		</defs>
		<g>
		${parts.layerUse.join('\n')}
		</g>`
		};
	}
	public resetUI() {
		this._ui = new UI(this.currentLayer, this._shapes, this._fills);
	}
}
