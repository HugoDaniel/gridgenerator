import { RGBColor } from './color/rgb';
import { FillId } from './fill_map';
import { Grid, GridType } from './layer/grid';
import { GridElement } from './layer/grid_element';
import { Layer, LayerReviver, LayerType } from './layer/layer';
import { VectorMap } from './math/set';
import { Vector2D } from './math/vector';
import { ShapeFillSetId } from './shape/shape';
import { ShapeId } from './shape_map';

export interface LayerMapReviver {
	l: Array<[number, LayerReviver]>;
	lst: number[];
	s: number;
}
export type LayerId = number;
export class LayerMap {
	private _layers: Map<LayerId, Layer<Grid>>;
	private list: LayerId[];
	private selected: LayerId;
	constructor(type: GridType, shapes: number[], selectedShape: number, selectedShapeFill: number) {
		const rootId = 0;
		const rootGrid = new Grid(type, shapes, selectedShape, selectedShapeFill,
			new VectorMap(
				/* DEFAULT GRID HERE:
				[ new Vector2D(1, 1), new Vector2D(0, -1), new Vector2D(3, 3)],
				// [ new Vector2D(3, 1), new Vector2D(2, 4)],
				// [ new GridElement(1, 1, 0), new GridElement(1, 2, 0)]
				[ new GridElement(1, 1, 0), new GridElement(1, 2, 0), new GridElement(1, 3, 0)]
				*/
			)
		);
		this._layers = new Map([[rootId, new Layer(0, 'Base', rootGrid)]]);
		this.selected = rootId; // Base layer is always 0, cannot be deleted, only changed
		this.list = [rootId];
	}
	public toJSON(): LayerMapReviver {
		return {
			l: [...this._layers.entries()].map((e) =>
				[e[0], e[1].toJSON((g) => g.toJSON())] as [number, LayerReviver]),
			lst: this.list.slice(0),
			s: this.selected
		};
	}
	public static revive(o: LayerMapReviver) {
		const result = new LayerMap(1, [], 0, 0);
		// ^ create a LayerMap with ficticious args
		// now fill it with the values from the reviver:
		result._layers = new Map(o.l.map((e) =>
			[e[0], Layer.revive(e[1], Grid.revive)] as [LayerId, Layer<Grid>]));
		result.list = o.lst;
		result.selected = o.s;
		return result;
	}
	public getSelected(): Grid {
		const l = this._layers.get(this.selected);
		if (!l) {
			throw new Error(`layer_map: Cannot get the selected layer ${this.selected}: Not found`);
		}
		return l.data;
	}
	/**
	 * selects a shape in the current selected layer
	 */
	public selectShape(sid: ShapeId, sfid: ShapeFillSetId): LayerMap {
		this.getSelected().selectShape(sid, sfid);
		return this;
	}
	/** Gets the layers map */
	get layers() {
		return this._layers;
	}
}
