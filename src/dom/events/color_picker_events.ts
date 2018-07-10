import { FatState, UIFillEditorColorMode, UIFillEditorMode, WheelMode } from '../../data';
import { CanvasContext, ColorCanvasPainter, Runtime, toColorPickerCanvasCtx } from '../../engine';
import { Movement } from '../../engine/runtime/movement';
import { IColorCanvasMovementDetail } from '../../engine/runtime/movement/color_canvas';
import { getEventX, getEventY, IEventHandler } from '../common';
import { Refresher } from './refresher';

export class ColorPickerEvents implements IEventHandler {
	public runtime: Runtime;
	public state: FatState;
	public refresher: Refresher;
	public onColorCanvasInit: (ctx: CanvasContext) => void;
	public onColorCanvasUnmount: (ctx: CanvasRenderingContext2D) => void;
	public onStartMovement: (x: number, y: number) => void;
	public onStopMovement: () => void;
	public onMovement: (_x: number, _y: number) => void;
	public onModeChange: (m: UIFillEditorColorMode) => void;
	public onCode: () => void;
	public onSaveCode: (hex: string) => void;
	public onColorPick: (hex: string) => void;
	public onChangeFillId: (fillId: number) => void;
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
		this.onColorCanvasInit = (ctx) => {
			const cpctx = toColorPickerCanvasCtx(ctx);
			this.runtime.rects.colorPickerRect();
			Runtime.setColorPickerCtx(this.runtime, cpctx);
			this.refresher.refreshRuntimeOnly(this.runtime);
			ColorCanvasPainter.INIT(cpctx, this.state.current);
		};
		this.onColorCanvasUnmount = () => {
			Runtime.unsetColorPickerCtx(this.runtime);
			this.refresher.refreshRuntimeOnly(this.runtime);
		};
		this.onMouseDown = (e) => {
			if (this.state.current.ui.fillEditor.editorMode === UIFillEditorMode.Color) {
				this.onStartMovement(getEventX(e), getEventY(e));
			}
		};
		this.onMouseUp = (e) => {
			if (this.state.current.ui.fillEditor.editorMode === UIFillEditorMode.Color) {
				this.onStopMovement();
			}
		};
		this.onMouseMove = (e) => {
			if (this.state.current.ui.fillEditor.editorMode === UIFillEditorMode.Color) {
				this.onMovement(getEventX(e), getEventY(e));
			}
		};
		this.onTouchStart = (e) => {
			if (this.state.current.ui.fillEditor.editorMode === UIFillEditorMode.Color) {
				this.onStartMovement(getEventX(e), getEventY(e));
			}
		};
		this.onTouchMove = (e) => {
			if (this.state.current.ui.fillEditor.editorMode === UIFillEditorMode.Color) {
				this.onMovement(getEventX(e), getEventY(e));
			}
		};
		this.onTouchEnd = (e) => {
			if (this.state.current.ui.fillEditor.editorMode === UIFillEditorMode.Color) {
				this.onStopMovement();
			}
		};
		this.onTouchCancel = (e) => {
			if (this.state.current.ui.fillEditor.editorMode === UIFillEditorMode.Color) {
				this.onStopMovement();
			}
		};
		this.onStartMovement = (x: number, y: number) => {
			// const obj = movementObject(e);
			if (!this.runtime.rects.colorPicker) {
				throw new Error('Cannot start color picker movement event: No client rect for the color picker in runtime');
			}
			if (!this.runtime.movement) {
				this.runtime.movement = new Movement(x, y, true);
			} else {
				this.runtime.movement.start(x, y);
			}
			const detail = ColorCanvasPainter.startMovement(
				this.state.current,
				this.runtime.movement,
				this.runtime.rects.colorPicker);
			if (detail !== null) {
				if (typeof detail === 'number') {
					// don't start the movement, just select a color
					this.runtime.movement = null;
					this.state.colorPickerSelectColor(detail);
					if (!this.runtime.colorPickerCtx) {
						throw new Error('Cannot select color, runtime context is not present');
					}
					ColorCanvasPainter.INIT(this.runtime.colorPickerCtx, this.state.current);
				} else {
					this.runtime.movement.setDetail(detail);
				}
			} else {
				// end movement
				if (!this.runtime.movement) {
					this.runtime.movement = new Movement(x, y, false);
				} else {
					this.runtime.movement.end();
				}
			}
			// this.refresher.refreshStateOnly(this.state);
			// this.refresher.refreshStateAndDOM(this.state);
			this.refresher.refreshAll(this.runtime, this.state);
		};
		this.onStopMovement = () => {
			if (!this.runtime.movement || !this.runtime.movement.isMoving) {
				this.refresher.refreshDOMOnly();
				return;
			}
			this.runtime.movement.end();
			// this.state.colorPickerEndMov();
			this.refresher.refreshAll(this.runtime, this.state);
			if (!this.runtime.colorPickerCtx) {
				throw new Error('Cannot stop color movement, runtime context is not present');
			}
			ColorCanvasPainter.INIT(this.runtime.colorPickerCtx, this.state.current);
		};
		this.onMovement = (_x: number, _y: number) => {
			if (!this.runtime.movement || !this.runtime.movement.isMoving) {
				return;
			}
			const detail = this.runtime.movement.detail;
			if (detail === null) {
				throw new Error('Unable to access the movement detail in color picker');
			}
			if (typeof detail !== 'number') {
				// calc the angle
				const rect = this.runtime.rects.colorPicker;
				if (!rect) {
					throw new Error('Cannot move color picker: no rectangle is defined in runtime');
				}
				const size = rect.width;
				const cx = size / 2;
				const cy = cx;
				const x = _x - rect.left;
				const y = _y - rect.top;
				const angle = Math.atan2(cy - y, cx - x) + Math.PI;
				if ((detail as IColorCanvasMovementDetail).in === WheelMode.WHEEL_HERING_MODE) {
					const detailAngle = (detail as IColorCanvasMovementDetail).angle;
					if (!detailAngle) {
						return new Error('No "angle" in movement detail in color picker');
					}
					this.state.colorPickerMoveWheel(angle - detailAngle);
					// this.refresher.refreshStateOnly(this.state);
					this.refresher.refreshStateAndDOM(this.state);
					if (!this.runtime.colorPickerCtx) {
						throw new Error('Canvas Ctx not present when moving color wheel');
					}
					ColorCanvasPainter.wheelMoving(this.runtime.colorPickerCtx, this.state.current);
				} else if ((detail as IColorCanvasMovementDetail).in === WheelMode.WHEEL_BRIGHTNESS_MODE
					|| (detail as IColorCanvasMovementDetail).in === WheelMode.WHEEL_SATURATION_MODE) {
					if (!this.runtime.colorPickerCtx) {
						throw new Error('Canvas Ctx not present when moving color wheel');
					}
					// get cur slice angle (thats the angle of the cur brightness)
					const detailStart = (detail as IColorCanvasMovementDetail).startAngle;
					if (!detailStart) {
						return new Error('No "startAngle" in movement detail in color picker');
					}
					const angleDiff = angle - detailStart;
					const angleRatio = (1.0 - (angleDiff / (2 * Math.PI))) % 1.0;
					// ^ starts at 0.0 on the selected slice
					// moves to 1.0 CCW, if moving CW it goes 1.0->0.0
					const detailInit = (detail as IColorCanvasMovementDetail).initValue;
					if (!detailInit) {
						return new Error('No "initValue" in movement detail in color picker');
					}
					const adjusted = (angleRatio + detailInit) % 1;
					this.state.colorPickerMoveWheel(adjusted);
					// this.refresher.refreshStateOnly(this.state);
					this.refresher.refreshStateAndDOM(this.state);
					ColorCanvasPainter.wheelMoving(this.runtime.colorPickerCtx, this.state.current);
				}
			}
		};
		this.onModeChange = (m) => {
			this.state.colorPickerModeChange(m);
			this.refresher.refreshStateAndDOM(this.state);
			if (!this.runtime.colorPickerCtx) {
				throw new Error('Cannot select color, runtime context is not present');
			}
			ColorCanvasPainter.INIT(this.runtime.colorPickerCtx, this.state.current);
		};
		this.onCode = () => {
			if (this.state.current.ui.fillEditor.editorMode === UIFillEditorMode.Code) {
				this.state.colorPickerExitCode();
			} else {
				this.state.colorPickerEnterCode();
			}
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onSaveCode = (hex: string) => {
			console.log('SAVING COLOR CODE', hex);
			this.state.colorPickerSaveCode(hex);
			this.refresher.refreshStateAndDOM(this.state);
			if (!this.runtime.colorPickerCtx) {
				throw new Error('Cannot select color, runtime context is not present');
			}
			ColorCanvasPainter.INIT(this.runtime.colorPickerCtx, this.state.current);
		};
		this.onColorPick = (hexStr) => {
			// const oldMode = this.state.current.fills.colors.editor.mode;
			this.state.colorPickerSystem(hexStr);
			this.refresher.refreshStateAndDOM(this.state);
			/*
			if (oldMode !== this.state.current.fills.colors.editor.mode) {
				this.refresher.refreshStateAndDOM(this.state);
			} else {
				this.refresher.refreshStateOnly(this.state);
			}
			*/
			if (!this.runtime.colorPickerCtx) {
				throw new Error('Cannot select color, runtime context is not present');
			}
			ColorCanvasPainter.INIT(this.runtime.colorPickerCtx, this.state.current);
		};
		this.onChangeFillId = (fillId: number) => {
			this.state.colorPickerSelectFillId(fillId);
			this.refresher.refreshStateAndDOM(this.state);
			if (!this.runtime.colorPickerCtx) {
				throw new Error('Cannot change shape, runtime context is not present');
			}
			ColorCanvasPainter.INIT(this.runtime.colorPickerCtx, this.state.current);
		};
 	}
}
