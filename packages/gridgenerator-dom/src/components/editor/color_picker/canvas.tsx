import { CanvasContext } from "gridgenerator-engine";
import Canvas from "../../base/canvas";

export interface IColorCanvasProps {
  onCanvasInit?(context: CanvasContext): void;
  onCanvasUnmount?(context: CanvasRenderingContext2D): void;
  size: number;
  className?: string;
  style?: object;
}
export function ColorCanvas(props: IColorCanvasProps) {
  return (
    <Canvas
      onContext={props.onCanvasInit}
      onUnmount={props.onCanvasUnmount}
      width={props.size}
      height={props.size}
      className={`ColorCanvas ${props.className || ""}`}
      is3D={false}
      style={props.style}
    />
  );
}
