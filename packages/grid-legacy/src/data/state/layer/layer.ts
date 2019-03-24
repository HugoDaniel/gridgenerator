
export interface LayerReviver {
	id: number;
	name: string;
	t: number;
	d: any;
}
export enum LayerType { Grid = 1 }
export type LayerId = number;
export class Layer<T> {
	private _id: LayerId;
	public name: string;
	private _type: LayerType;
	private _data: T;
	constructor(id: LayerId, name: string, data: T, type: LayerType = LayerType.Grid) {
		this._id = id;
		this.name = name;
		this._data = data;
		this._type = type;
	}
	public toJSON(dataToJSON: (d: any) => any) {
		return {
			id: this.id,
			name: this.name,
			t: this.type,
			d: dataToJSON(this.data)
		};
	}
	public static revive(o: LayerReviver, dataReviver: (d: any) => any) {
		return new Layer(o.id, o.name, dataReviver(o.d), o.t);
	}
	get id(): LayerId {
		return this._id;
	}
	get type(): LayerType {
		return this._type;
	}
	get data(): T {
		return this._data;
	}
	public static getData(l: Layer<any>): any {
		return l.data;
	}
}
