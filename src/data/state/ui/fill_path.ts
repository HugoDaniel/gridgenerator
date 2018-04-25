export interface UIFillPathReviver {
	d: string;
	f: string;
}
export class UIFillPath {
	public readonly d: string;
	public fill: string;
	constructor(d: string, fill: string) {
		this.d = d;
		this.fill = fill;
	}
	public toJSON(): UIFillPathReviver {
		return {
			d: this.d,
			f: this.fill
		};
	}
	public static revive(o: UIFillPathReviver) {
		return new UIFillPath(o.d, o.f);
	}
}
