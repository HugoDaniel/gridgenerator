import { should } from "fuse-test-runner";
import * as Vector from "./vector";

export class VectorTest {
  "Vector: create a new vector"() {
    const v0 = Vector.create();
    should(v0).beOkay();
    should(v0.x).equal(0);
    should(v0.y).equal(0);
    const v1 = Vector.create(123, 321);
    should(v1.x).equal(123);
    should(v1.y).equal(321);
  }
  "Vector: can serialize and deserialize"() {
    const v0 = Vector.create();
    should(Vector.deserialize(Vector.serialize(v0))).deepEqual(v0);
    const v1 = Vector.create(123, 321);
    should(Vector.deserialize(Vector.serialize(v1))).deepEqual(v1);
  }
  "Vector: fst() returns x and snd() returns y"() {
    const v0 = Vector.create();
    should(Vector.fst(v0)).equal(0);
    should(Vector.snd(v0)).equal(0);
    const v1 = Vector.create(123, 321);
    should(Vector.fst(v1)).equal(123);
    should(Vector.snd(v1)).equal(321);
  }
  "Vector: can compare two vectors"() {
    const v0 = Vector.create();
    const v1 = Vector.create(123, 321);
    should(Vector.isEqual(v0, Vector.create())).beTrue();
    should(Vector.isEqual(v1, Vector.create(123, 321))).beTrue();
    should(Vector.isEqual(v0, v1)).beFalse();
    should(Vector.isEqual(v0, Vector.create())).beTrue();
    should(Vector.isEqual(v1, Vector.create(123, 321))).beTrue();
  }
  "Vector: can create vector from object"() {
    const v1 = Vector.create(123, 321);
    should(Vector.fromObj({ x: 123, y: 321 })).deepEqual(v1);
  }
  "Vector: can check if one vector is between (in line) two other"() {
    const v1 = Vector.create(0, 10);
    const v2 = Vector.create(0, 20);
    const v3 = Vector.create(0, 30);
    should(Vector.isBetween(v1, v3, v2)).beTrue();
    const v4 = Vector.create(10, 0);
    const v5 = Vector.create(20, 0);
    const v6 = Vector.create(30, 0);
    should(Vector.isBetween(v4, v6, v5)).beTrue();
    should(Vector.isBetween(v4, v2, v5)).beFalse();
  }
  "Vector: can return the near set of points for a given threshold"() {
    const v1 = Vector.create(0, 0);
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
    const result = Vector.getNearSet(v1);
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
  "Vector: can check if a point is inside a triangle defined by 3 Vector's"() {
    const v0 = Vector.create();
    const v1 = Vector.create(4, 0);
    const v2 = Vector.create(0, 2);
    should(Vector.insideTriangle(2, 1, v0, v1, v2)).beTrue();
    should(Vector.insideTriangle(2, 5, v0, v1, v2)).beFalse();
  }
}
