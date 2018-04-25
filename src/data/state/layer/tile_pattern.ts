export interface TilePatternReviver {
	sx: number;
	sy: number;
	ex: number;
	ey: number;
}
export class TilePattern {
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
}
