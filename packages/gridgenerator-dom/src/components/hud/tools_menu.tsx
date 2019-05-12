// @ts-ignore
import tools_artists_icon from "../../../assets/icons/tools-artists.svg";
// @ts-ignore
import tools_delete_icon from "../../../assets/icons/tools-eraser.svg";
// @ts-ignore
import tools_grid_icon from "../../../assets/icons/tools-grid.svg";
// @ts-ignore
import tools_move_icon from "../../../assets/icons/tools-move.svg";
// @ts-ignore
import tools_paint_icon from "../../../assets/icons/tools-pencil.svg";
// @ts-ignore
import tools_undo_icon from "../../../assets/icons/tools-undo.svg";
// @ts-ignore
import tools_zoom_icon from "../../../assets/icons/tools-zoom.svg";

import { linkEvent } from "inferno";
import { Menu, ToolsMenuId } from "gridgenerator-data";
import { justClick } from "../../common";
import { SubmenuGrid } from "./submenu_grid";
import { SubmenuZoom } from "./submenu_zoom";

const noPropagation = justClick;

export interface IToolsMenuProps {
  className?: string;
  withMoveZoom: boolean;
  // ^ show zoom and move icons ?
  isVisible: boolean;
  menu: Menu<ToolsMenuId>;
  onAction: (id: ToolsMenuId, e: Event) => void;
  onZoomIn: (e: Event) => void;
  onZoomOut: (e: Event) => void;
  onToggleGrid: (e: Event) => void;
  onTogglePattern: (e: Event) => void;
  onExitGrid: (e: Event) => void;
  isGridVisible: boolean;
  isPatternOn: boolean;
}

function getImgUrl(id: ToolsMenuId): string {
  switch (id) {
    case ToolsMenuId.Artists:
      return tools_artists_icon;
    case ToolsMenuId.Delete:
      return tools_delete_icon;
    case ToolsMenuId.Grid:
      return tools_grid_icon;
    case ToolsMenuId.Move:
      return tools_move_icon;
    case ToolsMenuId.Paint:
      return tools_paint_icon;
    case ToolsMenuId.Undo:
      return tools_undo_icon;
    case ToolsMenuId.Zoom:
      return tools_zoom_icon;
  }
}
export const ToolsMenu = (props: IToolsMenuProps) => (
  <nav
    className={`ToolsMenu ${props.className || ""} ${
      props.isVisible ? "flex" : "dn"
    } items-end justify-center`}
    $HasKeyedChildren
  >
    {props.menu.map(
      (id, e, isSelected) => {
        if (id === ToolsMenuId.Zoom && isSelected) {
          return (
            <SubmenuZoom
              key={`zoom-submenu`}
              onZoomIn={props.onZoomIn}
              onZoomOut={props.onZoomOut}
            />
          );
        } else if (id === ToolsMenuId.Grid && isSelected) {
          return (
            <SubmenuGrid
              key={`grid-submenu`}
              onView={props.onToggleGrid}
              onPattern={props.onTogglePattern}
              onExit={props.onExitGrid}
              isGridVisible={props.isGridVisible}
              isPatternOn={props.isPatternOn}
            />
          );
        } else {
          return (
            <a
              key={`toolsmenu-${id}`}
              href={`#${id}`}
              onClick={linkEvent(id, props.onAction)}
              {...noPropagation}
              className={`f7 no-underline black hover-color ttu sans-serif dib ph2 pv2 ${
                isSelected ? "bottom-circle" : ""
              }`}
            >
              {e.tooltip ? (
                <div className="absolute" data-tooltip={e.tooltip} />
              ) : (
                <div />
              )}
              <img
                src={getImgUrl(id)}
                alt={`${e.label} tool`}
                className={"w1"}
              />
            </a>
          );
        }
      },
      (id, e, isSelected) => {
        if (props.withMoveZoom) {
          return true;
        } else {
          return id !== ToolsMenuId.Zoom && id !== ToolsMenuId.Move;
        }
      }
    )}
  </nav>
);
