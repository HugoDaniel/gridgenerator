import { ColorDefaults } from './color/defaults';
import { RGBColor, RGBColorReviver } from './color/rgb';
import { IWheelReviver, Wheel, WheelMode } from './color/wheel';
import { RandomArray } from './math/random';
export type ColorId = number;
export interface IColorMapReviver {
    colors: Array<[number, RGBColorReviver]>;
    created: number | null;
    editor: IWheelReviver;
    editorSelectedColorId: number | null;
    editorColorIds: number[];
    editorOriginalColors: RGBColor[];
}
export class ColorMap {
	public colors: Map<ColorId, RGBColor>;
	public created: ColorId | null; // the most recently created colorId
	public editor: Wheel;
	public editorSelectedColorId: ColorId | null;
	public editorColorIds: ColorId[];
	public editorOriginalColors: RGBColor[];

	constructor() {
		this.colors = new Map(ColorMap.DefaultColors());
		this.editor = new Wheel();
		this.editorSelectedColorId = null;
		this.editorColorIds = [];
		this.editorOriginalColors = [];
		this.created = null;
	}
	public toJSON(): IColorMapReviver {
		return {
			created: this.created,
			editor: this.editor.toJSON(),
			editorSelectedColorId: this.editorSelectedColorId,
			editorColorIds: this.editorColorIds.slice(0),
			editorOriginalColors: this.editorOriginalColors.slice(0),
			colors: [...this.colors.entries()].map(([cid, c]) =>
				[cid, c.toJSON()] as [number, RGBColorReviver])
		};
	}
	public static revive(r: IColorMapReviver): ColorMap {
		const revived = new ColorMap();
		const colorsMap = r.colors.map(([id, c]) => [id, RGBColor.revive(c)] as [number, RGBColor]);
		revived.colors = new Map(colorsMap);
		revived.created = r.created;
		const wheel = new Wheel();
		revived.editor = wheel.revive(r.editor);
		revived.editorSelectedColorId = r.editorSelectedColorId;
		revived.editorColorIds = r.editorColorIds;
		revived.editorOriginalColors = r.editorOriginalColors.map(RGBColor.revive);
		return revived;
	}
	public static NoColor: string = 'transparent';
	public get(colorId: ColorId): RGBColor | undefined {
		return this.colors.get(colorId);
	}
	public getString(colorId: ColorId): string {
		const rgb = this.colors.get(colorId);
		if (rgb === undefined) {
			return ColorMap.NoColor;
		} else {
			return RGBColor.toHex(rgb);
		}
	}
	/** Duplicates the color in the colorId, into the new Id provided */
	public duplicateColor(colorId: ColorId, newId: ColorId) {
		const color = this.colors.get(colorId);
		if (!color) {
			throw new Error(`Cannot duplicate colorId ${colorId}, not found`);
		}
		this.colors.set(newId, new RGBColor(
			color.r, color.g, color.b, color.a));
	}
	public iter() {
		return this.colors.entries();
	}
	public keys() {
		return this.colors.keys();
	}
	public static DefaultColors(): Array<[ColorId, RGBColor]> {
		return [
			[ ColorDefaults.CURSOR, RGBColor.fromHex('#5e2ca5') ],
			[ ColorDefaults.GRID, RGBColor.fromHex('#bebece') ],
			[ ColorDefaults.YELLOW, new RGBColor(255, 215, 0) ],
			[ ColorDefaults.BLUE, new RGBColor(53, 126, 221) ],
			[ ColorDefaults.GREEN, RGBColor.fromHex('#19a974') ]
		];
	}
	public updateFromEditor(colorId: ColorId): ColorMap {
		this.colors.set(colorId, this.editor.toColor());
		return this;
	}
	public updateEditorWith(colorId: ColorId): ColorMap {
		const color = this.colors.get(colorId);
		if (!color) {
			throw new Error(`Color id ${colorId} not found in color map`);
		}
		this.editor.fromColor(color);
		return this;
	}
	public getRndColorId(rndGen: RandomArray): number {
		let colorId = rndGen.pop();
		while (this.colors.has(colorId)) {
			colorId = rndGen.pop();
		}
		return colorId;
	}
	public registerColor(color: RGBColor, colorId: number): ColorMap {
		this.colors.set(colorId, color);
		this.created = colorId;
		return this;
	}
	public colorEditorExit(): ColorMap {
		this.editorColorIds = [];
		this.editorOriginalColors = [];
		return this;
	}
	public deleteColors(colors: ColorId[]) {
		for (let i = 0; i < colors.length; i++) {
			this.colors.delete(colors[i]);
		}
		this.created = null;
		return this;
	}
	private _updateWheel(): ColorMap {
		if (!this.editorSelectedColorId) {
			return this;
		}
		this.colors.set(this.editorSelectedColorId,
			RGBColor.fromHex(this.editor.getSelectedColor())
		);
		return this;
	}
	public moveWheel(ammount: number): ColorMap {
		this.editor.moveWheel(ammount);
		return this._updateWheel();
	}
	public editorColorPick(hex: string): ColorMap {
		this.editor.fromHex(hex);
		return this._updateWheel();
	}
	public editorSelectColorId(colorId: number): ColorMap {
		this.editorSelectedColorId = colorId;
		const rgb = this.colors.get(colorId);
		if (!rgb) {
			throw new Error(`Cannot select color with id ${colorId}`);
		}
		this.editor.fromColor(rgb);
		return this;
	}
	public editorSelectColor(slice: number): ColorMap {
		this.editor.selectSlice(slice);
		return this._updateWheel();
	}
	public modeChange(mode: WheelMode): ColorMap {
		this.editor.changeMode(mode);
		return this;
	}
	/**
	 * The Most Recently Used colors (an array of hex strings)
	 * @param limit the ammount of colors desired
	 */
	public mruColors(limit: number): string[] {
		return [...this.colors.values()]
			.splice(-limit)
			.map(RGBColor.toHex)
			.reverse();
	}
}
