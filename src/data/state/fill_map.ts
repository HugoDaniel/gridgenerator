import { RGBColor } from './color/rgb';
import { ColorId, ColorMap, IColorMapReviver } from './color_map';
import { RandomArray } from './math/random';
import { Shape, ShapeFillSetId } from './shape/shape';
export type FillId = number;
export const enum FillType { Color = 1 }
export type Fill = ColorId; // TODO: add more to ColorId: ColorId | PicId | ...
export type FillEntry = RGBColor; // TODO: add more...

export interface FillMapReviver {
    colors: IColorMapReviver;
    fills: Array<[number, FillType]>;
    created: number | number[] | null;
}
export class FillMap {
	public colors: ColorMap;
	public fills: Map<FillId, FillType>;
	public created: FillId | FillId[] | null; // the most recently created fillId

	constructor() {
		this.colors = new ColorMap();
		this.fills = new Map();
		this.fromColorMap(this.colors);
		this.created = null;
	}
	public toJSON(): FillMapReviver {
		return {
			colors: this.colors.toJSON(),
			fills: [...this.fills.entries()],
			created: this.created
		};
	}
	public static revive(r: FillMapReviver) {
		const result = new FillMap();
		result.colors = ColorMap.revive(r.colors);
		result.fills = new Map(r.fills);
		result.created = r.created;
		return result;
	}
	// returns the updated string value of the fillId
	public updateFromEditor(fillId: FillId): string {
		// get the fillId type
		switch (this.fills.get(fillId)) {
			// update the editor with its value
			case FillType.Color:
				this.colors.updateFromEditor(fillId);
				return this.colors.getString(fillId);
			default:
				throw new Error(`updateFromEditor(${fillId}), Fill id not present or has an unknown type`);
		}
	}
	public updateEditorWith(fillId: FillId): FillMap {
		// get the fillId type
		switch (this.fills.get(fillId)) {
			// update the editor with its value
			case FillType.Color:
				this.colors.updateEditorWith(fillId);
				break;
			default:
				throw new Error(`updateEditorWith(${fillId}), Fill id not present or has an unknown type`);
		}
		return this;
	}
	// fromColoMap builds the fills Map based on the colors in the ColorMap
	private fromColorMap(colors: ColorMap) {
		for (const colorId of colors.keys()) {
			this.fills.set(colorId, FillType.Color);
		}
	}
	public selectFillId(fillId: FillId) {
		const fillType = this.fills.get(fillId);
		if (fillType === undefined) {
			throw Error(`Fill id ${fillId} not found when selecting`);
		}
		/* in the future:
		switch (fillEntry.type) {
			case FillType.Color:
		}
		return 'transparent';
		*/
		this.colors.editorSelectColorId(fillId);
	}
	// returns the string representation of the fillId
	public getFill(fillId: FillId): string {
		const obj = this.getFillObj(fillId);
		if (obj === undefined) {
			return ColorMap.NoColor;
		}
		return obj.toString();
	}
	public getFillObj(fillId: FillId): RGBColor | undefined {
		/* in the future:
		const fillType = this.fills.get(fillId);
		if (!fillType) ...
		switch (fillEntry.type) {
			case FillType.Color:
		}
		return 'transparent';
		*/
		return this.colors.get(fillId);
	}
	public buildSVG(resolution: number, pathFills: Map<string, FillId>, width?: number, height?: number): string {
		let dimensions = '';
		if (width && height) {
			dimensions = `width="${width}" height="${height}"`;
		}
		let paths = '';
		for (const [d, fillId] of pathFills) {
			paths += `<path d="${d}" fill="${this.getFill(fillId)}" />`;
		}
		return (
			`<svg ${dimensions} xmlns="http://www.w3.org/2000/svg" version="1.1" baseProfile="basic" viewBox="0 0 ${resolution} ${resolution}">
				${paths}
			</svg>`);
	}
	public buildShapeSVG(shape: Shape): Map<ShapeFillSetId, string> {
		const result = new Map();
		for (const [fillSetId, pathFills] of shape.entries()) {
			result.set(fillSetId, this.buildSVG(shape.resolution, pathFills));
		}
		return result;
	}
	private buildSVGSymbol(res: number, shapeId: number, shapeFillSetId: number, pathFills: Map<string, FillId>): string {
		let paths = '';
		for (const [d, fillId] of pathFills) {
			paths += `\t<path d="${d}" fill="${this.getFill(fillId)}" />\n`;
		}
		return (
			`
			<symbol id="${shapeId}-${shapeFillSetId}" viewbox="0 0 ${res} ${res}">
			${paths}
			</symbol>
			`
		);
	}
	public buildShapeSymbol(shape: Shape, shapeId: number): string[] {
		const result = [] as string[];
		for (const [fillSetId, pathFills] of shape.entries()) {
			result.push(this.buildSVGSymbol(shape.resolution, shapeId, fillSetId, pathFills));
		}
		return result;
	}
	public rndFillId(rnd: RandomArray): number {
		let fillId = rnd.pop();
		while (this.fills.has(fillId)) {
			fillId = rnd.pop();
		}
		return fillId;
	}
	public newFills(fillIds: FillId[], colors: RGBColor[]): FillMap {
		if (fillIds.length !== colors.length) {
			// tslint:disable-next-line:no-console
			console.warn('FillMap.newFills(): Different length in fillIds and colors');
		}
		// default fills are colors
		for (let f = 0; f < fillIds.length; f++) {
			const fillId = fillIds[f];
			this.fills.set(fillId, FillType.Color);
			this.colors.registerColor(colors[f], fillId);
		}
		this.created = fillIds;
		return this;
	}
	public deleteFill(fillId: FillId): FillMap {
		const fillType = this.fills.get(fillId);
		if (!fillType) {
			throw new Error(`No fill type present when discarding fillId ${fillId}`);
		}
		this.fills.delete(fillId);
		// todo switch here
		this.colors.colors.delete(fillId);
		return this;
	}
	public discardNewFills(): FillMap {
		if (this.created) {
			if (typeof this.created !== 'number') {
				for (let f = 0; f < this.created.length; f++) {
					this.deleteFill(this.created[f]);
				}
			} else {
				this.deleteFill(this.created);
			}
		}
		return this;
	}
}
