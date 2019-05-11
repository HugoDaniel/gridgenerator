import { FatState } from "gridgenerator-data";
import { ColorCanvasPainter, Runtime } from "gridgenerator-engine";
import { Refresher } from "./refresher";

export class RecorderEvents {
  public runtime: Runtime;
  public state: FatState;
  public refresher: Refresher;
  public restoreTo: (v: number) => void;
  constructor(rt: Runtime, s: FatState, refresher: Refresher) {
    this.runtime = rt;
    this.state = s;
    this.refresher = refresher;
    this.restoreTo = (v: number) => {
      // Restore the state
      this.state.restoreTo(v);
      // Update the DOM
      this.refresher.refreshStateAndDOM(this.state);
      // Use the current runtime to paint the canvases from scratch
      // (with the ctxs from the updated runtime)
      this.canvasRefresh();
    };
    // TODO: newDOMWith(v: number)
    // TODO: ^ clears the current DOM and rebuilds a new runtime
    // TODO: (by passing a promise to Main and use that promise on the runtime...)
  }

  private canvasRefresh() {
    if (!this.runtime.colorPickerCtx) {
      throw new Error(
        "Cannot restore&refresh canvas, color context is not present"
      );
    }
    ColorCanvasPainter.INIT(this.runtime.colorPickerCtx, this.state.current);
  }
}
