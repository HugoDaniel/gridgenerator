import { CanvasContext, WebGLContext } from "gridgenerator-engine";
import { UpdateAction } from "../common";
import Canvas, { ICanvasProps } from "./base/canvas";
export interface ISceneProps {
  className?: string;
  style?: string;
  width: number;
  height: number;
  onContext: (ctx: WebGLContext | CanvasContext) => void;
  action?: UpdateAction;
}
export const Scene = (props: ISceneProps) => {
  const canvasProps: ICanvasProps = {
    is3D: true,
    className: props.className,
    onContext: props.onContext,
    height: props.height,
    width: props.width
  };
  return <Canvas {...canvasProps} />;
};
