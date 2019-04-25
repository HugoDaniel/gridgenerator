import { VectorSet } from "../math/set";
import { Vector2D } from "../math/vector";
import {
  ElementType,
  Template,
  TemplateElement,
  TemplateElementReviver,
  TemplateReviver
} from "./template";

export interface IPathFigure {
  d: string;
  fillId: number;
  isHidden: boolean;
}
const enum ActionType {
  Move = 1,
  Line,
  HLine,
  VLine,
  Arc,
  Close
}
export interface PathActionReviver {
  at: number;
  a: Array<number | boolean>;
  e: TemplateElementReviver | null;
}
class PathAction {
  public readonly actionType: ActionType;
  public readonly args: Array<number | boolean>;
  public readonly element: TemplateElement | null;
  constructor(
    actionType: ActionType,
    args: Array<number | boolean>,
    element: TemplateElement | null
  ) {
    this.actionType = actionType;
    this.args = args;
    this.element = element;
  }
  public toJSON(): PathActionReviver {
    return {
      at: this.actionType as number,
      a: this.args.slice(0),
      e: this.element !== null ? this.element.toJSON() : null
    };
  }
  public static revive(o: PathActionReviver) {
    return new PathAction(
      o.at,
      o.a,
      o.e !== null ? TemplateElement.revive(o.e) : null
    );
  }
  public isEqual(a: PathAction): boolean {
    if (this.actionType === a.actionType) {
      let testArgsNeeded = false;
      if (this.element && a.element) {
        testArgsNeeded = this.element.isEqual(a.element);
      } else if (!this.element && !a.element) {
        testArgsNeeded = true; // both are null
      }
      if (testArgsNeeded) {
        for (let i = 0; i < this.args.length; i++) {
          if (this.args[i] !== a.args[i]) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }
  public isClosed(): boolean {
    return this.actionType === ActionType.Close;
  }
  public static Reverse(
    pt: Vector2D,
    prevPt: Vector2D,
    a: PathAction
  ): PathAction | undefined {
    if (!a.element) {
      throw new Error(
        `Trying to Reverse() PathAction, but no element is present in the provided PathAction ${a}`
      );
    }
    switch (a.actionType) {
      case ActionType.Line:
        return PathAction.Line(pt.x, pt.y, a.element);
      case ActionType.HLine:
        return PathAction.HLine(pt.x, a.element);
      case ActionType.VLine:
        return PathAction.VLine(pt.y, a.element);
      case ActionType.Arc:
        const [arc1, arc2] = PathAction.Arc(a.element, prevPt, pt);
        // ^ pick the action that uses the same arc (short/large)
        if (arc1.args[3] === a.args[3]) {
          return arc1;
        } else {
          return arc2;
        }
    }
  }
  public static Close(): PathAction {
    return new PathAction(ActionType.Close, [], null);
  }
  public static Move(x: number, y: number): PathAction {
    return new PathAction(ActionType.Move, [x, y], null);
  }
  public static Line(x: number, y: number, elem: TemplateElement): PathAction {
    return new PathAction(ActionType.Line, [x, y], elem);
  }
  public static HLine(x: number, elem: TemplateElement): PathAction {
    return new PathAction(ActionType.HLine, [x], elem);
  }
  public static VLine(y: number, elem: TemplateElement): PathAction {
    return new PathAction(ActionType.VLine, [y], elem);
  }
  public static Arc(
    ellipse: TemplateElement,
    origin: Vector2D,
    dest: Vector2D
  ): PathAction[] {
    const [cx, cy, _rx, _ry, alpha] = ellipse.args;
    // adjust for error correction
    const rx = _rx - 0.5;
    const ry = _ry - 0.5;
    const x = dest.x;
    const y = dest.y;
    const s = ellipse.ellipseSweep(origin, dest);
    const defaultArc = [rx, ry, alpha, false, s, x, y];
    const oppositeArc = defaultArc.slice(0);
    oppositeArc[3] = true;
    oppositeArc[4] = !s;
    return [
      new PathAction(ActionType.Arc, defaultArc, ellipse),
      new PathAction(ActionType.Arc, oppositeArc, ellipse)
    ];
  }
  private static elementsFromOriginToDest(
    t: Template,
    origin: Vector2D,
    dest: Vector2D
  ): Set<TemplateElement> {
    const oElems = t.getElements(origin);
    const dElems = t.getElements(dest);
    const intersection = new Set();
    for (const e of oElems) {
      if (dElems.has(e)) {
        intersection.add(e);
      }
    }
    return intersection;
  }
  public static Select(
    t: Template,
    origin: Vector2D,
    dest: Vector2D
  ): PathAction[] {
    const routes = PathAction.elementsFromOriginToDest(t, origin, dest);
    const result: PathAction[] = [];
    for (const r of routes) {
      switch (r.type) {
        case ElementType.VLine:
          result.push(PathAction.VLine(dest.y, r));
          break;
        case ElementType.HLine:
          result.push(PathAction.HLine(dest.x, r));
          break;
        case ElementType.Line:
          result.push(PathAction.Line(dest.x, dest.y, r));
          break;
        case ElementType.Ellipse:
          const [a1, a2] = PathAction.Arc(r, origin, dest);
          result.push(a1);
          result.push(a2);
          break;
      }
    }
    return result;
  }
  private arcArgsToStr() {
    const newArgs = this.args.slice();
    newArgs[3] = newArgs[3] ? 1 : 0;
    newArgs[4] = newArgs[4] ? 1 : 0;
    return newArgs.join(" ");
  }
  public toString() {
    switch (this.actionType) {
      case ActionType.Line:
        return `L ${this.args[0]} ${this.args[1]} `;
      case ActionType.HLine:
        return `H ${this.args[0]} `;
      case ActionType.VLine:
        return `V ${this.args[0]} `;
      case ActionType.Move:
        return `M ${this.args[0]} ${this.args[1]} `;
      case ActionType.Arc:
        return `A ${this.arcArgsToStr()} `;
      case ActionType.Close:
        return "Z";
    }
  }
}
export interface PathShapeReviver {
  t: PathShapeInstanceReviver[];
  at: number;
}
class PathShape {
  public readonly template: Template;
  public timeline: PathShapeInstance[];
  public at: number;
  constructor(t: Template) {
    this.timeline = [PathShapeInstance.empty(t)];
    this.at = 0;
    this.template = t;
  }
  public toJSON() {
    return {
      t: this.timeline.map(psi => psi.toJSON()),
      at: this.at
    };
  }
  public static revive(
    o: { t: PathShapeInstanceReviver[]; at: number },
    t: Template
  ) {
    const result = new PathShape(t);
    const timeline: PathShapeInstance[] = [];
    for (let i = 0; i < o.t.length; i++) {
      const psi = PathShapeInstance.revive(o.t[i], t);
      if (psi) {
        timeline.push(psi);
      }
    }
    result.timeline = timeline;
    result.at = o.at;
    return result;
  }
  public reverseTimelineBy(num: number) {
    if (num > this.timeline.length) {
      throw new Error("Reversing shape timeline to a position out of bounds");
    }
    this.at = num;
  }
  public advanceTimelineWith(shape: PathShapeInstance) {
    if (this.at !== this.timeline.length - 1) {
      this.timeline.splice(this.at + 1, this.timeline.length - this.at);
    }
    this.at++;
    this.timeline.push(shape);
  }
  public modShape(
    t: Template,
    a: PathAction[],
    reaches: VectorSet,
    curEdge: Vector2D | null,
    otherEdge: Vector2D | null,
    pts: Vector2D[]
  ) {
    return this.advanceTimelineWith(
      new PathShapeInstance(t, a, reaches, curEdge, otherEdge, pts)
    );
  }
  private cloneForward() {
    const shape = this.timeline[this.at];
    this.modShape(
      shape.template,
      shape.actions.slice(),
      shape.reachable.dup(),
      shape.currentEdge,
      shape.otherEdge,
      shape.selectedPoints.slice()
    );
  }
  public forceClose() {
    this.cloneForward();
    this.timeline[this.at].forceClose();
  }
  get currentEdge(): Vector2D | null {
    return this.timeline[this.at].currentEdge;
  }
  get otherEdge(): Vector2D | null {
    return this.timeline[this.at].otherEdge;
  }
  get reachable(): VectorSet {
    return this.timeline[this.at].reachable;
  }
  get activePoints(): VectorSet {
    return this.timeline[this.at].activePoints;
  }
  public toString(): string {
    return this.timeline[this.at].toString();
  }
  public isClosed(): boolean {
    return this.timeline[this.at].isClosed();
  }
  public selectPt(pt: Vector2D): PathShapeInstance[] {
    const shape = this.timeline[this.at];
    const possibleShapes = shape.selectPt(pt);
    const lastPt = shape.lastPt();
    if (possibleShapes[0].isEqual(shape) || (lastPt && pt.isEqual(lastPt))) {
      // return the same path if the shape was unchanged
      // a shape can be unchanged when an invalid point was
      // selected
      return [];
    }
    return possibleShapes;
  }
  public static templateString(t: Template) {
    const template = new Template(
      t.base,
      t.elements.slice(0, t.base),
      t.resolution
    );
    let shape = new PathShapeInstance(
      template,
      [],
      new VectorSet(),
      null,
      null,
      []
    );
    const basePts = t.basePoints.toArray();
    shape = shape.selectPt(basePts[0])[0];
    do {
      shape = shape.selectPt(shape.reachable.first())[0];
    } while (shape.reachable.size > 0);
    shape.actions.push(PathAction.Close());
    return shape.toString();
  }
}
export interface PathShapeInstanceReviver {
  a: object[];
  r: Array<[number, number, number]>;
  ce: { x: number; y: number } | null;
  oe: { x: number; y: number } | null;
  pts: Array<{ x: number; y: number }>;
}
class PathShapeInstance {
  public readonly template: Template;
  public actions: PathAction[];
  public reachable: VectorSet;
  public currentEdge: Vector2D | null;
  public otherEdge: Vector2D | null;
  public selectedPoints: Vector2D[];
  public activePoints: VectorSet;
  constructor(
    t: Template,
    a: PathAction[],
    reaches: VectorSet,
    curEdge: Vector2D | null,
    otherEdge: Vector2D | null,
    pts: Vector2D[]
  ) {
    this.template = t;
    this.actions = a;
    this.reachable = reaches;
    this.currentEdge = curEdge;
    this.otherEdge = otherEdge;
    this.selectedPoints = pts;
    if (curEdge && otherEdge) {
      this.activePoints = this.calcActivePts()
        .delete(curEdge)
        .delete(otherEdge);
    } else {
      this.activePoints = new VectorSet();
    }
  }
  public toJSON() {
    return {
      a: this.actions.map(a => a.toJSON()),
      r: this.reachable.toJSON(),
      ce: this.currentEdge ? this.currentEdge.toJSON() : null,
      oe: this.otherEdge ? this.otherEdge.toJSON() : null,
      pts: this.selectedPoints.slice(0).map(v => v.toJSON())
    };
  }
  public static revive(o: PathShapeInstanceReviver, t: Template) {
    const ce = o.ce ? Vector2D.revive(o.ce) : null;
    const oe = o.oe ? Vector2D.revive(o.oe) : null;
    const actions = o.a.map(PathAction.revive).filter(a => a.element !== null);
    try {
      const result = new PathShapeInstance(
        t,
        actions,
        VectorSet.revive(o.r, () => null),
        ce,
        oe,
        o.pts.map(Vector2D.revive)
      );
      return result;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(
        "Error trying to revive PathShapeInstace with Object:",
        o,
        "AND TEMPLATE",
        t
      );
      return null;
    }
  }
  public static empty(t: Template): PathShapeInstance {
    return new PathShapeInstance(t, [], t.points, null, null, []);
  }
  public isEqual(ps: PathShapeInstance): boolean {
    if (this.actions.length !== ps.actions.length) {
      return false;
    }
    for (let i = 0; i < this.actions.length; i++) {
      if (!this.actions[i].isEqual(ps.actions[i])) {
        return false;
      }
    }
    return true;
  }
  public forceClose(): void {
    this.actions.push(PathAction.Close());
  }
  public isClosed(): boolean {
    // a path shape is closed if it has more than two points and the last
    // point matches the first point OR
    // if the last action is the close (Z) action
    const totalPts = this.selectedPoints.length;
    if (this.actions.length === 0 || totalPts < 3) {
      return false;
    }
    const lastAction = this.actions[this.actions.length - 1];
    const lastPt = this.selectedPoints[totalPts - 1];
    return this.selectedPoints[0].isEqual(lastPt) || lastAction.isClosed();
  }

  private invertActions(): PathAction[] {
    const result: PathAction[] = [];
    let prevPt = this.selectedPoints[this.selectedPoints.length - 1];
    for (let i = this.selectedPoints.length - 1; i > 0; i--) {
      const pt = this.selectedPoints[i - 1];
      const reversed = PathAction.Reverse(pt, prevPt, this.actions[i]);
      if (reversed) {
        result.push(reversed);
        prevPt = pt;
      }
    }
    if (!this.currentEdge) {
      throw new Error(
        `Trying to invert actions but the Shape has no currentEdge yet defined`
      );
    }
    result.unshift(PathAction.Move(this.currentEdge.x, this.currentEdge.y));
    return result;
  }
  public selectPt(pt: Vector2D): PathShapeInstance[] {
    let a: PathAction[] = []; // actions to reach this point
    let reaches: VectorSet;
    let cur = this.currentEdge;
    let other = this.otherEdge;
    const points = this.selectedPoints.slice();
    let actions = this.actions; // actions already done up until now
    if (this.currentEdge === null) {
      // ^ the path has no points yet
      a.push(PathAction.Move(pt.x, pt.y));
      reaches = this.template.getReachable(pt);
    } else {
      // the path already has points
      // check if pt is reachable from the currentEdge
      // (the reachable set contains all points reachable from current edge
      // and other edge)
      cur = this.currentEdge;
      const isReachableByCurEdge = this.template.getReachable(cur).has(pt);
      if (other === null) {
        // ^ path with only one point yet
        // the other edge is initialized here
        // in adding the 2nd point to the path
        // as the current edge
        other = this.currentEdge;
      } else if (!isReachableByCurEdge) {
        // the point is not reachable by the current edge
        const isReachableByOtherEdge = this.template
          .getReachable(other)
          .has(pt);
        if (!isReachableByOtherEdge) {
          // the point is not reachable at all, return the current shape
          return [this];
        }
        // the point is being connected from the other edge
        // invert the actions list and switch the edges
        points.reverse();
        actions = this.invertActions();
        // swap currentEdge with otherEdge
        // to make it the currentEdge
        cur = other;
        other = this.currentEdge;
      }
      a = PathAction.Select(this.template, cur, pt);
      reaches = this.template.getReachableFrom(pt, other, points);
      // ^ calculate the reachable points from the new edges
      // and remove all previously selected points from the reachable set
    }
    points.push(pt);
    const activePts = this.activePoints.dup();
    return a.map(action => {
      const acts = actions.slice();
      acts.push(action);
      const newShape = new PathShapeInstance(
        this.template,
        acts,
        reaches,
        pt,
        other,
        points
      );
      newShape.activePoints = newShape.activePoints.append(activePts);
      return newShape;
    });
  }
  public lastPt(): Vector2D | null {
    if (this.selectedPoints.length === 0) {
      return null;
    }
    return this.selectedPoints[this.selectedPoints.length - 1];
  }
  public toString() {
    let result = "";
    for (let i = 0; i < this.actions.length; i++) {
      result += this.actions[i].toString();
    }
    return result;
  }

  public calcActivePts(): VectorSet {
    const lastAction = this.actions[this.actions.length - 1];
    if (!lastAction) {
      return new VectorSet();
    }
    if (lastAction.actionType === ActionType.Move) {
      const [x, y] = lastAction.args;
      if (typeof x === "number" && typeof y === "number") {
        return new VectorSet([new Vector2D(x, y)]);
      } else {
        throw new Error(
          "Cannot calc the active points for the last action performed: Move position not found"
        );
      }
    }
    if (!lastAction.element) {
      throw new Error(
        "Cannot calc the active points for the last action performed: no element found"
      );
    }
    const pts = this.template.elementPoints(lastAction.element);
    if (lastAction.actionType === ActionType.Arc) {
      const pt1 = this.selectedPoints[this.selectedPoints.length - 2];
      const pt2 = this.selectedPoints[this.selectedPoints.length - 1];
      const ellipse = lastAction.element;
      const longArc = lastAction.args[3];
      const sweep = lastAction.args[4];
      const angle1 = ellipse.arcEllipse(pt1);
      const angle2 = ellipse.arcEllipse(pt2);
      const PI2 = Math.PI * 2;
      const diff = PI2 - angle1 - (PI2 - angle2);
      const absDiff = Math.abs(diff);
      const isSmallerPi = absDiff < Math.PI;
      let longPoints = longArc;
      if (absDiff === Math.PI) {
        if (diff < 0) {
          longPoints = !longPoints;
        }
      } else if (diff > 0 && !isSmallerPi && sweep) {
        // diff > 0 means that angle1 is ahead of angle2 CW
        longPoints = true;
      }
      if (longPoints) {
        return pts.filter(pt => !ellipse.ellipseIsBetween(pt1, pt2, pt));
      } else {
        return pts.filter(pt => ellipse.ellipseIsBetween(pt1, pt2, pt));
      }
    } else {
      // is a line
      const pt1 = this.selectedPoints[this.selectedPoints.length - 1];
      const pt2 = this.selectedPoints[this.selectedPoints.length - 2];
      const result = pts.filter(pt => Vector2D.isBetween(pt1, pt2, pt));
      return result;
    }
  }
}
export interface PathReviver {
  ss: number;
  shapes: PathShapeReviver[];
  svgs: string[];
  f: number[];
  h: number[];
  a: string[];
}
// A Path is a shape being edited, it holds the template and shapes done with it
export class Path {
  public readonly template: Template;
  private selectedShape: number;
  // ^ selectedShape always points to the current shape being edited
  // there is always a current shape in the svgs and shapes list
  private shapes: PathShape[];
  private svgs: string[];
  // ^ one string per shape in "shapes"
  private fills: number[];
  // ^ one fill id per shape in "shapes"
  private hidden: Set<number>;
  // ^ numbers of the shapes (in "shapes") that are hidden
  public ambiguities: string[];
  private templateSvg: string;
  // private activePoints: VectorSet;
  constructor(t: Template) {
    this.template = t;
    this.selectedShape = 0;
    this.shapes = [];
    this.svgs = [];
    this.fills = [];
    this.hidden = new Set();
    this.ambiguities = [];
    this.templateSvg = PathShape.templateString(t);
    this.addShape(new PathShape(t));
  }
  public toJSON() {
    return {
      ss: this.selectedShape,
      shapes: this.shapes.map(s => s.toJSON()),
      svgs: this.svgs.slice(0),
      f: this.fills.slice(0),
      h: [...this.hidden.values()],
      a: this.ambiguities.slice(0)
    };
  }
  public static revive(o: PathReviver, t: Template) {
    const result = new Path(t);
    result.selectedShape = o.ss;
    result.shapes = o.shapes.map(s => PathShape.revive(s, t));
    result.svgs = o.svgs;
    result.fills = o.f;
    result.hidden = new Set(o.h);
    result.ambiguities = o.a;
    return result;
  }
  public static FullSquare(fillId: number, t: Template): Path {
    const p = new Path(t);
    p.svgs = [p.templateSvg, ""];
    p.selectedShape = 1;
    p.fills = [fillId];
    return p;
  }
  get fillIds(): number[] {
    return this.fills;
  }
  get numVisibleShapes(): number {
    return this.svgs.length - this.hidden.size - 1;
  }
  // toggleVisibility returns the new visible state
  public toggleVisibility(shapeIndex: number): boolean {
    const isHidden = this.hidden.has(shapeIndex);
    if (isHidden) {
      this.hidden.delete(shapeIndex);
    } else {
      this.hidden.add(shapeIndex);
    }
    return !isHidden;
  }
  public nearestActivePt(x: number, y: number): Vector2D | undefined {
    const maxR = this.template.resolution / 2;
    const pts = this.getSelectedShape().reachable.toArray();
    if (this.currentEdge) {
      pts.push(this.currentEdge);
    }
    if (this.otherEdge) {
      pts.push(this.otherEdge);
    }
    for (let r = 1; r < maxR; r++) {
      const radius = r * r;
      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        const circle = Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2);
        if (circle <= radius) {
          // point is in radius, return it
          return pt;
        }
      }
    }
    return undefined;
  }
  get currentEdge(): Vector2D | null {
    return this.getSelectedShape().currentEdge;
  }
  get otherEdge(): Vector2D | null {
    return this.getSelectedShape().otherEdge;
  }
  // addShape returns the index of the shape on the shapes array
  private addShape(s: PathShape): number {
    this.shapes.push(s);
    this.svgs.push("");
    this.selectedShape = this.shapes.length - 1;
    this.ambiguities = [];
    return this.shapes.length - 1;
  }
  public changeShape(shapeIndex: number) {
    this.selectedShape = shapeIndex; // FIXME: TEST THIS
    const shape = this.getSelectedShape();
    shape.reverseTimelineBy(shape.at - 1);
    this.svgs[this.selectedShape] = shape.toString();
  }
  public removeShape(shapeIndex: number) {
    if (shapeIndex === -1) {
      this.discardCurrent();
    } else {
      this.hidden.delete(shapeIndex);
      this.fills.splice(shapeIndex, 1);
      this.svgs.splice(shapeIndex, 1);
      this.shapes.splice(shapeIndex, 1);
      this.selectedShape = this.selectedShape - 1;
    }
  }
  public curShapeIndex(): number {
    return this.selectedShape;
  }
  private getSelectedShape(): PathShape {
    return this.shapes[this.selectedShape];
  }
  public getReachable(): VectorSet {
    return this.getSelectedShape().reachable;
  }
  public getSelectedPts(): VectorSet {
    return this.shapes[this.selectedShape].activePoints;
  }
  public reverseTo(i: number): void {
    const shape = this.getSelectedShape();
    shape.reverseTimelineBy(i);
    this.svgs[this.selectedShape] = shape.toString();
  }
  public discardCurrent(): void {
    this.svgs[this.shapes.length - 1] = "";
    this.shapes[this.shapes.length - 1] = new PathShape(
      this.shapes[this.shapes.length - 1].template
    );
    this.ambiguities = [];
  }
  // selectPoint returns true when the path changed
  // returns false when it could not select the provided point
  public selectPoint(pt: Vector2D, index?: number): boolean {
    const shape = this.getSelectedShape();
    const possibleShapes = shape.selectPt(pt);
    if (!possibleShapes || possibleShapes.length === 0) {
      // no path to point
      return false;
    }
    if (possibleShapes.length > 1) {
      // ambiguities, set them and return the path
      this.ambiguities = possibleShapes.map(s => s.toString());
    } else if (this.ambiguities.length > 0) {
      // clear the previous ambiguities if there were any
      this.ambiguities.splice(0);
    }
    if (index) {
      // if an index is provided:
      // instead of selecting the first shape, chose the one
      // at the intended index
      return this.updateShape(possibleShapes[index]);
    }
    return this.updateShape(possibleShapes[0]);
  }
  // updateShape, updates the svg string and shape obj,
  // and returns true if the Path was changed
  private updateShape(s: PathShapeInstance): boolean {
    let changed = false;
    const newStr = s.toString();
    // update the svg string
    if (newStr !== this.svgs[this.selectedShape]) {
      this.shapes[this.selectedShape].advanceTimelineWith(s);
      this.svgs[this.selectedShape] = newStr;
      changed = true;
    }
    // check if shape is closed
    // if closed then add a new shape and set it as current
    if (s.isClosed()) {
      if (this.selectedShape !== this.shapes.length - 1) {
        this.selectedShape = this.shapes.length - 1;
        return true;
      }
      this.addShape(new PathShape(this.template));
      changed = true;
    }
    return changed;
  }
  public closeWithPt(pt: Vector2D, fillId: number): Path {
    const isChanged = this.selectPoint(pt);
    if (!isChanged) {
      // forcefully closes (with the Z action)
      this.closeAsIs();
      // update the d string with the close action
      this.svgs[this.selectedShape] = this.shapes[
        this.selectedShape
      ].toString();
      // update the selectedShape to be a new working shape
      if (this.selectedShape !== this.shapes.length - 1) {
        this.selectedShape = this.shapes.length - 1;
        return this;
      }
      this.addShape(new PathShape(this.template));
    }
    this.fills.push(fillId);
    return this;
  }
  private closeAsIs(): void {
    this.getSelectedShape().forceClose();
  }
  public solveAmbiguity(num: number) {
    if (num >= this.ambiguities.length) {
      throw new Error("Ambiguity chosen is out of range");
    }
    // get the last point selected in the current shape
    const shape = this.getSelectedShape();
    const pt = shape.timeline[shape.at].lastPt();
    // revert ambituity
    if (pt) {
      shape.reverseTimelineBy(shape.at - 1);
      // solve it by providing num as the index to selectPoint
      this.selectPoint(pt, num);
    }
  }
  public getVisibleShapes(): string[] {
    const result: string[] = [];
    for (let i = 0; i < this.svgs.length; i++) {
      if (!this.hidden.has(i)) {
        result.push(this.svgs[i]);
      }
    }
    return result;
  }
  public getSvgShapes(): string[] {
    const result: string[] = [];
    for (let i = 0; i < this.svgs.length; i++) {
      if (!this.hidden.has(i) && this.svgs[i].length > 0) {
        result.push(this.svgs[i]);
      }
    }
    return result;
  }
  // set fills in the editor
  // returns a Map<svg path d string, fillId>
  public changeFills(fills: number[]): Map<string, number> {
    // mind the hidden shapes
    // repeat the first fill if not enough for all shapes
    // TODO: make sure hidden shapes maintain their current colors
    this.fills = new Array(this.fills.length - fills.length)
      .fill(fills[0])
      .concat(fills);
    /*
		return (new Map(
			this.svgs.map((d, i) => [d, this.fills[i]] as [string, number])
		));
		*/
    return this.getFillMap();
  }
  public getFillMap(): Map<string, number> {
    const mapped: Array<[string, number]> = [];
    const emptyStr = "";
    let d;
    for (let i = 0; i < this.svgs.length; i++) {
      d = this.svgs[i];
      // ignore hidden d's and the current working d
      if (!this.hidden.has(i) && d !== emptyStr && this.selectedShape !== i) {
        mapped.push([d, this.fills[i]]);
      }
    }
    return new Map(mapped);
  }
  // updates the path to have the fillIds matching the provided map
  // fill: Map where the key is the shape path 'd' attribute
  // and value is the fill id
  public updateWithFill(fillMap: Map<string, number>): Path {
    for (let i = 0; i < this.svgs.length; i++) {
      const fill = fillMap.get(this.svgs[i]);
      if (fill) {
        this.fills[i] = fill;
      }
    }
    return this;
  }
  public canBeUsedWith(t: Template): boolean {
    return this.template.isBaseEqual(t);
  }
  public getShapeInstances(): string[] {
    const result: string[] = [];
    const shapes = this.getSelectedShape().timeline;
    for (let i = 0; i < shapes.length; i++) {
      result.push(shapes[i].toString());
    }
    return result;
  }
  public getSelectedInstance(): number {
    return this.getSelectedShape().at;
  }
  public getSelectedFills(): Map<string, number> {
    const result = new Map();
    for (let i = 0; i < this.fills.length; i++) {
      result.set(this.svgs[i], this.fillIds[i]);
    }
    return result;
  }
  public svgForFillId(fillId: number) {
    const index = this.fills.indexOf(fillId);
    if (index >= 0) {
      return this.svgs[index];
    } else {
      return null;
    }
  }
  public *figures(): IterableIterator<IPathFigure> {
    for (let i = 0; i < this.fills.length; i++) {
      yield {
        d: this.svgs[i],
        fillId: this.fills[i],
        isHidden: this.hidden.has(i)
      };
    }
  }
}
