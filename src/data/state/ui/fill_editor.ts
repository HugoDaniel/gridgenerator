import { WheelMode } from '../color/wheel';
import { FillId, FillMap } from '../fill_map';
import { Shape } from '../shape/shape';
import { DefaultColorMenu, UIFillEditorColorMode } from './defaults';
import { UIFillPath, UIFillPathReviver } from './fill_path';
import { Menu, MenuReviver } from './menu';
export interface UIFillEditorReviver {
	m: number;
	pt: string;
	st: string;
	menu: MenuReviver;
	tp: string;
	tres: number;
	p: Array<[FillId, UIFillPathReviver]>;
	s: FillId;
	mru: string[];
}
export enum UIFillEditorMode { Color = 1 }
export class UIFillEditor {
	public editorMode: UIFillEditorMode;
	public primaryActionTitle: string;
	public secundaryActionTitle: string;
	public colorMenu: Menu<UIFillEditorColorMode>;
	public templatePath: string;
	public templateRes: number;
	public paths: Map<FillId, UIFillPath>;
	public selected: FillId;
	public mruColors: string[];
	// TODO: defs and patterns
	// TODO: originalFillValues (when changing a fill)
	constructor(shape?: Shape, fills?: FillMap) {
		// allow an empty, uninitialized FillEditor:
		if (!shape || !fills) {
			return;
		}
		this.paths = new Map();
		for (const [d, fillId] of shape.getSelectedFills()) {
			this.paths.set(fillId, new UIFillPath(d, fills.getFill(fillId)));
		}
		this.selected = this.paths.keys().next().value;
		// TODO: switch on the selected fill type and set the editorMode
		this.editorMode = UIFillEditorMode.Color;
		this.primaryActionTitle = 'Create Color';
		this.colorMenu = new Menu(DefaultColorMenu);
		this.colorMenu.selected = UIFillEditorColorMode.Hering;
		this.templatePath = shape.editor.template.baseString;
		this.templateRes = shape.resolution;
		this.mruColors = fills.colors.mruColors(8).slice(1);
	}
	/**
	 * Returns an array with [hex strings, path strings, selected fill id]
	 */
	get fillPaths(): [string[], string[], number] {
		const result = new Array(3) as [string[], string[], number];
		const fills: string[] = [];
		const paths: string[] = [];
		for (const [fid, fp] of this.paths.entries()) {
			if (fid === this.selected) {
				result[2] = paths.length;
			}
			fills.push(fp.fill);
			paths.push(fp.d);
		}
		result[0] = fills;
		result[1] = paths;
		return result;
	}
	/**
	 * Returns the fillId for a given position in the insertion order (0 -> the first color fillId)
	 * @param pos the position (in insertion order) to get the fid
	 */
	public fidByPos(pos: number): number | null {
		let i = 0;
		for (const fid of this.paths.keys()) {
			if (pos === i) {
				return fid;
			}
			i++;
		}
		return null;
	}
	public toJSON(): UIFillEditorReviver {
		return {
			m: this.editorMode,
			pt: this.primaryActionTitle,
			st: this.secundaryActionTitle,
			menu: this.colorMenu.toJSON(),
			tp: this.templatePath,
			tres: this.templateRes,
			s: this.selected,
			mru: this.mruColors.slice(0),
			p: [...this.paths.entries()].map(
				(e) => [e[0], e[1].toJSON()] as [number, UIFillPathReviver])
		};
	}
	public static revive(o: UIFillEditorReviver) {
		const result = new UIFillEditor();
		result.editorMode = o.m;
		result.primaryActionTitle = o.pt;
		result.secundaryActionTitle = o.st;
		result.colorMenu = Menu.revive(o.menu);
		result.templatePath = o.tp;
		result.templateRes = o.tres;
		result.selected = o.s;
		result.mruColors = o.mru;
		result.paths = new Map(o.p.map((e) =>
			[e[0], UIFillPath.revive(e[1])] as [FillId, UIFillPath]));
		return result;
	}
	public buildPaths(paths: string[], fillIds: number[], fills: string[]) {
		this.paths = new Map();
		for (let i = 0; i < paths.length; i++) {
			this.paths.set(fillIds[i],
				new UIFillPath(paths[i], fills[i]));
		}
	}
	public selectedFillString(): string {
		const uifill = this.paths.get(this.selected);
		if (!uifill) {
			throw new Error(`selectedFillString(): selected fill id ${this.selected} not found`);
		}
		return uifill.fill;
	}
	public updateSelected(fillValue: string): UIFillEditor {
		const uifill = this.paths.get(this.selected);
		if (!uifill) {
			throw new Error(`updateSelected(${fillValue}): selected fill id ${this.selected} not found`);
		}
		uifill.fill = fillValue;
		return this;
	}
	public colorMenuMode(mode: UIFillEditorColorMode): UIFillEditor {
		this.colorMenu.selected = mode;
		return this;
	}
	public static toColorEditorMode(mode: UIFillEditorColorMode): WheelMode {
		switch (mode) {
			case UIFillEditorColorMode.Hering:
			return WheelMode.WHEEL_HERING_MODE;
			case UIFillEditorColorMode.Lightness:
			return WheelMode.WHEEL_BRIGHTNESS_MODE;
			case UIFillEditorColorMode.Saturation:
			return WheelMode.WHEEL_SATURATION_MODE;
		}
		throw new Error(`Unknown Editor Color Mode ${mode}`);
	}
}
