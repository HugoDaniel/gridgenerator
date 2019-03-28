import { should } from "fuse-test-runner";
import { Vector2D } from "./vector";
import { VectorMap, VectorSet } from "./vectorMap";

const vectors1 = [
  new Vector2D(100, 100),
  new Vector2D(101, 100),
  new Vector2D(102, 100),
  new Vector2D(103, 100),
  new Vector2D(100, 101),
  new Vector2D(100, 102),
  new Vector2D(100, 103),
  new Vector2D(-101, -101),
  new Vector2D(-102, -102),
  new Vector2D(-103, -103),
  new Vector2D(0, 0),
  new Vector2D(-1, 0),
  new Vector2D(0, -1),
  new Vector2D(-1, -1),
  new Vector2D(1, -1),
  new Vector2D(0, 1),
  new Vector2D(1, 1),
  new Vector2D(1, 0)
];

const items = vectors1.map(v => `${v.x}_${v.y}`);

export class VectorMapTest {
  "VectorMap: create a new map"() {
    const m0 = new VectorMap<string>();
    should(m0).beOkay();
    should(m0.size).equal(0);
    const m1 = new VectorMap<string>(vectors1, items);
    should(m1.size).equal(items.length);
  }
}
