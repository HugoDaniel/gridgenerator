import { Modification } from "./modification";
import {
  ISerializable,
  IWithState,
  FunctionPropertyNames,
  FunctionProperties
} from "./types";

interface IFatReviver {
  v: number;
  m: string[];
  pT: number;
  mT: number;
  s: string;
  i: string;
}

export class Fat<S extends ISerializable<S>, A extends IWithState<S>>
  implements ISerializable<Fat<S, A>> {
  private version: number;
  private mods: Array<Modification<A>>;
  private prevTime: number;
  private minTime: number;
  private actions: A;
  private initialState: string;
  private actionNames: Set<FunctionPropertyNames<A>>;
  public functionArgsReviver: (
    n: FunctionPropertyNames<A>,
    a: IArguments
  ) => IArguments;
  public stateReviver: (serialized: string) => S;
  private constructor(
    actions: A,
    initialState?: string,
    version: number = 0,
    mods: Array<Modification<A>> = [],
    prevTime: number = 0,
    minTime: number = 0
  ) {
    this.version = version;
    this.mods = mods;
    this.prevTime = prevTime;
    this.minTime = minTime;
    this.actions = actions;
    if (initialState) {
      this.initialState = initialState;
    } else {
      this.initialState = actions.state.toString();
    }
    const functionNames = Object.keys(actions).filter(
      name => typeof actions[name] === "function"
    ) as Array<FunctionPropertyNames<A>>;
    this.actionNames = new Set(functionNames);
    // By default assume that all args can be parsed with simple JSON.parse
    this.functionArgsReviver = (_, a) => a;
    // By default assume that state can be parsed with a simple JSON.parse
    this.stateReviver = JSON.parse;
  }
  get current(): Readonly<S> {
    return this.actions.state;
  }
  get mostRecentVersion(): number {
    return this.mods.length;
  }
  public async mod(name: FunctionPropertyNames<A>, args: IArguments) {
    // check the deltaT
    const now = Date.now();
    const deltaT = now - this.prevTime;
    this.prevTime = now;
    // to avoid filling the mods array
    // if deltaT is bellow min update the previous action if its the same
    if (deltaT < this.minTime) {
      const lastMod = this.mods[this.mods.length - 1];
      if (!lastMod) {
        return;
      }
      const lastModName = lastMod.actionName;
      if (lastModName === name) {
        // update it
        this.mods[this.mods.length - 1] = new Modification(
          lastMod.version,
          lastMod.deltaT + deltaT,
          name,
          args
        );
        return;
      }
    } // otherwise do the normal behaviour
    this.version++;
    this.mods.push(new Modification(this.version, deltaT, name, args));
  }
  public restoreTo(version: number, startingState?: string) {
    const mods = this.mods;
    const maxVersion = this.mostRecentVersion;
    if (version > maxVersion) {
      // tslint:disable-next-line:no-console
      console.warn(
        `Unable to restore to version ${version}; maximum available is ${maxVersion}.`
      );
      return;
    }
    // Set the initial state:
    const actions = this.actions;
    actions.state = this.actions.state.fromString(
      startingState || this.initialState
    );
    if (version === 0) {
      // Just restore to the initial state, apply no mods
      return;
    }
    // Apply the mods
    for (let i = 1; i <= version; i++) {
      const mod = mods[i - 1];
      if (!mod.args) {
        actions[mod.actionName]();
      } else {
        actions[mod.actionName](...mod.args);
      }
    }
  }
  public prev(
    actionsToReplay?: Set<FunctionPropertyNames<A>>,
    startingState?: string
  ) {
    const mods = this.mods;
    const version = this.version;
    const replaySet = actionsToReplay || this.actionNames;
    // find previous version:
    let prev = 0;
    for (let v = 0; v < version; v++) {
      if (replaySet.has(mods[v].actionName)) {
        prev = v;
      }
    }
    this.restoreTo(prev, startingState);
  }
  public next(
    actionsToReplay?: Set<FunctionPropertyNames<A>>,
    startingState?: string
  ) {
    const mods = this.mods;
    const version = this.version;
    const replaySet = actionsToReplay || this.actionNames;
    // find next version:
    let next = this.version + 1;
    let found = false;
    for (let v = next; v < version; v++) {
      if (replaySet.has(mods[v].actionName)) {
        found = true;
        next = v;
        break;
      }
    }
    if (!found) {
      next = version;
    }
    this.restoreTo(next, startingState);
  }
  /** Serializes the current state to a string */
  public toString(): string {
    const reviver: IFatReviver = {
      v: this.version,
      m: this.mods.map(m => m.toString()),
      pT: this.prevTime,
      mT: this.minTime,
      s: this.actions.state.toString(),
      i: this.initialState
    };
    return JSON.stringify(reviver);
  }
  public fromString(serialized: string): Fat<S, A> {
    const revived: IFatReviver = JSON.parse(serialized);
    // Duplicate the actions object:
    let actions: A;
    if (this.actions.hasOwnProperty) {
      actions = Object.assign({}, this.actions);
    } else {
      actions = Object.assign(Object.create(null), this.actions);
    }
    actions.state = actions.state.fromString(revived.s);
    // Parse the mods array
    const mods = revived.m.map(modification =>
      Modification.fromString(modification, this.functionArgsReviver)
    );
    // Our final Fat state:
    const finalFat: Fat<S, A> = new Fat(
      actions,
      revived.i,
      revived.v,
      mods,
      revived.pT,
      revived.mT
    );
    finalFat.functionArgsReviver = this.functionArgsReviver;
    return finalFat;
  }

  public static init<U extends IWithState<ISerializable<U["state"]>>>(
    second: U,
    functionArgsReviver?: (
      n: FunctionPropertyNames<U>,
      a: IArguments
    ) => IArguments
  ): Fat<U["state"], U> & FunctionProperties<U> {
    const result = new Fat(second) as Fat<U["state"], U> & U;
    // Setup the revivers if they are present
    if (functionArgsReviver) {
      result.functionArgsReviver = functionArgsReviver;
    }
    // Recreate each function in U so they create a Modification when called;
    for (const id in second) {
      if (!result.hasOwnProperty(id) && typeof second[id] === "function") {
        const funcName: FunctionPropertyNames<U> = id as any;
        // tslint:disable-next-line:only-arrow-functions
        (result as any)[id] = function() {
          result.mod(funcName, arguments);
          return result.actions[id].apply(result.actions, arguments);
        };
      }
    }
    return result;
  }
}
