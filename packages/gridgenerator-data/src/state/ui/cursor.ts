import { ToolsMenuId } from "./defaults";
export const enum UICursor {
  None = "None",
  Paint = "Paint",
  Delete = "Delete",
  Zoom = "Zoom",
  Move = "Move",
  Rotate = "Rotate",
  Select = "Select"
} // icon url is defined in the UICursorHandler
export class UICursorHandler {
  public cursor: UICursor;
  constructor() {
    this.cursor = UICursor.Paint;
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
