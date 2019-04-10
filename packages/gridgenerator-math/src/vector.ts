export {
  Data,
  create,
  fst,
  snd,
  isEqual,
  fromObj,
  serialize,
  deserialize,
  isBetween,
  getNearSet,
  insideTriangle
};
interface Data {
  x: number;
  y: number;
}
/** Creates a new vector from x and y coordinates */
function create(x: number = 0, y: number = 0): Data {
  return { x, y };
}
/** Returns the first element of the vector (x coordinate) */
function fst(v: Data): number {
  return v.x;
}
/** Returns the second element of the vector (y coordinate) */
function snd(v: Data): number {
  return v.y;
}
/** Compares two vectors for equality */
function isEqual(v1: Data, v2: Data): boolean {
  return v1.x === v2.x && v1.y === v2.y;
}
function fromObj(obj: { x: number; y: number }): Data {
  return create(obj.x, obj.y);
}
function serialize(v: Data): string {
  return JSON.stringify([v.x, v.y]);
}
function deserialize(serialized: string): Data {
  const v = JSON.parse(serialized);
  return create(v[0], v[1]);
}
/** Checks if a point (c) is in line and between two points (a, b) */
function isBetween(a: Data, b: Data, c: Data): boolean {
  const epsilon = 0.1;
  const crossproduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y);
  if (Math.abs(crossproduct) > epsilon) {
    return false;
  }
  const dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y);
  if (dotproduct < 0) {
    return false;
  }
  const squaredlengthba = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
  if (dotproduct > squaredlengthba) {
    return false;
  }
  return true;
}
function getNearSet(pt: Data, _epsilon: number = 1): Data[] {
  const result: Data[] = new Array();
  let epsilon = Math.abs(Math.round(_epsilon));
  const x = pt.x;
  const y = pt.y;
  while (epsilon > 0) {
    const xA = x - epsilon;
    const xB = x + epsilon;
    const yA = y - epsilon;
    const yB = y + epsilon;
    result.push(create(xA, yA));
    result.push(create(x, yA));
    result.push(create(xB, yA));
    result.push(create(xA, y));
    result.push(create(xB, y));
    result.push(create(xA, yB));
    result.push(create(x, yB));
    result.push(create(xB, yB));
    epsilon = epsilon - 1;
  }
  return result;
}
function insideTriangle(
  x: number,
  y: number,
  p0: Data,
  p1: Data,
  p2: Data
): boolean {
  const area =
    0.5 *
    (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
  const s =
    (1 / (2 * area)) *
    (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * x + (p0.x - p2.x) * y);
  const t =
    (1 / (2 * area)) *
    (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * x + (p1.x - p0.x) * y);
  return s >= -0.1 && t >= -0.1 && 1 - s - t >= 0;
}

/* Useful for the shape: move it there (when its done)
  public static createRounded(res: number, x: number, y: number): Vector2D {
    const halfRes = res / 2;
    let result: Vector2D;
    if (x >= halfRes && y < halfRes) {
      // 1st quadrant
      result = new Vector2D(Math.floor(x), Math.ceil(y));
    } else if (x < halfRes && y < halfRes) {
      // 2nd quadrant
      result = new Vector2D(Math.ceil(x), Math.ceil(y));
    } else if (x < halfRes && y >= halfRes) {
      // 3rd quadrant
      result = new Vector2D(Math.ceil(x), Math.floor(y));
    } else {
      // 4th quadrant
      result = new Vector2D(Math.floor(x), Math.floor(y));
    }
    return result;
  }
  */
