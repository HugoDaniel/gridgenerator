import { IColorCanvasMovementDetail } from './movement/color_canvas';
import { IProductMovementDetail } from './movement/product';
export type MovementDetail = IColorCanvasMovementDetail | IProductMovementDetail | null;

export class Movement {
	private _startX: number;
	private _startY: number;
	private _isMoving: boolean;
	private _detail: MovementDetail;
	constructor(startX: number = 0 , startY: number = 0, isMoving: boolean = true, detail: MovementDetail = null ) {
		this._startX = startX;
		this._startY = startY;
		this._isMoving = isMoving;
		this._detail = detail;
	}
	/*
	public movementObject(x: number, y: number, rect: DOMRect | ClientRect): IMovementObject {
		return(
			{ x: getEventX(e)
			, y: getEventY(e)
			, w: rect.width
			, h: rect.height
			, t: rect.top
			, l: rect.left
			, r: rect.right
			, b: rect.bottom
			});
	}
	*/
	get startX(): number {
		return this._startX;
	}
	get startY(): number {
		return this._startY;
	}
	get isMoving(): boolean {
		return this._isMoving;
	}
	get detail(): MovementDetail {
		return this._detail;
	}
	public setDetail(d: MovementDetail): void {
		this._detail = d;
	}

	public start(startX: number, startY: number): void {
		this._startX = startX;
		this._startY = startY;
		this._isMoving = true;
		this._detail = null;
	}
	public end() {
		this._isMoving = false;
		this._detail = null;
	}
}
