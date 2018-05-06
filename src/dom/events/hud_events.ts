import { FatActionSets, FatState, FillId, RGBColor, ShapeId, ToolsMenuId, UIState } from '../../data';
import { ColorCanvasPainter, Runtime } from '../../engine';
import { IEventHandler } from '../common';
import { Refresher } from './refresher';

export class HUDEvents implements IEventHandler {
	public runtime: Runtime;
	public state: FatState;
	public refresher: Refresher;
	private actionSets: FatActionSets;
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
	public onGridPattern: (e: Event) => void;
	public onGridExit: (e: Event) => void;
	// Event Handler methods are used to manipulate the pattern area
	public onMouseUp: (e: MouseEvent) => void;
	public onMouseMove: (e: MouseEvent) => void;
	public onMouseDown: (e: MouseEvent) => void;
	public onTouchStart: (e: TouchEvent) => void;
	public onTouchMove: (e: TouchEvent) => void;
	public onTouchEnd: (e: TouchEvent) => void;
	public onTouchCancel: (e: TouchEvent) => void;
	constructor(rt: Runtime, s: FatState, refresher: Refresher, openScene: (onDone: () => void) => void, closeScene: (onDone: () => void) => void, redrawScene: (onDone: () => void) => void) {
		this.runtime = rt;
		this.state = s;
		this.refresher = refresher;
		this.actionSets = new FatActionSets();
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
			this.shape2Texture();
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
			this.shape2Texture();
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
			// If Undo action
			if (toolsId === ToolsMenuId.Undo) {
				// Move state backwards
				this.runtime.getInitialState().then( (initialState) => {
					this.state.prev(initialState, this.actionSets.undoActions, 1);
					// repaint clipspace and scene
					Runtime.resetClipSpace(this.runtime, this.state.current, true).then(
						(updatedRT) => {
							this.refresher.refreshAll(updatedRT, this.state);
							// redraw gl scene
							this.redrawScene();
						},
						// tslint:disable-next-line:no-console
						(error) => console.warn(`Cannot reset runtime/clipspace to perform Undo action: ${error}`));
				},
				// tslint:disable-next-line:no-console
				(error) => console.warn(`Cannot get initial state to perform Undo action: ${error}`));
			} else {
				this.state.hudSelectTool(toolsId);
				this.refresher.refreshAll(this.runtime, this.state);
			}
				// If Zoom action, immediately perform a zoom action
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
		this.onGridPattern = (e) => {
			e.preventDefault();
			this.state.hudTogglePattern();
			if (this.state.current.ui.toolsSubmenus.isGridPatternOn) {
				// pattern was toggled
				// 1. get the previous pattern dimensions
				const pattern = this.state.current.pattern;
				if (!pattern) {
					const v = this.state.current.viewport;
					// 2. if no pattern was defined, set a 3x3 pattern on the center of the screen
					// a) find the grid element at the center of the screen
					const centerX = v.squareX(this.runtime.width / 2);
					const centerY = v.squareX(this.runtime.height / 2);
					// b) adjust for real layer coords and call fat state function
					this.state.hudNewPattern(v.squareLayerX() + centerX, v.squareLayerY() + centerY);
				}
				// 3. update the ui with the clipspace pattern coords
				this.state.hudUpdatePatternPos();
			}
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onGridExit = (e) => {
			e.preventDefault();
			this.state.hudSelectTool(ToolsMenuId.Paint);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onMouseUp = (e: MouseEvent) => {
			e.preventDefault();
			// stop adjusting the pattern
			this.state.hudStopPatternAdjust();
			// check for pattern, and hide the original grid
			if (this.state.current.currentLayer.pattern && this.runtime.textures) {
				this.runtime.clipSpace.fromGrid(
					this.state.current.viewport,
					this.state.current.currentLayer,
					this.runtime.textures,
					true); // <- hide original grid
				this.redrawScene();
			}
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onMouseMove = (e: MouseEvent) => {
			e.preventDefault();
			const v = this.state.current.viewport;
			// 2. if no pattern was defined, set a 3x3 pattern on the center of the screen
			// a) find the grid element at the center of the screen
			const layerX = v.squareLayerX() + v.squareX(e.clientX);
			const layerY = v.squareLayerY() + v.squareX(e.clientY);
			this.patternify(layerX, layerY, false);
		};
		this.onMouseDown = (e: MouseEvent) => {
			e.preventDefault();
		};
		this.onTouchStart = (e: TouchEvent) => {
			e.preventDefault();
		};
		this.onTouchMove = (e: TouchEvent) => {
			e.preventDefault();
			const v = this.state.current.viewport;
			// 2. if no pattern was defined, set a 3x3 pattern on the center of the screen
			// a) find the grid element at the center of the screen
			const touch = e.touches.item(0);
			if (touch) {
				const layerX = v.squareLayerX() + v.squareX(touch.clientX);
				const layerY = v.squareLayerY() + v.squareX(touch.clientY);
				this.patternify(layerX, layerY, false);
			}
		};
		this.onTouchEnd = (e: TouchEvent) => {
			e.preventDefault();
			this.state.hudStopPatternAdjust();
			// check for pattern, and hide the original grid
			if (this.state.current.currentLayer.pattern && this.runtime.textures) {
				this.runtime.clipSpace.fromGrid(
					this.state.current.viewport,
					this.state.current.currentLayer,
					this.runtime.textures,
					true); // <- hide original grid
				this.redrawScene();
			}
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onTouchCancel = (e: TouchEvent) => {
			e.preventDefault();
		};
	}
	/** Renders the shape into a GPU Texture and refreshes all the state */
	private shape2Texture() {
		const shape = this.state.current.selectedShape;
		const shapeId = this.state.current.selectedShapeId;
		const newFillSetId = this.state.current.selectedShape.selectedFillSet;
		const size = this.runtime.getTextureSize(this.state.current.viewport);
		const svg = this.state.current.fills.buildSVG(
			shape.resolution, shape.getSelectedFills(), size, size);
		this.runtime.addTexture(shapeId, newFillSetId, svg).then(() => {
			// update the DOM
			this.refresher.refreshAll(this.runtime, this.state);
			// redraw gl scene
			this.redrawScene();
		});
	}
	private patternify(layerX: number, layerY: number, show: boolean) {
		const pattern = this.state.current.pattern;
		// only update if necessary:
		if (pattern) {
			if (this.state.current.ui.at === UIState.PatternAdjustEnd
			&& (pattern.gridPattern.endX === layerX && pattern.gridPattern.endY === layerY)) {
				return;
			} else if (pattern.gridPattern.startX === layerX && pattern.gridPattern.startY === layerY) {
				return;
			}
		}
		this.state.hudPatternAdjust(layerX, layerY);
		this.state.hudUpdatePatternPos();
		// check for pattern, and show the original grid
		if (this.state.current.currentLayer.pattern && this.runtime.textures) {
			this.runtime.clipSpace.fromGrid(
				this.state.current.viewport,
				this.state.current.currentLayer,
				this.runtime.textures,
				show); // <- show pattern grid (if true), or original grid (if false)
			this.redrawScene();
		}
		this.refresher.refreshStateAndDOM(this.state);
	}
}
