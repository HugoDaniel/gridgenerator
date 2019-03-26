export interface ModificationReviver {
	v: number;
	d: number;
	n: string;
	a: any[] | null;
}
export type Args = (any[] | null);
export class Modification {
	public readonly version: number;
	public readonly deltaT: number;
	public readonly actionName: string;
	public readonly args: ReadonlyArray<any> | null;
	constructor(version: number, deltaT: number, actionName: string, args: ReadonlyArray<any> | null) {
		this.version = version;
		this.deltaT = deltaT;
		this.actionName = actionName;
		this.args = args;
	}
	public toJSON(): ModificationReviver {
		return {
			v: this.version,
			d: this.deltaT,
			n: this.actionName,
			a: this.args ? this.args.slice(0) : null
		};
	}
	public static revive(o: ModificationReviver, argsReviver: (n: string, a: Args) => Args) {
		return new Modification(o.v, o.d, o.n, argsReviver(o.n, o.a));
	}
}
