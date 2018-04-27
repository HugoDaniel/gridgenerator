import { FatState, FillId, RGBColor, UIShapeEditorMode, Vector2D } from '../../data';
import { Movement, Runtime } from '../../engine';
import { getEventX, getEventY, IEventHandler } from '../common';
import { IShapePointAttribs } from '../components/editor/shape/point';
import { Refresher } from './refresher';
import { ExportEditorMode } from '../../data/state/ui/export';

export class ShapeEditorEvents implements IEventHandler {
	public runtime: Runtime;
	public state: FatState;
	public refresher: Refresher;
	public onPointAction: (e: IShapePointAttribs) => void;
	public onShapeMount: () => void;
	public onReverseTo: (actionIndex: number) => void;
	public onSolveAmbiguity: (index: number) => void;
	public onFigureSelect: (data: { d: string, index: number}) => void;
	public onFigureDelete: () => void;
	public onFigureEdit: () => void;
	public onFigureFill: () => void;
	public onFigureFillDone: () => void;
	public onEnterTemplateSelector: () => void;
	public onExitTemplateSelector: () => void;
	public onTemplateSelect: (tid: number) => void;
	// event handler stuff:
	public onMouseDown: (e: MouseEvent) => void;
	public onMouseMove: (e: MouseEvent) => void;
	public onMouseUp: (e: MouseEvent) => void;
	public onTouchStart: (e: TouchEvent) => void;
	public onTouchMove: (e: TouchEvent) => void;
	public onTouchEnd: (e: TouchEvent) => void;
	public onTouchCancel: (e: TouchEvent) => void;
	constructor(rt: Runtime, s: FatState, refresher: Refresher) {
		this.runtime = rt;
		this.state = s;
		this.refresher = refresher;
		this.onShapeMount = () => {
			this.runtime.rects.shapeEditorRect();
			this.refresher.refreshRuntimeOnly(this.runtime);
		};
		this.onMouseDown = (e) => {
			// this.onStartMovement(getEventX(e), getEventY(e));
		};
		this.onMouseUp = (e) => {
			// this.onStopMovement();
		};
		this.onMouseMove = (e) => {
			// this.onMovement(getEventX(e), getEventY(e));
		};
		this.onTouchStart = (e) => {
			console.log('AHNDLING START TOUCH', e);
			const curMode = this.state.current.ui.shapeEditor.editorMode;
			if (curMode === UIShapeEditorMode.Shape) {
				const touch = e.touches.item(0);
				if (touch) {
					const x = touch.clientX;
					const y = touch.clientY;
					// check if zoom
					if (!this.runtime.movement) {
						this.runtime.movement = new Movement(x, y, true);
					} else {
						this.runtime.movement.start(x, y);
					}
					this.refresher.refreshRuntimeOnly(this.runtime);
				}
			} else {
				this.runtime.movement = null;
				this.refresher.refreshRuntimeOnly(this.runtime);
			}
		};
		this.onTouchMove = (e) => {
			// this.onMovement(getEventX(e), getEventY(e));
		};
		this.onTouchEnd = (e) => {
			const rect = this.runtime.rects.shapeEditor;
			if (!rect) {
				throw new Error('Unable to handle mousedown in shape: no shape client rect');
			}
			if (this.runtime.movement) {
				const x = this.runtime.movement.startX;
				const y = this.runtime.movement.startY;
				// check if the touch was outside the shape editor rectangle
				if (!this.runtime.rects.isInside(x, y, rect) && e.touches.length <= 1) {
					return true;
				}
				// adjust to template resolution
				const xparam = (x - rect.left) / rect.width;
				const yparam = (y - rect.top) / rect.height;
				const templateRes = this.state.current.shapes.editor.template.resolution;
				// fetch the nearest point
				const pt = this.state.current.nearestActivePt(xparam * templateRes, yparam * templateRes);
				if (pt) {
					// convert to IShapePointAttribs and call the normal action on the pt
					this.onPointAction({
						x: pt.x,
						y: pt.y,
						isOtherEdge: this.state.current.isOtherEdge(pt.x, pt.y),
						isCurrentEdge: this.state.current.isCurrentEdge(pt.x, pt.y)
					});
				}
				this.runtime.movement.end();
				this.refresher.refreshRuntimeOnly(this.runtime);
				return true;
			} else {
				return true;
			}
		};
		this.onTouchCancel = (e) => {
			// this.onStopMovement();
		};
		this.onPointAction = (e: IShapePointAttribs) => {
			/* x; y; isOtherEdge?; isEdge?; isSelected?; isReachable?; isActive?;
			*/
			const pt = new Vector2D(e.x, e.y);
			if (e.isOtherEdge) {
				// gen a rnd color and fill and close the shape
				const rndSat = Math.random() * 0.45 + 0.4;
				const rndLight = Math.random() * 0.45 + 0.4;
				const colors: RGBColor[] = [
					RGBColor.randomHering(rndSat, rndLight, Math.random())
				];
				const fillId: FillId[] = this.state.current.newFillIds(this.runtime.rnd, 1);
				this.state.shapeClose(pt, colors, fillId);
			} else {
				this.state.shapePointAction(pt);
			}
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onReverseTo = (actionIndex: number) => {
			this.state.shapeReverseTo(actionIndex);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onSolveAmbiguity = (index: number) => {
			this.state.shapeSolveAmbiguity(index);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onFigureSelect = (data: { d: string, index: number}) => {
			this.state.shapeSelectFigure(data.d);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onFigureDelete = () => {
			this.state.shapeDeleteFigure();
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onFigureEdit = () => {
			this.state.shapeEditFigure();
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onFigureFill = () => {
			this.state.shapeFillFigure();
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onEnterTemplateSelector = () => {
			this.state.shapeEnterTemplateSelector();
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onTemplateSelect = (tid: number) => {
			this.state.shapeSelectTemplate(tid);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onExitTemplateSelector = () => {
			this.state.shapeExitTemplateSelector();
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onFigureFillDone = () => {
			this.state.shapeFillDone();
			this.refresher.refreshStateAndDOM(this.state);
		};
	}
}
