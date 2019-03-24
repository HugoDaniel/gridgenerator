export interface TilePatternReviver {
	sx: number;
	sy: number;
	ex: number;
	ey: number;
}
export class TilePattern {
	// Layer coords: (for window coords check out the ClipPattern class in ui/)
	public startX: number;
	public startY: number;
	public endX: number;
	public endY: number;
	constructor(sx: number, sy: number, ex: number, ey: number) {
		this.startX = sx;
		this.startY = sy;
		this.endX = ex;
		this.endY = ey;
	}
	get width() {
		return Math.abs(this.endX - this.startX);
	}
	get height() {
		return Math.abs(this.endY - this.startY);
	}
	public toJSON() {
		return {
			sx: this.startX,
			sy: this.startY,
			ey: this.endY,
			ex: this.endX
		};
	}
	public static revive(o: TilePatternReviver) {
		return new TilePattern(o.sx, o.sy, o.ex, o.ey);
	}
	public getX(layerX: number): number {
		const w = (this.endX - this.startX); // width
		// console.log(`s,e=${this.startX},${this.endX}; w,h=${w},${(this.endY - this.startY)}`);
		if (layerX < this.startX) {
			const dx = this.startX - layerX; // distance from startX
			return this.startX + ((w - (dx % w)) % w);
		} else if (layerX >= this.endX) {
			const dx = layerX - this.endX;
			return this.startX + (dx % w);
		} else {
			return layerX;
		}
	}
	public getY(layerY: number): number {
		const h = (this.endY - this.startY); // height
		if (layerY < this.startY) {
			const dy = this.startY - layerY; // distance from startY
			return this.startY + ((h - (dy % h)) % h);
		} else if (layerY >= this.endY) {
			return this.startY + ((layerY - this.endY) % h);
		} else {
			return layerY;
		}
	}
}
