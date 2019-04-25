import { Vector2D } from "./vector";

export interface LineEquation {
  m: number;
  b: number;
}
export class Line {
  public static equation(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): LineEquation {
    return { m: (y1 - y0) / (x1 - x0), b: (x1 * y0 - x0 * y1) / (x1 - x0) };
  }
  public static intersect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ): Vector2D | null {
    const x =
      ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (Number.isNaN(x) || !Number.isFinite(x)) {
      return null;
    }
    const y =
      ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (Number.isNaN(y) || !Number.isFinite(y)) {
      return null;
    }
    return new Vector2D(x, y);
  }
}
