// tslint:disable:max-classes-per-file
// tslint:disable:interface-name
// tslint:disable:member-access
import { Fat } from "./index";
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
  public static serialize(s: State): string {
    return JSON.stringify(s.total);
  }
  public static deserialize(serialized: string): State {
    return new State(JSON.parse(serialized));
  }
}
interface IActionsT {
  state: State;
  add(x: number, y: number): void;
  sub(x: number, y: number): void;
  mul10(): void;
}
const createActions: () => IActionsT = () => ({
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
});
let fatState = Fat.init(createActions(), State.serialize, State.deserialize);
beforeEach(() => {
  fatState = Fat.init(createActions(), State.serialize, State.deserialize);
});

describe("Test1", () => {
  it("Fat.init() creates a new Fat state", () => {
    expect(fatState.add).toBeDefined();
    expect(fatState.sub).toBeDefined();
    expect(fatState.mul10).toBeDefined();
    expect(fatState.current.total).toBeDefined();
    expect(fatState.current.total.length).toEqual(0);
  });
  it("Actions can modify state", () => {
    fatState.add(10, 20);
    expect(fatState.current.total.length).toEqual(1);
    expect(fatState.current.total[0]).toEqual(30);
    fatState.sub(30, 10);
    expect(fatState.current.total.length).toEqual(2);
    expect(fatState.current.total[0]).toEqual(30);
    expect(fatState.current.total[1]).toEqual(20);
  });
  it("Can restore to any given previous state", () => {
    fatState.add(10, 20); // fatState.current.total[0] is 30;
    fatState.sub(30, 10); // fatState.current.total[1] is 20;
    fatState.add(30, 10); // fatState.current.total[2] is 40;
    expect(fatState.current.total).toEqual(
      expect.arrayContaining([30, 20, 40])
    );
    fatState.restoreTo(1);
    expect(fatState.current.total).toHaveLength(1);
    expect(fatState.current.total[0]).toEqual(30);
    expect(fatState.current.total[1]).toBeUndefined();
  });
  it("After moving to a previous state can restore to the most recent state", () => {
    fatState.add(10, 20); // fatState.current.total[0] is 30;
    fatState.sub(30, 10); // fatState.current.total[1] is 20;
    fatState.add(30, 10); // fatState.current.total[2] is 40;
    fatState.restoreTo(1);
    expect(fatState.current.total).toHaveLength(1);
    expect(fatState.current.total[0]).toEqual(30);
    fatState.restoreTo(fatState.mostRecentVersion);
    expect(fatState.current.total).toEqual(
      expect.arrayContaining([30, 20, 40])
    );
  });
  it("Can restore to the immediately previous state", () => {
    fatState.add(10, 20); // fatState.current.total[0] is 30;
    fatState.sub(30, 10); // fatState.current.total[1] is 20;
    fatState.add(30, 10); // fatState.current.total[2] is 40;
    fatState.prev();
    expect(fatState.current.total).toEqual(expect.arrayContaining([30, 20]));
  });
  it("Can restore to the immediately next state", () => {
    fatState.add(10, 20); // fatState.current.total[0] is 30;
    fatState.sub(30, 10); // fatState.current.total[1] is 20;
    fatState.add(30, 10); // fatState.current.total[2] is 40;
    // To create a replay set of actions do these 2 lines:
    // const s: Set<FunctionPropertyNames<IActionsT>> = new Set();
    // s.add('sub');
    fatState.prev();
    fatState.next();
    expect(fatState.current.total).toEqual(
      expect.arrayContaining([30, 20, 40])
    );
  });
  it("Can serialize to/from string", () => {
    fatState.add(10, 20); // fatState.current.total[0] is 30;
    fatState.sub(30, 10); // fatState.current.total[1] is 20;
    fatState.add(30, 10); // fatState.current.total[2] is 40;
    expect(fatState.current.total).toEqual(
      expect.arrayContaining([30, 20, 40])
    );
    const serialized = fatState.serialize();
    expect(serialized.length).toBeGreaterThan(0);
    const newFat = fatState.deserialize(serialized);
    expect(newFat.current.total).toEqual(expect.arrayContaining([30, 20, 40]));
    // can perform actions on it
    newFat.add(1, 2); // fatState.current.total[3] is 3;
    expect(newFat.current.total).toEqual(
      expect.arrayContaining([30, 20, 40, 3])
    );
    // actions on new state don't change the previous state
    expect(fatState.current.total).toEqual(
      expect.arrayContaining([30, 20, 40])
    );
  });
});
