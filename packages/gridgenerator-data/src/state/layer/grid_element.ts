import { ShapeFillSetId } from "../shape/shape";
import { ShapeId } from "../shape_map";
export interface GridElementReviver {
  s: number;
  fsi: number;
  r: number;
}
export class GridElement {
  public shapeId: ShapeId;
  public fillSetId: ShapeFillSetId;
  public rotation: number;
  constructor(shapeId: ShapeId, fillSetId: ShapeFillSetId, rotation: number) {
    this.shapeId = shapeId;
    this.fillSetId = fillSetId;
    this.rotation = rotation;
  }
  public toJSON(): GridElementReviver {
    return {
      s: this.shapeId,
      fsi: this.fillSetId,
      r: this.rotation
    };
  }
  public static revive(o: GridElementReviver) {
    return new GridElement(o.s, o.fsi, o.r);
  }
}
