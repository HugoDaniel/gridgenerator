import { should } from "fuse-test-runner";
import { Vector2D } from "./vector";

export class Vector2DTest {
  "Vector2D: create a new vector"() {
    const v0 = new Vector2D();
    should(v0).beOkay();
    should(v0.x).equal(0);
    should(v0.y).equal(0);
    const v1 = new Vector2D(123, 321);
    should(v1.x).equal(123);
    should(v1.y).equal(321);
  }
  "Vector2D: can serialize and deserialize"() {
    const v0 = new Vector2D();
    should(v0.fromString(v0.toString())).deepEqual(v0);
    const v1 = new Vector2D(123, 321);
    should(v1.fromString(v1.toString())).deepEqual(v1);
  }
  "Vector2D: has fst() and snd() attributes"() {
    const v0 = new Vector2D();
    should(v0.fst).beOkay();
    should(v0.snd).beOkay();
    should(v0.fst).equal(0);
    should(v0.snd).equal(0);
    const v1 = new Vector2D(123, 321);
    should(v1.fst).equal(123);
    should(v1.snd).equal(321);
  }
  "Vector2D: can compare two vectors"() {
    const v0 = new Vector2D();
    const v1 = new Vector2D(123, 321);
    should(v0.isEqual).beFunction();
    should(v0.isEqual(new Vector2D())).beTrue();
    should(v1.isEqual(new Vector2D(123, 321))).beTrue();
    should(v0.isEqual(v1)).beFalse();
    should(Vector2D.isEqual(v0, new Vector2D())).beTrue();
    should(Vector2D.isEqual(v1, new Vector2D(123, 321))).beTrue();
  }
  "Vector2D: can create vector from object"() {
    const v1 = new Vector2D(123, 321);
    should(Vector2D.fromObj({ x: 123, y: 321 })).deepEqual(v1);
  }
  "Vector2D: can check if one vector is between (in line) two other"() {
    const v1 = new Vector2D(0, 10);
    const v2 = new Vector2D(0, 20);
    const v3 = new Vector2D(0, 30);
    should(Vector2D.isBetween(v1, v3, v2)).beTrue();
    const v4 = new Vector2D(10, 0);
    const v5 = new Vector2D(20, 0);
    const v6 = new Vector2D(30, 0);
    should(Vector2D.isBetween(v4, v6, v5)).beTrue();
    should(Vector2D.isBetween(v4, v2, v5)).beFalse();
  }
  "Vector2D: can return the near set of points for a given threshold"() {
    const v1 = new Vector2D(0, 0);
    const expected = [
      {
        x: -1,
        y: -1
      },
      {
        x: 0,
        y: -1
      },
      {
        x: 1,
        y: -1
      },
      {
        x: -1,
        y: 0
      },
      {
        x: 1,
        y: 0
      },
      {
        x: -1,
        y: 1
      },
      {
        x: 0,
        y: 1
      },
      {
        x: 1,
        y: 1
      }
    ];
    const result = Vector2D.getNearSet(v1);
    should(result).haveLength(expected.length);
    should(result).beArray();
    for (let i = 0; i < result.length; i++) {
      const v = result[i];
      let found = false;
      for (let e = 0; e < expected.length; e++) {
        const expectedVector = expected[e];
        found = v.x === expectedVector.x && v.y === expectedVector.y;
        if (found) break;
      }
      should(found).beTrue();
    }
  }
  "Vector2D: can check if a point is inside a triangle defined by 3 Vector2D"() {
    const v0 = new Vector2D();
    const v1 = new Vector2D(4, 0);
    const v2 = new Vector2D(0, 2);
    should(Vector2D.insideTriangle(2, 1, v0, v1, v2)).beTrue();
    should(Vector2D.insideTriangle(2, 5, v0, v1, v2)).beFalse();
  }
}
