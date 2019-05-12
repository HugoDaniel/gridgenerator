// @ts-ignore
import cursor_eraser from "../../assets/icons/cursor-eraser.svg";
// @ts-ignore
import cursor_move from "../../assets/icons/cursor-move.svg";
// @ts-ignore
import cursor_paint from "../../assets/icons/cursor-pencil.svg";
// @ts-ignore
import cursor_rotate from "../../assets/icons/cursor-rotate.svg";
// @ts-ignore
import cursor_select from "../../assets/icons/cursor-select.svg";
// @ts-ignore
import cursor_zoom from "../../assets/icons/cursor-zoom.svg";

import { CanvasContext, WebGLContext } from "gridgenerator-engine";
import { UpdateAction } from "../common";
import Canvas from "./base/canvas";
import { UICursor } from "gridgenerator-data";
export interface ISceneProps {
  className?: string;
  style?: string;
  width: number;
  height: number;
  onContext: (ctx: WebGLContext | CanvasContext) => void;
  action?: UpdateAction;
  cursor: UICursor;
}
function getCursorIcon(cursor: UICursor) {
  switch (cursor) {
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
      return "auto";
  }
}

export const Scene = ({
  className,
  width,
  height,
  onContext,
  cursor
}: ISceneProps) => (
  <div style={{ cursor: getCursorIcon(cursor) }}>
    <Canvas
      className={className}
      width={width}
      height={height}
      onContext={onContext}
      is3D={true}
    />
    ;
  </div>
);
