import { FatState, FillId, RGBColor, ShapeId, ToolsMenuId } from '../../data';
import { ColorCanvasPainter, Runtime } from '../../engine';
import { Refresher } from './refresher';

export class HUDEvents {
	public runtime: Runtime;
	public state: FatState;
	public refresher: Refresher;
	private openScene: (onDone: () => void) => void;
	private closeScene: (onDone?: () => void) => void;
	private redrawScene: (onDone?: () => void) => void;
	public showEditor: () => void; // called when the scene finished opening
	public onNewFill: () => void;
	public onNewShape: () => void;
	public onFeaturesMenu: (feature: string, e: Event) => void;
	public onExitFeatures: (onDone?: () => void) => void;
	public onDiscardFill: () => void;
	public onDiscardShape: () => void;
	public onSaveFill: () => void;
	public onSaveShape: () => void;
	public onSelectShape: (shapeId: ShapeId) => void;
	public onSelectFill: (fillId: ShapeId) => void;
	public onSelectTool: (toolId: ToolsMenuId, e: Event) => void;
	public onClearAll: () => void;
	constructor(rt: Runtime, s: FatState, refresher: Refresher, openScene: (onDone: () => void) => void, closeScene: (onDone: () => void) => void, redrawScene: (onDone: () => void) => void) {
		this.runtime = rt;
		this.state = s;
		this.refresher = refresher;
		this.openScene = openScene;
		this.closeScene = closeScene;
		this.redrawScene = redrawScene;
		this.showEditor = () => {
			this.state.hudUIEditorOnTop();
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onDiscardShape = () => {
			this.state.hudDiscardNewShape();
			// update the DOM
			this.refresher.refreshAll(this.runtime, this.state);
			// start the scene animation
			this.closeScene(() => {
				if (this.state.current.ui.exitingEditor) {
					this.state.hudUICloseNewShape();
					this.refresher.refreshStateAndDOM(this.state);
				}
			});
		};
		this.onFeaturesMenu = (feature: string, e: Event) => {
			e.preventDefault();
			// prepare the state:
			this.state.hudEnterFeature(feature);
			// update the DOM
			this.refresher.refreshStateAndDOM(this.state);
			// start the scene animation
			this.openScene(this.showEditor);
		};
		this.onNewShape = () => {
			// preapre the state:
			this.state.hudEnterNewShape();
			// update the DOM
			this.refresher.refreshStateAndDOM(this.state);
			// start the scene animation
			this.openScene(this.showEditor);
		};
		this.onNewFill = () => {
			// get the number of paths present in the selected shape
			const numFills = this.state.current.selectedShapeNumFills;
			// generate the shape fill set id, and the fill ids
			const shapeFillSetId = this.state.current.newShapeFillSetId(this.runtime.rnd);
			const fillIds = this.state.current.newFillIds(this.runtime.rnd, numFills);
			// generate random colors
			const colors: RGBColor[] = [];
			for (let c = 0; c < numFills; c++) {
				const rndSat = Math.random() * 0.65 + 0.2;
				const rndLight = Math.random() * 0.65 + 0.2;
				colors.push(RGBColor.randomHering(rndSat, rndLight, Math.random()));
			}
			// call the state hud function
			this.state.hudEnterNewFill(shapeFillSetId, fillIds, colors);
			// start the scene animation
			this.openScene(this.showEditor);
			// update the DOM
			this.refresher.refreshAll(this.runtime, this.state);
			// update the color canvas
			if (this.runtime.colorPickerCtx) {
				ColorCanvasPainter.INIT(this.runtime.colorPickerCtx, this.state.current);
			}
		};
		this.onExitFeatures = (onDone) => {
			this.state.featuresExit();
			this.refresher.refreshAll(this.runtime, this.state);
			this.closeScene(() => {
				if (this.state.current.ui.exitingEditor) {
					this.state.featuresClose();
					this.refresher.refreshStateAndDOM(this.state);
					if (onDone && typeof onDone === 'function') {
						onDone();
					}
				}
			});
		};
		this.onDiscardFill = () => {
			this.state.hudDiscardNewFills();
			// update the DOM
			this.refresher.refreshAll(this.runtime, this.state);
			// start the scene animation
			this.closeScene(() => {
				if (this.state.current.ui.exitingEditor) {
					this.state.hudUICloseNewFill();
					this.refresher.refreshStateAndDOM(this.state);
				}
			});
		};
		this.onSaveFill = () => {
			this.state.hudSaveNewFills();
			// update the DOM (needed before calling closeScene(), to set z-index)
			this.refresher.refreshAll(this.runtime, this.state);
			// start the scene animation
			this.closeScene(() => {
				if (this.state.current.ui.exitingEditor) {
					this.state.hudUICloseNewFill();
					this.refresher.refreshStateAndDOM(this.state);
				}
			});
			// update the runtime textures and the clipspace info
			Runtime.resetClipSpace(this.runtime, this.state.current).then((_rt) => {
				// update the DOM
				this.refresher.refreshAll(_rt, this.state);
				// redraw gl scene
				this.redrawScene();
			});
		};
		this.onSaveShape = () => {
			const shapeId = this.state.current.newShapeId(this.runtime.rnd);
			const shapeFillSetId = this.runtime.rnd.pop();
			const type = this.state.current.currentLayerType;
			this.state.hudSaveShape(type, shapeId, shapeFillSetId);
			// update the DOM (needed before calling closeScene(), to set z-index)
			this.refresher.refreshAll(this.runtime, this.state);
			// start the open/close scene column animation
			this.closeScene(() => {
				if (this.state.current.ui.exitingEditor) {
					this.state.hudUICloseNewShape();
					this.refresher.refreshStateAndDOM(this.state);
				}
			});
			// update the runtime textures and clipspace
			Runtime.resetClipSpace(this.runtime, this.state.current).then((_rt) => {
				this.refresher.refreshAll(_rt, this.state);
				// redraw gl scene
				this.redrawScene();
			});
			return null;
		};
		this.onSelectShape = (shapeId: ShapeId) => {
			// rotate shape if the shape is currently the selected on
			const layer = this.state.current.layers.getSelected();
			// change to paint mode
			if (this.state.current.ui.currentTool !== ToolsMenuId.Paint) {
				this.state.hudSelectShape(shapeId);
			} else if (shapeId === layer.selectedShape) {
				this.state.hudRotateShape();
			} else {
				this.state.hudSelectShape(shapeId);
			}
			this.refresher.refreshAll(this.runtime, this.state);
		};
		this.onSelectFill = (fillId: FillId) => {
			this.state.hudSelectFill(fillId);
			this.refresher.refreshAll(this.runtime, this.state);
		};
		this.onSelectTool = (toolsId: ToolsMenuId, e: Event) => {
			e.preventDefault();
			this.state.hudSelectTool(toolsId);
			this.refresher.refreshAll(this.runtime, this.state);
		};
		this.onClearAll = () => {
			this.state.hudClearAll();
			// update the runtime textures and clipspace
			Runtime.resetClipSpace(this.runtime, this.state.current, true).then((_rt) => {
				this.refresher.refreshAll(_rt, this.state);
				// redraw gl scene
				this.redrawScene();
			});
		};
 	}
}
