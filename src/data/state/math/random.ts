export class RandomArray {
	public readonly size: number;
	private values: Uint32Array;
	private at: number;
	constructor(len: number = 4096, values?: Uint32Array, at?: number) {
		this.size = len;
		this.values = values || crypto.getRandomValues(new Uint32Array(len));
		this.at = at || 0;
	}
	public pop(): number {
		if (this.at < this.size - 1) {
			this.at += 1;
			return this.values[this.at];
		}
		// update
		this.values = window.crypto.getRandomValues(this.values);
		this.at = 1;
		return this.values[0];
	}
	// legacy:
	public first(): number {
		return this.values[this.at];
	}
	public static update(rnd: RandomArray) {
		if (rnd.at < rnd.size - 1) {
			rnd.at = rnd.at + 1;
			return rnd;
		} else {
			rnd.values = window.crypto.getRandomValues(rnd.values);
			rnd.at = 0;
			return rnd;
		}
	}
}
