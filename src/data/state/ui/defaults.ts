// @ts-ignore
import picker_hering_icon from '../../../assets/icons/picker-hering.svg';
// @ts-ignore
import picker_lightness_icon from '../../../assets/icons/picker-lightness.svg';
// @ts-ignore
import picker_saturation_icon from '../../../assets/icons/picker-saturation.svg';
// @ts-ignore
import shirt_icon from '../../../assets/icons/shirt.svg';
// @ts-ignore
import tools_artists_icon from '../../../assets/icons/tools-artists.svg';
// @ts-ignore
import tools_delete_icon from '../../../assets/icons/tools-eraser.svg';
// @ts-ignore
import tools_grid_icon from '../../../assets/icons/tools-grid.svg';
// @ts-ignore
import tools_move_icon from '../../../assets/icons/tools-move.svg';
// @ts-ignore
import tools_paint_icon from '../../../assets/icons/tools-pencil.svg';
// @ts-ignore
import tools_undo_icon from '../../../assets/icons/tools-undo.svg';
// @ts-ignore
import tools_zoom_icon from '../../../assets/icons/tools-zoom.svg';

import { MenuEntry } from './menu';

export const enum FeaturesMenuId {
	Export = 'export',
	Publish = 'publish',
	Product = 'product'
}

export const DefaultFeaturesMenu: Map<FeaturesMenuId, MenuEntry> = new Map([
	[ FeaturesMenuId.Export,  new MenuEntry('Export')],
	[ FeaturesMenuId.Publish, new MenuEntry('Publish')]
// [ FeaturesMenuId.Product, new MenuEntry('Make product', shirt_icon)]
]);

export const enum MainMenuId {
	Profile = 'profile',
	About = 'about',
	Collective = 'collective',
	Pricing = 'pricing'
}
export const DefaultMainMenu: Map<MainMenuId, MenuEntry> = new Map([
	[ MainMenuId.Collective, new MenuEntry('Examples')],
	[ MainMenuId.Pricing,    new MenuEntry('Pricing')],
	[ MainMenuId.About,      new MenuEntry('About')],
	[ MainMenuId.Profile,    new MenuEntry('Projects')]
]);

export const enum ToolsMenuId {
	Artists = 100,
	Undo,
	Zoom,
	Move,
	Delete,
	Paint,
	Grid
}
export const DefaultToolsMenu: Map<ToolsMenuId, MenuEntry> = new Map([
	[ ToolsMenuId.Undo,    new MenuEntry('Undo', tools_undo_icon, 'Undo') ],
// 	[ ToolsMenuId.Artists, new MenuEntry('Artists', tools_artists_icon) ],
  [ ToolsMenuId.Zoom,    new MenuEntry('Zoom', tools_zoom_icon, 'Zoom') ],
	[ ToolsMenuId.Move,    new MenuEntry('Move', tools_move_icon, 'Pan/Move Grid') ],
	[ ToolsMenuId.Grid,    new MenuEntry('Grid', tools_grid_icon, 'Pattern') ],
	[ ToolsMenuId.Delete,  new MenuEntry('Delete', tools_delete_icon, 'Eraser') ],
	[ ToolsMenuId.Paint,   new MenuEntry('Paint', tools_paint_icon, 'Draw') ]
]);

export enum UIFillEditorColorMode { Saturation = 1, Hering, Lightness, Code }

export const DefaultColorMenu: Map<UIFillEditorColorMode, MenuEntry> = new Map([
	[ UIFillEditorColorMode.Saturation, new MenuEntry('Saturation', picker_saturation_icon) ],
	[ UIFillEditorColorMode.Hering,     new MenuEntry('Color', picker_hering_icon) ],
	[ UIFillEditorColorMode.Lightness,  new MenuEntry('Light', picker_lightness_icon) ]
]);
