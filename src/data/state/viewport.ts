export interface ViewportReviver {
	l: number;
	u: number;
	x: number;
	y: number;
}
export class Viewport {
	public lastSize: number;
	public readonly maxSize: number;
	public readonly minSize: number;
	private _unitSize: number;
	private _x: number;
	private _y: number;
	constructor(unitSize: number = 64, x: number = 0, y: number = 0, maxSize: number = 256) {
		this._unitSize = unitSize;
		this._x = x;
		this._y = y;
		this.lastSize = unitSize;
		this.maxSize = maxSize;   // size when zoom is at 1.0
		this.minSize = 16;     // size when zoom is at 0.0
	}
	public toJSON(): ViewportReviver {
		return {
			l: this.lastSize,
			u: this.unitSize,
			x: this._x,
			y: this._y
		};
	}
	public static revive(o: ViewportReviver) {
		const result = new Viewport(o.u, o.x, o.y);
		result.lastSize = o.l;
		return result;
	}
	get x() {
		return this._x;
	}
	get y() {
		return this._y;
	}
	get unitSize() {
		return this._unitSize;
	}
	get zoomMiddle() {
		return (this.lastSize - this.minSize) / (this.maxSize - this.minSize);
	}
	/** current zoom percentage (0.0 = totally zoomed out, 1.0 = totally zoomed in) */
	get zoom() {
		return (this._unitSize - this.minSize) / (this.maxSize - this.minSize);
	}
	public setLastSize() {
		this.lastSize = this._unitSize;
	}
	public changeZoom(px: number, py: number, ammount: number, cx: number, cy: number, ovx: number, ovy: number) {
		const z = this._unitSize + ammount;
		const su = this.minSize + this.zoomMiddle * (this.maxSize - this.minSize);
		const npx = (px / su) * z;
		const npy = (py / su) * z;
		this._x = ovx + npx - px;
		this._y = ovy + npy - py;
		this._unitSize = Math.round(Math.min(Math.max(this.minSize, z), this.maxSize));
	}
	public move(deltaX: number, deltaY: number) {
		this._x -= deltaX;
		this._y -= deltaY;
		// console.log(`_x: ${this._x}, _y: ${this._y}`);
	}
	public squareLayerX(): number {
		const u = this.unitSize;
		const viewx = this._x;
		const initX = Math.floor(viewx / u);
		return initX;
	}
	public squareLayerY(): number {
		const u = this.unitSize;
		const viewy = this._y;
		let initY = Math.floor(viewy / u);
		// console.log('Y:', viewy, initY)
		if (viewy === 0) {
			// initY -= 1;
		} else
		if (viewy < 0) {
			initY += 1;
			/*
			if (viewy % u === 0) {
				initY -= 1;
			}
			*/
		} else if (viewy > 0) {
			if (viewy % u === 0) {
				initY = Math.floor(viewy / u);
			}
		}
		return initY;
	}
	public squareX(absX: number) {
		const u = this.unitSize;
		const viewx = this._x;
		let x = 0;
		if (viewx < 0) {
			if (absX > Math.abs(viewx % u)) {
				x = Math.ceil((absX - Math.abs(viewx % u)) / u);
			}
			if (viewx % u === 0) {
				x -= 1;
			}
		} else
		if (viewx >= 0) {
			if (absX > u - Math.abs(viewx % u)) {
				x = Math.ceil((absX + Math.abs(viewx % u)) / u) - 1;
			}
		}
		return x;
	}
	public squareY(absY: number) {
		const u = this.unitSize;
		const viewy = this._y;
		let y = 1;
		let off = 0;
		if (viewy < 0) {
			if (absY > Math.abs(viewy % u)) {
				off = -1;
				if (viewy % u === 0) {
					off = -2;
				}
				y = Math.ceil((absY + u - Math.abs(viewy % u)) / u) + off;
			} else {
				y = 0;
			}
		} else
		if (viewy >= 0) {
			if (absY > u - Math.abs(viewy % u)) {
				y = Math.ceil((absY + Math.abs(viewy % u)) / u);
			}
		}
		return y;
	}
}
