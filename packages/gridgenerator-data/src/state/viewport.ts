export type ViewportReviver = [number, number, number, number];
export class Viewport {
  public lastSize: number;
  public readonly maxSize: number;
  public readonly minSize: number;
  private _unitSize: number;
  private _x: number; // in screen pixels
  private _y: number; // in screen pixels
  constructor(
    unitSize: number = 64.3,
    x: number = 0,
    y: number = 0,
    maxSize: number = 256
  ) {
    this._unitSize = unitSize;
    this._x = x;
    this._y = y;
    this.lastSize = unitSize;
    this.maxSize = maxSize; // size when zoom is at 1.0
    this.minSize = 16; // size when zoom is at 0.0
  }
  public toJSON(): ViewportReviver {
    return [this.lastSize, this.unitSize, this._x, this._y];
  }
  public static revive([l, u, x, y]: ViewportReviver) {
    const result = new Viewport(u, x, y);
    result.lastSize = l;
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
  public changeZoom(
    px: number,
    py: number,
    ammount: number,
    cx: number,
    cy: number,
    ovx: number,
    ovy: number
  ) {
    const z = this._unitSize + ammount;
    const su = this.minSize + this.zoomMiddle * (this.maxSize - this.minSize);
    const npx = (px / su) * z;
    const npy = (py / su) * z;
    this._x = ovx + npx - px;
    this._y = ovy + npy - py;
    this._unitSize = Math.round(
      Math.min(Math.max(this.minSize, z), this.maxSize)
    );
  }
  public move(deltaX: number, deltaY: number) {
    this._x -= deltaX;
    this._y -= deltaY;
    // console.log(`_x: ${this._x}, _y: ${this._y}`);
  }
  /** Returns the layer X coordinate for the first element on the screen (top left) */
  public squareLayerX(): number {
    const u = this.unitSize;
    const viewx = this._x;
    // const uvx = Math.abs(viewx / u);
    // const initX = Math.sign(viewx) * Math.floor(uvx);
    return Math.floor(viewx / u);
  }
  /** Returns the layer Y coordinate for the first element on the screen (top left) */
  public squareLayerY(): number {
    const u = this.unitSize;
    const viewy = this._y;
    return Math.floor(viewy / u);
    /*
		let initY = Math.floor(viewy / u);
		// console.log('Y:', viewy, initY)
		if (viewy === 0) {
			// initY -= 1;
		} else
		if (viewy < 0) {
			initY += 1;
		} else if (viewy > 0) {
			if (viewy % u === 0) {
				initY = Math.floor(viewy / u);
			}
		}
		return initY;
		*/
  }
  /** Returns the screen X grid coordinate of the square under the 'screenX' pixel position */
  public squareX(screenX: number) {
    const u = this.unitSize;
    const viewx = this._x;
    const uvx = Math.abs(viewx / u);
    const deltaX =
      Math.sign(viewx) >= 0
        ? (1 - (uvx - Math.floor(uvx))) * u
        : (uvx + Math.sign(viewx) * Math.floor(uvx)) * u;
    const screenSq = Math.ceil((screenX - deltaX) / u);
    let rounding = 0;
    if (deltaX === 0 && Math.sign(viewx) < 0) {
      rounding = -1;
    }
    return screenSq + rounding;
  }

  /** Returns the screen Y grid coordinate of the square under the 'screenY' pixel position */
  public squareY(screenY: number) {
    const u = this.unitSize;
    const viewy = this._y;
    const uvy = Math.abs(viewy / u);
    const deltaY =
      Math.sign(viewy) >= 0
        ? (1 - (uvy - Math.floor(uvy))) * u
        : (uvy + Math.sign(viewy) * Math.floor(uvy)) * u;
    const screenSq = Math.ceil((screenY - deltaY) / u);
    let rounding = 0;
    if (deltaY === 0 && Math.sign(viewy) < 0) {
      rounding = -1;
    }
    return screenSq + rounding;
  }
  /** returns the pixel X coordinate on the screen for the layer square X coordinate passed as arg */
  public screenX(squareX: number) {
    const u = this.unitSize;
    const viewx = this._x;
    const initX = this.squareLayerX();
    if (squareX < initX) {
      return -1; // not in screen
    }
    const uvx = Math.abs(viewx / u);
    const deltaX =
      Math.sign(viewx) >= 0
        ? (1 - (uvx - Math.floor(uvx))) * u
        : (uvx + Math.sign(viewx) * Math.floor(uvx)) * u;
    const squareXInScreen = squareX - initX;
    const result = Math.max(0, Math.round((squareXInScreen - 1) * u + deltaX));
    return result;
  }
  /** returns the pixel Y coordinate on the screen for the layer square Y coordinate passed as arg */
  public screenY(squareY: number) {
    const u = this.unitSize;
    const viewy = this._y;
    const initY = this.squareLayerY();
    if (squareY < initY) {
      return -1; // not in screen
    }
    const uvy = Math.abs(viewy / u);
    const deltaY =
      Math.sign(viewy) >= 0
        ? (1 - (uvy - Math.floor(uvy))) * u
        : (uvy + Math.sign(viewy) * Math.floor(uvy)) * u;
    const squareYInScreen = squareY - initY;
    const result = Math.max(0, Math.round((squareYInScreen - 1) * u + deltaY));
    return result;
  }
}
