import { Modification } from "./modification";
import { IWithState, FunctionPropertyNames, FunctionProperties } from "./types";

interface IFatReviver {
  v: number;
  m: string[];
  pT: number;
  mT: number;
  s: string;
  i: string;
}

export class Fat<S, A extends IWithState<S>> {
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
  public stateSerializer: (state: S) => string;
  public stateDeserializer: (serialized: string) => S;

  private constructor(
    actions: A,
    initialState: string,
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
    this.initialState = initialState;
    const functionNames = Object.keys(actions).filter(
      name => typeof actions[name] === "function"
    ) as Array<FunctionPropertyNames<A>>;
    this.actionNames = new Set(functionNames);
    // By default assume that all args can be parsed with simple JSON.parse
    this.functionArgsReviver = (_, a) => a;
    // By default assume that state can be parsed with a simple JSON.parse
    this.stateSerializer = JSON.stringify;
    this.stateDeserializer = JSON.parse;
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
    actions.state = this.stateDeserializer(startingState || this.initialState);
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
  public serialize(): string {
    const reviver: IFatReviver = {
      v: this.version,
      m: this.mods.map(m => m.serialize()),
      pT: this.prevTime,
      mT: this.minTime,
      s: this.stateSerializer(this.actions.state),
      i: this.initialState
    };
    return JSON.stringify(reviver);
  }
  public deserialize(serialized: string): Fat<S, A> & FunctionProperties<A> {
    const revived: IFatReviver = JSON.parse(serialized);
    const state = this.stateDeserializer(revived.s);
    // Parse the mods array
    const mods = revived.m.map(modification =>
      Modification.deserialize(modification, this.functionArgsReviver)
    );
    // Our final Fat state:
    const finalFat = Fat.init(
      Object.assign({}, this.actions),
      this.stateSerializer,
      this.stateDeserializer,
      this.functionArgsReviver
    );
    finalFat.mods = mods;
    finalFat.actions.state = state;
    return finalFat;
  }

  public static init<S, U extends IWithState<S>>(
    actions: U,
    serializer: (state: S) => string = JSON.stringify,
    deserializer: (serialized: string) => S = JSON.parse,
    functionArgsReviver?: (
      n: FunctionPropertyNames<U>,
      a: IArguments
    ) => IArguments
  ): Fat<S, U> & FunctionProperties<U> {
    const result = new Fat(actions, serializer(actions.state)) as Fat<S, U> & U;
    // Setup the revivers if they are present
    if (functionArgsReviver) {
      result.functionArgsReviver = functionArgsReviver;
    }
    // Recreate each function in U so they create a Modification when called;
    for (const id in actions) {
      if (!result.hasOwnProperty(id) && typeof actions[id] === "function") {
        const funcName: FunctionPropertyNames<U> = id as any;
        // tslint:disable-next-line:only-arrow-functions
        (result as any)[id] = function() {
          result.mod(funcName, arguments);
          return result.actions[id].apply(result.actions, arguments);
        };
      }
    }
    result.stateSerializer = serializer;
    result.stateDeserializer = deserializer;
    return result;
  }
}
