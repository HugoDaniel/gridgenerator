export enum FatEventT {
	MouseFatEvent,
	TouchFatEvent
}
export class FatEvent {
	constructor(readonly x: number, readonly y: number, readonly type: FatEventT) {}
	public static toFatEvent(e: MouseEvent | TouchEvent): FatEvent {
		if ( (e as TouchEvent).touches ) {
			return new FatEvent(
				(e as TouchEvent).touches[0].clientX,
				(e as TouchEvent).touches[0].clientY,
				FatEventT.TouchFatEvent);
		}
		return new FatEvent(
			(e as MouseEvent).clientX,
			(e as MouseEvent).clientY,
			FatEventT.MouseFatEvent);
	}
}
