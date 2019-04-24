import { Vector2D } from "./vector";

export function arcEllipse(
  cx: number,
  cy: number,
  h: number,
  v: number,
  a: number,
  pt: Vector2D
): number {
  const _x = (pt.x - cx) * Math.cos(a) + (pt.y - cy) * Math.sin(a) + cx;
  const _y = (pt.y - cy) * Math.cos(a) + (pt.x - cx) * Math.sin(a) + cy;
  const x = (_x - cx) / h;
  const y = (_y - cy) / v;
  let arctan = 2 * Math.PI;
  if (x > 0 && y >= 0) {
    arctan = Math.atan(y / x);
  } else if (x < 0 && y >= 0) {
    arctan = Math.PI - Math.atan(y / -x);
  } else if (x < 0 && y < 0) {
    arctan = Math.PI + Math.atan(y / x);
  } else if (x > 0 && y < 0) {
    arctan = 2 * Math.PI - Math.atan(-y / x);
  } else if (x === 0 && y >= 0) {
    arctan = Math.PI / 2;
  } else if (x === 0 && y < 0) {
    arctan = (3 * Math.PI) / 2;
  }
  return arctan;
  // ^ the clockwise angle in radians
  // starting from the horizontal right position
}
export interface LineObj {
  m: number;
  x: number;
  y: number;
}
export function tanEllipse(
  cx: number,
  cy: number,
  h: number,
  v: number,
  a: number,
  pt: Vector2D
): LineObj {
  const _xm = (pt.x - cx) * Math.cos(a) + (pt.y - cy) * Math.sin(a);
  const _ym = (pt.y - cy) * Math.cos(a) + (pt.x - cx) * Math.sin(a);
  const _x = _xm + cx;
  const _y = _ym + cy;
  const m1 = (-(_xm / _ym) * (v * v)) / (h * h);
  let m2;
  if (isFinite(m1)) {
    m2 = (m1 * Math.cos(a) + Math.sin(a)) / (Math.cos(a) - m1 * Math.sin(a));
  } else {
    m2 = Math.cos(a) / -Math.sin(a);
  }
  const y2 = (_y - cy) * Math.cos(a) + (_x - cx) * Math.sin(a) + cy;
  const x2 = (_x - cx) * Math.cos(a) - (y2 - cy) * Math.sin(a) + cx;
  return { m: m2, x: x2, y: y2 };
}

/** Gets the point on the ellipse for the angle b */
export function plotEllipse(
  cx: number,
  cy: number,
  h: number,
  v: number,
  a: number,
  b: number
): Vector2D {
  const x = h * Math.cos(b) * Math.cos(a) - v * Math.sin(b) * Math.sin(a);
  const y = v * Math.sin(b) * Math.cos(a) + h * Math.cos(b) * Math.sin(a);
  return new Vector2D(x + cx, y + cy);
}

/** Checks if tangle is between angle1 and angle2 */
export function isBetweenEllipseAngles(
  angle1: number,
  angle2: number,
  tangle: number
): boolean {
  const diff = Math.abs(angle2 - angle1);
  if (diff >= Math.PI) {
    // longest arc
    // if the testing angle is not present in the longest arc
    // then it is between the pt1 and pt2
    if (angle1 > angle2) {
      return !(tangle < angle1 && tangle > angle2);
    } else {
      return !(tangle < angle2 && tangle > angle1);
    }
  } else {
    // shortest arc
    if (angle1 > angle2) {
      return tangle < angle1 && tangle > angle2;
    } else {
      return tangle > angle1 && tangle < angle2;
    }
  }
}

export function intersectLinesSlope(
  m1: number,
  x1: number,
  b1: number,
  m2: number,
  x2: number,
  b2: number
): Vector2D {
  const b = b1 - b2;
  const x = -(b - m1 * x1 + m2 * x2) / (m1 - m2);
  const y = m1 * (x - x1) + b1;
  return new Vector2D(x, y);
}
