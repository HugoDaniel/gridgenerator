export class MovementZoom {
	public readonly initDist: number;
	public readonly initX1: number;
	public readonly initX2: number;
	public readonly initY1: number;
	public readonly initY2: number;
	constructor(touches: TouchList) {
		const t1 = touches.item(0);
		const t2 = touches.item(1);
		if (!t2 || !t1) {
			throw Error('Cannot start MovementZoom: not enough touch points');
		}
		this.initX1 = t1.clientX;
		this.initX2 = t2.clientX;
		this.initY1 = t1.clientY;
		this.initY2 = t2.clientY;
		const vx = t1.clientX - t2.clientX;
		const vy = t1.clientY - t2.clientY;
		this.initDist = Math.hypot(vx, vy);
		/*
		*/
	}
	public ratio(touches: TouchList): number {
		const t1 = touches.item(0);
		const t2 = touches.item(1);
		if (!t2 || !t1) {
			throw Error('Cannot find MovementZoom ratio: not enough touch points');
		}
		const x1 = t1.clientX;
		const x2 = t2.clientX;
		const y1 = t1.clientY;
		const y2 = t2.clientY;
		const vx = t1.clientX - t2.clientX;
		const vy = t1.clientY - t2.clientY;
		const curDist = Math.hypot(vx, vy);
		if (curDist > this.initDist) {
			const diff = curDist - this.initDist;
			return 1.0 + (diff / this.initDist);
		} else {
			const diff = this.initDist - curDist;
			return 1.0 - (diff / this.initDist);
		}
	}
}
