import { FillMap } from './fill_map';
import { Grid, IGridDimension } from './layer/grid';
import { LayerId } from './layer/layer';
import { TilePattern, TilePatternReviver } from './layer/tile_pattern';
import { Path } from './shape/path';
import { Shape, ShapeFillSetId } from './shape/shape';
import { ShapeId, ShapeMap } from './shape_map';
import { ClipPattern } from './ui/clip_pattern';
import { DefaultFeaturesMenu, DefaultMainMenu, DefaultToolsMenu, FeaturesMenuId, MainMenuId, ToolsMenuId } from './ui/defaults';
import { UIExportEditor } from './ui/export';
import { UIFillEditor, UIFillEditorReviver } from './ui/fill_editor';
import { Menu, MenuEntry, MenuReviver } from './ui/menu';
import { PublishAt, UIPublishEditor } from './ui/publish';
import { UIShapeEditor, UIShapeEditorMode, UIShapeEditorReviver } from './ui/shape_editor';
import { ToolsSubmenus, ToolsSubmenusReviver } from './ui/tools_submenus';
export interface UIReviver {
	a: string;
	t: string;
	sm: MenuReviver;
	fm: MenuReviver;
	tm: MenuReviver;
	et: boolean;
	ent: boolean;
	ext: boolean;
	z: boolean;
	f: UIFillEditorReviver;
	s: UIShapeEditorReviver;
	tsm: ToolsSubmenusReviver;
	p: Array<[number, TilePatternReviver]>;
}
export const enum UIState { Project = 'Project', ShapeEditor = 'ShapeEditor', FillEditor = 'FillEditor', Export = 'Export', Publish = 'Publish', PublishPreview = 'PublishPreview', PatternAdjustStart = 'PatternAdjustStart', PatternAdjustEnd = 'PatternAdjustEnd' }

export class UI {
	public at: UIState; // the current UI state
	public title: string;
	public mainMenu: Menu<MainMenuId>;
	public featuresMenu: Menu<FeaturesMenuId>;
	public shapesMenu: Menu<ShapeId>;
	public fillsMenu: Menu<ShapeFillSetId>;
	public toolsMenu: Menu<ToolsMenuId>;
	public toolsSubmenus: ToolsSubmenus;
	public isEditorOnTop: boolean;
	public isEnteringEditor: boolean;
	public isExitingEditor: boolean;
	public isZooming: boolean;
	public fillEditor: UIFillEditor;
	public shapeEditor: UIShapeEditor;
	public exportEditor: UIExportEditor;
	public publishEditor: UIPublishEditor;
	public patterns: Map<LayerId, ClipPattern>;
	constructor(grid?: Grid, shapesMap?: ShapeMap, fills?: FillMap) {
		// allow for an empty uninitialized UI (useful to revive)
		if (!grid || !shapesMap || !fills) {
			return;
		}
		// constructor starts here:
		this.title = 'Grid Generator';
		this.at = UIState.Project;
		this.mainMenu = new Menu(DefaultMainMenu);
		this.featuresMenu = new Menu(DefaultFeaturesMenu);
		this.toolsMenu = new Menu(DefaultToolsMenu);
		this.toolsMenu.selected = ToolsMenuId.Paint;
		// update the shape menu and fills menu:
		const shape = shapesMap.getShapeById(grid.selectedShape);
		if (!shape) {
			throw new Error('Trying to create a UI() class without a selected shape');
		}
		this.refreshMenus(grid, shapesMap, fills.buildShapeSVG(shape));
		// default editor state is hidden
		this.isEditorOnTop = false;
		this.isEnteringEditor = false;
		this.isExitingEditor = false;
		this.isZooming = false;
		this.fillEditor = new UIFillEditor(shape, fills);
		this.shapeEditor = new UIShapeEditor();
		this.exportEditor = new UIExportEditor(null, '', 0);
		this.publishEditor = new UIPublishEditor();
		this.toolsSubmenus = new ToolsSubmenus();
		this.patterns = new Map();
	}
	public toJSON(): UIReviver {
		return {
			a: this.at,
			t: this.title,
			sm: this.shapesMenu.toJSON(),
			fm: this.fillsMenu.toJSON(),
			tm: this.toolsMenu.toJSON(),
			et: this.isEditorOnTop,
			ent: this.isEnteringEditor,
			ext: this.isExitingEditor,
			z: this.isZooming,
			f: this.fillEditor.toJSON(),
			s: this.shapeEditor.toJSON(),
			tsm: this.toolsSubmenus.toJSON(),
			p: [...this.patterns].map(([lid, cpat]) =>
				[lid, cpat.gridPattern.toJSON()] as [number, TilePatternReviver])
		};
	}
	public static revive(o: UIReviver) {
		function uistateFromStr(s: string) {
			switch (s) {
				case 'ShapeEditor':
				return UIState.ShapeEditor;
				case 'FillEditor':
				return UIState.FillEditor;
				case 'Export':
				return UIState.Export;
				case 'Publish':
				return UIState.Publish;
				case 'PublishPreview':
				return UIState.PublishPreview;
				default:
				return UIState.Project;
			}
		}
		const result = new UI();
		result.mainMenu = new Menu(DefaultMainMenu);
		result.featuresMenu = new Menu(DefaultFeaturesMenu);
		result.at = uistateFromStr(o.a);
		result.title = o.t;
		result.shapesMenu = Menu.revive(o.sm);
		result.fillsMenu = Menu.revive(o.fm);
		result.toolsMenu = Menu.revive(o.tm);
		result.isEditorOnTop = o.et;
		result.isEnteringEditor = o.ent;
		result.isExitingEditor = o.ext;
		result.isZooming = o.z;
		result.fillEditor = UIFillEditor.revive(o.f);
		result.shapeEditor = UIShapeEditor.revive(o.s);
		if (o.tsm) {
			result.toolsSubmenus = ToolsSubmenus.revive(o.tsm);
		} else {
			result.toolsSubmenus = new ToolsSubmenus();
		}
		result.patterns = new Map(
			o.p.map(([lid, pat]) =>
				[lid, new ClipPattern(TilePattern.revive(pat))]as [LayerId, ClipPattern])
		);
		return result;
	}
	get currentTool(): ToolsMenuId {
		return this.toolsMenu.selected;
	}
	public selectTool(id: ToolsMenuId): UI {
		if (id === ToolsMenuId.Zoom) {
			this.isZooming = false;
		}
		this.toolsMenu.selected = id;
		return this;
	}
	public refreshMenus(_grid: Grid, _shapesMap: ShapeMap, svgs: Map<ShapeFillSetId, string>) {
		const shapeIds = [..._grid.shapes.keys()];
		const pathDs: string[][] = _shapesMap.svgShapeStrings(shapeIds);
		this.refreshShapesMenu(_grid, shapeIds, pathDs);
		const selectedShape = _shapesMap.getShapeById(_grid.selectedShape);
		if (selectedShape) {
			this.refreshFillsMenu(selectedShape, _grid.selectedRot, svgs);
		} else {
			throw new Error('Cannot find the layer selected shape in the shape map');
		}
	}
	private refreshShapesMenu(_grid: Grid, shapes: number[], shapeStrings: string[][]): UI {
		if (!this.shapesMenu) {
			this.shapesMenu = new Menu(new Map());
		} else {
			this.shapesMenu.entries.clear();
		}
		for (let i = 0; i < shapes.length; i++) {
			this.shapesMenu.entries.set(shapes[i],
				new MenuEntry(
					`shape-${shapes[i]}`,
					null,
					shapeStrings[i],
					undefined,
					_grid.getShapeRotation(shapes[i])
				)
			);
		}
		this.shapesMenu.selected = _grid.selectedShape;
		return this;
	}
	private refreshFillsMenu(shape: Shape, rot: number, svgs: Map<ShapeFillSetId, string>) {
		if (!this.fillsMenu) {
			this.fillsMenu = new Menu(new Map());
		} else {
			this.fillsMenu.entries.clear();
		}
		const empty = [];
		for (const [fillSetId, svg] of svgs.entries()) {
			this.fillsMenu.entries.set(fillSetId,
				new MenuEntry(`fill-${fillSetId}`, null, empty, svg, rot));
		}
		this.fillsMenu.selected = shape.selectedFillSet;
	}
	public updateSelectedFill(svg: string, fillString: string): UI {
		const menuEntry = this.fillsMenu.entries.get(this.fillsMenu.selected);
		if (menuEntry) {
			menuEntry.svg = svg;
			this.fillEditor.updateSelected(fillString);
		}
		return this;
	}
	private stateFromFeature(feature: FeaturesMenuId | string) {
		switch (feature) {
			case FeaturesMenuId.Export: return UIState.Export;
			case FeaturesMenuId.Publish: return UIState.Publish;
			default:
			return UIState.Project;
		}
	}
	private initExport(dim: IGridDimension, shapeOutline: string, shapeRes: number) {
		this.exportEditor = new UIExportEditor(dim, shapeOutline, shapeRes);
		return this;
	}
	private initPublish() {
		this.publishEditor = new UIPublishEditor();
		return this;
	}
	public enterLicense(title: string | null, desc: string | null) {
		this.publishEditor.at = PublishAt.License;
		this.publishEditor.title = title;
		this.publishEditor.desc = desc;
		return this;
	}
	public setLicense(license: string) {
		this.publishEditor.license = license;
		return this;
	}
	public exitLicense() {
		this.publishEditor.at = PublishAt.Metadata;
		return this;
	}
	private initFeature(feature: FeaturesMenuId | string, dim: IGridDimension, shapeOutline: string, shapeRes: number) {
		switch (feature) {
			case FeaturesMenuId.Export: return this.initExport(dim, shapeOutline, shapeRes);
			case FeaturesMenuId.Publish: return this.initPublish();
			default: return this;
		}
	}
	public enterFeature(feature: FeaturesMenuId | string, grid: Grid, shapeOutline: string, shapeRes: number): UI {
		this.at = this.stateFromFeature(feature);
		const dim = grid.dimensions();
		this.initFeature(feature, dim, shapeOutline, shapeRes);
		return this;
	}
	public newShape(p: Path): UI {
		this.at = UIState.ShapeEditor;
		this.shapeEditor.fromPath(p, []);
		return this;
	}
	public closeNewShape(): UI {
		this.at = UIState.Project;
		return this;
	}
	public enterTemplateSelector(): UI {
		this.shapeEditor.editorMode = UIShapeEditorMode.TemplateSelector;
		return this;
	}
	public exitTemplateSelector(): UI {
		this.shapeEditor.editorMode = UIShapeEditorMode.Shape;
		return this;
	}
	public newFill(shape: Shape, svgs: Map<ShapeFillSetId, string>, fills: FillMap): UI {
		this.at = UIState.FillEditor;
		this.refreshFillsMenu(shape, 0, svgs);
		this.fillEditor = new UIFillEditor(shape, fills);
		return this;
	}
	// closeNewFill discards the new fill and returns the state to the project
	public closeNewFill(shape: Shape, rot: number, svgs: Map<ShapeFillSetId, string>): UI {
		this.at = UIState.Project;
		this.refreshFillsMenu(shape, rot, svgs);
		return this;
	}
	public closeFeatures(): UI {
		this.at = UIState.Project;
		return this;
	}
	public enteringEditor(): UI {
		this.isEnteringEditor = true;
		this.isExitingEditor = false;
		return this;
	}
	public exitingEditor(): UI {
		this.isExitingEditor = true;
		this.isEnteringEditor = false;
		return this;
	}
	public editorStopAnim(): UI {
		this.isExitingEditor = false;
		this.isEnteringEditor = false;
		return this;
	}
	public editorOnTop(): UI {
		this.isEditorOnTop = true;
		return this;
	}
	public editorOnBottom(): UI {
		this.isEditorOnTop = false;
		return this;
	}

	public fillEditorFromShapeEditor(fillIds: number[]): UI {
		// update the fill editor properties to match the contents
		// present on the shape editor
		this.fillEditor.templatePath = this.shapeEditor.templateBase;
		this.fillEditor.templateRes = this.shapeEditor.templateRes;
		this.fillEditor.primaryActionTitle = 'Done';
		this.fillEditor.buildPaths(
			this.shapeEditor.shapesD,
			fillIds,
			this.shapeEditor.fills
		);
		this.fillEditor.selected = fillIds[this.shapeEditor.selectedShape];
		// this.fillEditor.colorMenu = new Menu(new Map());
		// update the shape editor state
		this.shapeEditor.editorMode = UIShapeEditorMode.Fill;
		return this;
	}
	public shapeFillDone(): UI {
		this.shapeEditor.editorMode = UIShapeEditorMode.Shape;
		return this;
	}
}
