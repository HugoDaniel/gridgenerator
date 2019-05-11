import { Component } from "inferno";
import {
  CanvasContext,
  toCanvasCtx,
  toWebGLCtx,
  WebGLContext
} from "gridgenerator-engine";

const initPixelRatio = (
  canvas: HTMLCanvasElement,
  _context: CanvasContext | WebGLContext,
  w: number,
  h: number,
  is3D: boolean = false
) => {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const ctx: any = _context.ctx;
  const backingStoreRatio =
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1;
  const ratio = devicePixelRatio / backingStoreRatio;
  _context.ratio = ratio;
  // upscale the canvas if the two ratios don't match
  if (devicePixelRatio !== backingStoreRatio) {
    // const displayWidth  = Math.floor(ctx.canvas.clientWidth  * devicePixelRatio);
    // const displayHeight = Math.floor(ctx.canvas.clientHeight * devicePixelRatio);
    const oldWidth = w;
    const oldHeight = h;
    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;
    // Check if the canvas is not the same size.
    // Make the canvas the same size
    // ctx.canvas.width  = displayWidth;
    // ctx.canvas.height = displayHeight;
    // 3D canvas must use gl.viewport to adjust clip space coords
    canvas.style.width = `${oldWidth}px`;
    canvas.style.height = `${oldHeight}px`;
    if (!is3D) {
      // now scale the context to counter
      // the fact that it was manually scaled
      ctx.scale(ratio, ratio);
    }
  }
};

export interface ICanvasProps {
  className?: string;
  style?: object;
  height: number;
  width: number;
  is3D: boolean;
  onContext?(context: CanvasContext | WebGLContext): void;
  onUnmount?(context: CanvasRenderingContext2D);
}
export default class Canvas extends Component<ICanvasProps, any> {
  public canvasElement: HTMLCanvasElement;
  constructor(props: ICanvasProps) {
    super(props);
  }
  public canvasElemRef(domNode: HTMLCanvasElement) {
    this.canvasElement = domNode;
  }
  public componentDidMount() {
    const canvas = this.canvasElement;
    // set the context data, this is useful to keep track of the canvas slices
    // or other info that can be passed to the render worker and
    // scene render funcs
    const props: ICanvasProps = this.props;
    let context: CanvasContext | WebGLContext;
    if (props.is3D) {
      const ctx3D = canvas.getContext("experimental-webgl");
      if (!ctx3D) {
        // tslint:disable-next-line:no-console
        console.error("No webgl support");
        return;
      }
      context = toWebGLCtx(ctx3D, props.width, props.height);
    } else {
      const ctx2D = canvas.getContext("2d");
      if (!ctx2D) {
        // tslint:disable-next-line:no-console
        console.warn("No canvas support");
        return;
      }
      context = toCanvasCtx(
        ctx2D,
        props.width,
        props.height,
        document.createElementNS("http://www.w3.org/2000/svg", "svg")
      );
    }
    // initialize pixel ratio (for retina screens)
    initPixelRatio(
      canvas,
      context,
      this.props.width,
      this.props.height,
      props.is3D
    );
    // ^ from common.js
    // call onContext to signal the canvas initilization
    if (props.onContext) {
      props.onContext(context);
    }
  }
  public componentWillUnmount() {
    const canvas = this.canvasElement;
    const props: ICanvasProps = this.props;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (props.onUnmount && context) {
        props.onUnmount(context);
      }
    }
  }
  public render() {
    const props: ICanvasProps = this.props;
    return (
      <canvas
        ref={this.canvasElemRef.bind(this)}
        width={props.width}
        height={props.height}
        className={`Canvas ${props.is3D ? "webgl" : ""} ${props.className ||
          ""}`}
        style={props.style}
      />
    );
  }
}
