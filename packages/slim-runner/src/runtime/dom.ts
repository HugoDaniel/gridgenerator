import { RuntimeDOMCaps } from "./dom/capabilities";
import { Rects } from "./dom/rects";
import { Device, IDeviceWindow } from "./device";

export class RuntimeDOM {
  public readonly fontSize: number;
  // ^ The current font-size in use
  public readonly capabilities: RuntimeDOMCaps;
  // ^ DOM available feature
  public readonly device: Device;
  // ^ Device width, height, orientation and DPR
  public readonly contexts: Map<string, RenderingContext>;
  // ^ Canvas rendering contexts
  public readonly rects: Rects;
  // ^ A cache of BoundingRects
  public readonly svg: SVGElement;
  // ^ An SVG element, useful to acess its namespace features (like matrix calculations etc...)
  constructor(w: IDeviceWindow = window) {
    this.fontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize || "16px"
    );
    this.device = new Device(w, this.fontSize);
    this.capabilities = new RuntimeDOMCaps();
    this.contexts = new Map();
    this.rects = new Rects();
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  }
}
