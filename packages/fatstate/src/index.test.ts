// tslint:disable:max-classes-per-file
// tslint:disable:interface-name
// tslint:disable:member-access
import { should } from "fuse-test-runner";
import * as Fat from "./index";

class State {
  public total: number[];
  constructor(t: number[] = []) {
    this.total = t;
  }
  public result(r: number) {
    this.total.push(r);
  }
  public withResult(f: (arg: number) => number) {
    this.total.push(f(this.total[this.total.length - 1]));
  }
  public serialize(): string {
    return JSON.stringify(this.total);
  }
  public deserialize(serialized: string): State {
    return new State(JSON.parse(serialized));
  }
}
interface IActionsT {
  state: State;
  add(x: number, y: number): void;
  sub(x: number, y: number): void;
  mul10(): void;
}
const actions: IActionsT = {
  state: new State(),
  add(x: number, y: number) {
    this.state.result(x + y);
  },
  sub(x: number, y: number) {
    this.state.result(x - y);
  },
  mul10() {
    this.state.withResult(r => r * 10);
  }
};

export class IndexTest {
  "Fat.init() creates a new Fat state"() {
    const fat = Fat.create(actions);
    should(fat.add).beOkay();
    should(fat.sub).beOkay();
    should(fat.mul10).beOkay();
    should(Fat.current(fat).total).beOkay();
    should(Fat.current(fat).total.length).equal(0);
  }
  "Actions can modify state"() {
    actions.state = new State();
    const fat = Fat.create(actions);
    fat.add(10, 20);
    should(Fat.current(fat).total.length).equal(1);
    should(Fat.current(fat).total[0]).equal(30);
    fat.sub(30, 10);
    should(Fat.current(fat).total.length).equal(2);
    should(Fat.current(fat).total[0]).equal(30);
    should(Fat.current(fat).total[1]).equal(20);
  }
  "Can restore to any given previous state"() {
    actions.state = new State();
    const fat = Fat.create(actions);
    fat.add(10, 20); // fat.current.total[0] is 30;
    fat.sub(30, 10); // fat.current.total[1] is 20;
    fat.add(30, 10); // fat.current.total[2] is 40;
    should(Fat.current(fat).total).deepEqual([30, 20, 40]);
    Fat.restoreTo(fat, 1);
    should(Fat.current(fat).total).haveLength(1);
    should(Fat.current(fat).total[0]).equal(30);
    should(Fat.current(fat).total[1]).beUndefined();
  }
  "After moving to a previous state can restore to the most recent state"() {
    actions.state = new State();
    const fat = Fat.create(actions);
    fat.add(10, 20); // fat.current.total[0] is 30;
    fat.sub(30, 10); // fat.current.total[1] is 20;
    fat.add(30, 10); // fat.current.total[2] is 40;
    Fat.restoreTo(fat, 1);
    should(Fat.current(fat).total).haveLength(1);
    should(Fat.current(fat).total[0]).equal(30);
    Fat.restoreTo(fat, Fat.mostRecentVersion(fat));
    should(Fat.current(fat).total).deepEqual([30, 20, 40]);
  }
  "Can restore to the immediately previous state"() {
    actions.state = new State();
    const fat = Fat.create(actions);
    fat.add(10, 20); // fat.current.total[0] is 30;
    fat.sub(30, 10); // fat.current.total[1] is 20;
    fat.add(30, 10); // fat.current.total[2] is 40;
    Fat.prev(fat);
    should(Fat.current(fat).total).deepEqual([30, 20]);
  }
  "Can restore to the immediately next state"() {
    actions.state = new State();
    const fat = Fat.create(actions);
    fat.add(10, 20); // fat.current.total[0] is 30;
    fat.sub(30, 10); // fat.current.total[1] is 20;
    fat.add(30, 10); // fat.current.total[2] is 40;
    // To create a replay set of actions do these 2 lines:
    // const s: Set<FunctionPropertyNames<IActionsT>> = new Set();
    // s.add('sub');
    Fat.prev(fat);
    Fat.next(fat);
    should(Fat.current(fat).total).deepEqual([30, 20, 40]);
  }
  "Can serialize to/from string"() {
    actions.state = new State();
    const fat = Fat.create(actions);
    fat.add(10, 20); // fat.current.total[0] is 30;
    fat.sub(30, 10); // fat.current.total[1] is 20;
    fat.add(30, 10); // fat.current.total[2] is 40;
    should(Fat.current(fat).total).deepEqual([30, 20, 40]);
    const serialized = Fat.serialize(fat);
    should(serialized).haveLengthGreater(0);
    const newFat = Fat.deserialize(fat, serialized);
    should(newFat.current.total).deepEqual([30, 20, 40]);
  }
}
