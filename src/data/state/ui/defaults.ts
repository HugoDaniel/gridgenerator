// @ts-ignore
import picker_hering_icon from '../../../assets/icons/picker-hering.svg';
// @ts-ignore
import picker_lightness_icon from '../../../assets/icons/picker-lightness.svg';
// @ts-ignore
import picker_saturation_icon from '../../../assets/icons/picker-saturation.svg';
// @ts-ignore
import tools_artists_icon from '../../../assets/icons/tools-artists.svg';
// @ts-ignore
import tools_delete_icon from '../../../assets/icons/tools-eraser.svg';
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
	Publish = 'publish'
}

export const DefaultFeaturesMenu: Map<FeaturesMenuId, MenuEntry> = new Map([
	[ FeaturesMenuId.Export,  new MenuEntry('Export')],
	[ FeaturesMenuId.Publish, new MenuEntry('Publish')]
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
	Paint
}
export const DefaultToolsMenu: Map<ToolsMenuId, MenuEntry> = new Map([
	[ ToolsMenuId.Undo,    new MenuEntry('Undo', tools_undo_icon) ],
// 	[ ToolsMenuId.Artists, new MenuEntry('Artists', tools_artists_icon) ],
  [ ToolsMenuId.Zoom,    new MenuEntry('Zoom', tools_zoom_icon) ],
	[ ToolsMenuId.Move,    new MenuEntry('Move', tools_move_icon) ],
	[ ToolsMenuId.Delete,  new MenuEntry('Delete', tools_delete_icon) ],
	[ ToolsMenuId.Paint,   new MenuEntry('Paint', tools_paint_icon) ]
]);

export enum UIFillEditorColorMode { Saturation = 1, Hering, Lightness }

export const DefaultColorMenu: Map<UIFillEditorColorMode, MenuEntry> = new Map([
	[ UIFillEditorColorMode.Saturation, new MenuEntry('Saturation', picker_saturation_icon) ],
	[ UIFillEditorColorMode.Hering,     new MenuEntry('Color', picker_hering_icon) ],
	[ UIFillEditorColorMode.Lightness,  new MenuEntry('Light', picker_lightness_icon) ]
]);
