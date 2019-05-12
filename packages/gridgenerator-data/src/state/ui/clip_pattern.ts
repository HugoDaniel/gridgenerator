import { TilePattern } from "../layer/tile_pattern";
import { Viewport } from "../viewport";
export const enum PatternHit {
  Inside = "Inside",
  Outside = "Outside",
  StartCircle = "StartCircle",
  EndCircle = "EndCircle"
}
export class ClipPattern {
  public gridPattern: TilePattern;
  // ^ the TilePattern associated with this ClipPattern
  public screenStartX: number;
  public screenStartY: number;
  public screenEndX: number;
  public screenEndY: number;
  private circleRadius: number;
  constructor(tp: TilePattern) {
    this.gridPattern = tp;
    // Please update with updateFromViewport
    this.screenStartX = -1;
    this.screenStartY = -1;
    this.screenEndX = -1;
    this.screenEndY = -1;
    this.circleRadius = 8;
  }
  /** Updates the screen coordinates from a Viewport (useful when zoom or pan occurs) */
  public updateFromViewport: (v: Viewport) => ClipPattern = v => {
    // !FIXME: assume square grid, for now
    // !TODO: test for diff. DPI's
    // calculate the screen start coords
    this.screenStartX = v.screenX(this.gridPattern.startX);
    this.screenStartY = v.screenY(this.gridPattern.startY);
    this.screenEndX = v.screenX(this.gridPattern.endX);
    this.screenEndY = v.screenY(this.gridPattern.endY);
    this.circleRadius = v.unitSize / 8;
    return this;
  };
  /** Determines if a given screen point is inside this pattern painting area */
  private isInside: (screenX: number, screenY: number) => boolean = (
    screenX,
    screenY
  ) => {
    return (
      screenX <= this.screenEndX &&
      screenX >= this.screenStartX &&
      screenY <= this.screenEndY &&
      screenY >= this.screenStartY
    );
  };
  /** Determines if a given screen point is inside this pattern starting circle */
  private isInStartCircle: (screenX: number, screenY: number) => boolean = (
    screenX,
    screenY
  ) => {
    return (
      Math.hypot(this.screenStartX - screenX, this.screenStartY - screenY) <=
      2 * this.circleRadius
    );
  };
  /** Determines if a given screen point is inside this pattern starting circle */
  private isInEndCircle: (screenX: number, screenY: number) => boolean = (
    screenX,
    screenY
  ) => {
    return (
      Math.hypot(this.screenEndX - screenX, this.screenEndY - screenY) <=
      2 * this.circleRadius
    );
  };
  public hit(x: number, y: number): PatternHit {
    if (this.isInEndCircle(x, y)) {
      return PatternHit.EndCircle;
    } else if (this.isInStartCircle(x, y)) {
      return PatternHit.StartCircle;
    } else if (!this.isInside(x, y)) {
      return PatternHit.Outside;
    }
    return PatternHit.Inside;
  }
}
