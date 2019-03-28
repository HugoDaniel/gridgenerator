import { Vector2D } from "./vector";
import { ISerializable } from "fatstate";
export type VectorMapReviver = Array<[number, number, any]>;
export class VectorMap<T> {
  protected tree: Map<number, Map<number, T>>;
  protected _size: number;
  constructor(vectors?: Vector2D[], elements?: T[]) {
    this.tree = new Map();
    // ^ a Map of Maps
    // Maps x Number values to Map's of Numbers (y's) to Bool (or anything else)
    if (vectors && vectors.length > 0 && elements) {
      this._size = vectors.length;
      for (let i = 0; i < vectors.length; i++) {
        const v = vectors[i];
        const ys: Map<number, T> = this.tree.get(v.x) || new Map();
        ys.set(v.y, elements[i]);
        this.tree.set(v.x, ys);
      }
    } else {
      this._size = 0;
    }
  }
  public toString(elemToString: (e: any) => any) {
    const result: VectorMapReviver = [];
    this.map((elem, x, y) => {
      if (x !== undefined && y !== undefined) {
        result.push([x, y, elemToJSON(elem)]);
      }
    });
    return result;
  }
  public static revive(
    a: VectorMapReviver,
    reviveElem: (e: any) => any
  ): VectorMap<any> {
    const result = new VectorMap();
    a.map(v => result.addXY(v[0], v[1], reviveElem(v[2])));
    return result;
  }
  public clear() {
    this.tree.clear();
    this._size = 0;
  }
  get size(): number {
    return this._size;
  }
  public firstValue(): T {
    if (this.size === 0) {
      throw new Error("No values in VectorMap");
    }
    return this.tree
      .values()
      .next()
      .value.values()
      .next().value;
  }
  public firstKey(): Vector2D {
    if (this.size === 0) {
      throw new Error(
        "Trying to get the firstKey() but there are no keys in VectorMap/Set"
      );
    }
    const [x, ys] = this.tree.entries().next().value;
    return new Vector2D(x, ys.keys().next().value);
  }
  public filter(f: (elem: T, x?: number, y?: number) => boolean): VectorMap<T> {
    const result: VectorMap<T> = new VectorMap();
    for (const [x, ymap] of this.tree.entries()) {
      for (const [y, val] of ymap.entries()) {
        if (f(val, x, y)) {
          result.addXY(x, y, val);
        }
      }
    }
    return result;
  }
  public map(f: (elem: T, x?: number, y?: number) => any): VectorMap<any> {
    const result: VectorMap<any> = new VectorMap();
    for (const [x, ymap] of this.tree.entries()) {
      for (const [y, val] of ymap.entries()) {
        result.addXY(x, y, f(val, x, y));
      }
    }
    return result;
  }
  public *entries(): IterableIterator<[T, [number, number]]> {
    for (const [x, ymap] of this.tree.entries()) {
      for (const [y, val] of ymap.entries()) {
        yield [val, [x, y]];
      }
    }
  }
  public addXY(x: number, y: number, value: T): VectorMap<T> {
    const ys: Map<number, T> = this.tree.get(x) || new Map();
    if (ys.size === 0 || !ys.has(y)) {
      this._size += 1;
    }
    ys.set(y, value);
    this.tree.set(x, ys);
    return this;
  }
  /** Adds a value into the VectorMap x,y position set by Vector2D v */
  public addValue(v: Vector2D, value: T): VectorMap<T> {
    return this.addXY(v.x, v.y, value);
  }
  public deleteXY(x: number, y: number): VectorMap<T> {
    const ys: Map<number, T> = this.tree.get(x) || new Map();
    if (ys.size <= 1) {
      this.tree.delete(x);
    } else {
      ys.delete(y);
    }
    this._size -= 1;
    return this;
  }
  public delete(v: Vector2D): VectorMap<T> {
    return this.deleteXY(v.x, v.y);
  }
  public hasXY(x: number, y: number): boolean {
    const map = this.tree.get(x);
    if (map) {
      return map.has(y);
    }
    return false;
  }
  public has(v: Vector2D): boolean {
    return this.hasXY(v.x, v.y);
  }
  public get(v: Vector2D): T | undefined {
    return this.getXY(v.x, v.y);
  }
  public getXY(x: number, y: number): T | undefined {
    const ymap = this.tree.get(x);
    if (!ymap) {
      return undefined;
    }
    return ymap.get(y);
  }
  public equals(set2: VectorMap<T>) {
    const set1 = this;
    if (set1.size !== set2.size) {
      return false;
    }
    for (const [x, ymap] of set1.tree.entries()) {
      for (const [y, val] of ymap.entries()) {
        const value = set2.getXY(x, y);
        if (!value || value !== val) {
          return false;
        }
      }
    }
    return true;
  }
}

export class VectorSet extends VectorMap<Vector2D> {
  constructor(vectors?: Vector2D[]) {
    if (vectors) {
      super(vectors, vectors);
    } else {
      super();
    }
  }
  public toJSON() {
    const result: Array<[number, number, any]> = this.toArray().map(
      v => [v.x, v.y, 0] as [number, number, any]
    );
    return result;
  }
  public static revive(
    a: Array<[number, number, any]>,
    reviveElem: (e: any) => any
  ): VectorSet {
    const result = new VectorSet();
    a.map(v => result.add(new Vector2D(v[0], v[1])));
    return result;
  }
  public add(v: Vector2D): VectorSet {
    return this.addValue(v, v) as VectorSet;
  }
  public delete(v: Vector2D): VectorSet {
    return super.delete(v) as VectorSet;
  }
  public dup(): VectorSet {
    const result = new VectorSet();
    return result.append(this);
  }
  public append(set: VectorSet): VectorSet {
    for (const [x, ymap] of set.tree.entries()) {
      for (const [y, val] of ymap.entries()) {
        this.addXY(x, y, val);
      }
    }
    return this;
  }
  public *values() {
    for (const ymap of this.tree.values()) {
      for (const v of ymap.values()) {
        yield v;
      }
    }
  }
  public toArray(): Vector2D[] {
    const result: Vector2D[] = [];
    for (const ymap of this.tree.values()) {
      for (const v of ymap.values()) {
        result.push(v);
      }
    }
    return result;
  }
  public first(): Vector2D {
    return super.firstKey();
  }
  public equals(set2: VectorSet): boolean {
    const set1 = this;
    if (set1.size !== set2.size) {
      return false;
    }
    for (const ymap of set1.tree.values()) {
      for (const v of ymap.values()) {
        if (!set2.has(v)) {
          return false;
        }
      }
    }
    return true;
  }
  public filter(
    f: (v: Vector2D, x?: number, y?: number) => boolean
  ): VectorSet {
    const result: VectorSet = new VectorSet();
    for (const [x, ymap] of this.tree.entries()) {
      for (const [y, val] of ymap.entries()) {
        if (f(val, x, y)) {
          result.add(val);
        }
      }
    }
    return result;
  }
  public map(f: (v: Vector2D, x?: number, y?: number) => any): VectorSet {
    return super.map(f) as VectorSet;
  }
}
