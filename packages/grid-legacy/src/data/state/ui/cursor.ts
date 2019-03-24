// @ts-ignore
import cursor_eraser from '../../../assets/icons/cursor-eraser.svg';
// @ts-ignore
import cursor_move from '../../../assets/icons/cursor-move.svg';
// @ts-ignore
import cursor_paint from '../../../assets/icons/cursor-pencil.svg';
// @ts-ignore
import cursor_rotate from '../../../assets/icons/cursor-rotate.svg';
// @ts-ignore
import cursor_select from '../../../assets/icons/cursor-select.svg';
// @ts-ignore
import cursor_zoom from '../../../assets/icons/cursor-zoom.svg';
import { ToolsMenuId } from './defaults';
export const enum UICursor {
	None = 'None',
	Paint = 'Paint',
	Delete = 'Delete',
	Zoom = 'Zoom',
	Move = 'Move',
	Rotate = 'Rotate',
	Select = 'Select'
} // icon url is defined in the UICursorHandler
export class UICursorHandler {
	public cursor: UICursor;
	constructor() {
		this.cursor = UICursor.Paint;
	}
	public iconURL(): string {
		switch (this.cursor) {
			case UICursor.Paint:
			return `url(${cursor_paint}), auto`;
			case UICursor.Delete:
			return `url(${cursor_eraser}), auto`;
			case UICursor.Move:
			return `url(${cursor_move}), auto`;
			case UICursor.Zoom:
			return `url(${cursor_zoom}), auto`;
			case UICursor.Rotate:
			return `url(${cursor_rotate}), auto`;
			case UICursor.Select:
			return `url(${cursor_select}), auto`;
			default:
			return 'auto';
		}
	}
	public static toolIcon(t: ToolsMenuId): UICursor {
		switch (t) {
			case ToolsMenuId.Grid:
			case ToolsMenuId.Paint:
			return UICursor.Paint;
			case ToolsMenuId.Delete:
			return UICursor.Delete;
			case ToolsMenuId.Move:
			return UICursor.Move;
			case ToolsMenuId.Zoom:
			return UICursor.Zoom;
			default:
			return UICursor.None;
		}
	}
}
