export {
  Data,
  create,
  current,
  mostRecentVersion,
  mod,
  restoreTo,
  prev,
  next,
  serialize
};
import * as Modification from "./modification";
import { IWithState, FunctionPropertyNames, FunctionProperties } from "./types";

//#region Private Attributes
const version = Symbol("version");
const mods = Symbol("mods");
const prevTime = Symbol("prevTime");
const minTime = Symbol("minTime");
const actions = Symbol("actions");
const initialState = Symbol("initialState");
const actionNames = Symbol("actionNames");
const serializer = Symbol("serializer");
const deserializer = Symbol("deserializer");
//#endregion
interface Data<S, A extends IWithState<S>> {
  [version]: number;
  [mods]: Array<Modification.Data<A>>;
  [prevTime]: number;
  [minTime]: number;
  [actions]: A;
  [initialState]: string;
  [actionNames]: Set<FunctionPropertyNames<A>>;
  [serializer]: (state: S) => string;
  [deserializer]: (serialized: string) => S;
}

function init<S, A extends IWithState<S>>(
  _actions: A,
  _initialState?: string,
  _argsReviver: (n: FunctionPropertyNames<A>, a: IArguments) => IArguments = (
    _,
    a
  ) => a,
  _serializer: (state: S) => string = JSON.stringify,
  _deserializer: (serialized: string) => S = JSON.parse,
  _version: number = 0,
  _mods: Array<Modification.Data<A>> = [],
  _prevTime: number = 0,
  _minTime: number = 0
): Data<S, A> {
  const functionNames = Object.keys(actions).filter(
    name => typeof _actions[name] === "function"
  ) as Array<FunctionPropertyNames<A>>;

  return {
    [actionNames]: new Set(functionNames),
    [version]: _version,
    [mods]: _mods,
    [prevTime]: _prevTime,
    [minTime]: _minTime,
    [actions]: _actions,
    [initialState]: _initialState || _serializer(_actions.state),
    [serializer]: _serializer,
    [deserializer]: _deserializer
  };
}
function create<S, U extends IWithState<S>>(
  _actions: U,
  _serializer: (state: S) => string = JSON.stringify,
  _deserializer: (serialized: string) => S = JSON.parse,
  _functionArgsReviver?: (
    n: FunctionPropertyNames<U>,
    a: IArguments
  ) => IArguments
): Data<S, U> & FunctionProperties<U> {
  const result = init<S, U>(
    _actions,
    _serializer(_actions.state),
    _functionArgsReviver,
    _serializer,
    _deserializer
  );
  // Recreate each function in U so they create a Modification when called;
  for (const id in _actions) {
    if (!result.hasOwnProperty(id) && typeof _actions[id] === "function") {
      const funcName: FunctionPropertyNames<U> = id as any;
      // tslint:disable-next-line:only-arrow-functions
      (result as any)[id] = function() {
        mod(result, funcName, arguments);
        return result[actions][id].apply(result[actions], arguments);
      };
    }
  }
  return result as Data<S, U> & FunctionProperties<U>;
}

function current<S, A extends IWithState<S>>(
  fatstate: Data<S, A>
): Readonly<S> {
  return fatstate[actions].state;
}
function mostRecentVersion<S, A extends IWithState<S>>(
  fatstate: Data<S, A>
): number {
  return fatstate[mods].length;
}

async function mod<S, A extends IWithState<S>>(
  fatstate: Data<S, A>,
  name: FunctionPropertyNames<A>,
  args: IArguments
) {
  const modsArray = fatstate[mods];
  // check the deltaT
  const now = Date.now();
  const deltaT = now - fatstate[prevTime];
  fatstate[prevTime] = now;
  // to avoid filling the mods array
  // if deltaT is bellow min update the previous action if its the same
  if (deltaT < fatstate[minTime]) {
    const lastMod = modsArray[modsArray.length - 1];
    if (!lastMod) {
      return;
    }
    const lastModName = lastMod.actionName;
    if (lastModName === name) {
      // update it
      modsArray[modsArray.length - 1] = Modification.create(
        lastMod.version,
        lastMod.deltaT + deltaT,
        name,
        args
      );
      return;
    }
  } // otherwise do the normal behaviour
  fatstate[version]++;
  modsArray.push(Modification.create(fatstate[version], deltaT, name, args));
}

function restoreTo<S, A extends IWithState<S>>(
  fatstate: Data<S, A>,
  _version: number,
  _startingState?: string
) {
  const modsArray = fatstate[mods];
  const maxVersion = mostRecentVersion(fatstate);
  if (_version > maxVersion) {
    // tslint:disable-next-line:no-console
    console.warn(
      `Unable to restore to version ${_version}; maximum available is ${maxVersion}.`
    );
    return;
  }
  // Set the initial state:
  const stateActions = fatstate[actions];
  stateActions.state = fatstate[deserializer](
    _startingState || fatstate[initialState]
  );
  if (_version === 0) {
    // Just restore to the initial state, apply no mods
    return;
  }
  // Apply the mods
  for (let i = 1; i <= _version; i++) {
    const mod = modsArray[i - 1];
    if (!mod.args) {
      stateActions[mod.actionName]();
    } else {
      stateActions[mod.actionName](...mod.args);
    }
  }
}

function prev<S, A extends IWithState<S>>(
  fatstate: Data<S, A>,
  actionsToReplay?: Set<FunctionPropertyNames<A>>,
  startingState?: string
) {
  const modsArray = fatstate[mods];
  const stateVersion = fatstate[version];
  const replaySet = actionsToReplay || fatstate[actionNames];
  // find previous version:
  let prev = 0;
  for (let v = 0; v < stateVersion; v++) {
    if (replaySet.has(modsArray[v].actionName)) {
      prev = v;
    }
  }
  restoreTo(fatstate, prev, startingState);
}

function next<S, A extends IWithState<S>>(
  fatstate: Data<S, A>,
  actionsToReplay?: Set<FunctionPropertyNames<A>>,
  startingState?: string
) {
  const modsArray = fatstate[mods];
  const stateVersion = fatstate[version];
  const replaySet = actionsToReplay || fatstate[actionNames];
  // find next version:
  let next = stateVersion + 1;
  let found = false;
  for (let v = next; v < stateVersion; v++) {
    if (replaySet.has(modsArray[v].actionName)) {
      found = true;
      next = v;
      break;
    }
  }
  if (!found) {
    next = stateVersion;
  }
  restoreTo(fatstate, next, startingState);
}

interface IDataReviver {
  v: number;
  m: string[];
  pT: number;
  mT: number;
  s: string;
  i: string;
}

function serialize<S, A extends IWithState<S>>(fatstate: Data<S, A>): string {
  const reviver: IDataReviver = {
    v: fatstate[version],
    m: fatstate[mods].map(Modification.serialize),
    pT: fatstate[prevTime],
    mT: fatstate[minTime],
    s: fatstate[serializer](fatstate[actions].state),
    i: fatstate[initialState]
  };
  return JSON.stringify(reviver);
}

/* TODO:
function deserialize<S, A extends IWithState<S>>(
  serialized: string
): Data<S, A> {
  const revived: IDataReviver = JSON.parse(serialized);
  // Duplicate the actions object:
  let actions: A;
  if (this.actions.hasOwnProperty) {
    actions = Object.assign({}, this.actions);
  } else {
    actions = Object.assign(Object.create(null), this.actions);
  }
  actions.state = actions.state.deserialize(revived.s);
  // Parse the mods array
  const mods = revived.m.map(modification =>
    Modification.deserialize(modification, this.functionArgsReviver)
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
*/

/*
export class Fat<S extends ISerializable<S>, A extends IWithState<S>>
  implements ISerializable<Fat<S, A>> {
  private version: number;
  private mods: Array<Modification.Data<A>>;
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
    mods: Array<Modification.Data<A>> = [],
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
        this.mods[this.mods.length - 1] = Modification.create(
          lastMod.version,
          lastMod.deltaT + deltaT,
          name,
          args
        );
        return;
      }
    } // otherwise do the normal behaviour
    this.version++;
    this.mods.push(Modification.create(this.version, deltaT, name, args));
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
    actions.state = this.actions.state.deserialize(
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
  public serialize(): string {
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
  public deserialize(serialized: string): Fat<S, A> {
    const revived: IFatReviver = JSON.parse(serialized);
    // Duplicate the actions object:
    let actions: A;
    if (this.actions.hasOwnProperty) {
      actions = Object.assign({}, this.actions);
    } else {
      actions = Object.assign(Object.create(null), this.actions);
    }
    actions.state = actions.state.deserialize(revived.s);
    // Parse the mods array
    const mods = revived.m.map(modification =>
      Modification.deserialize(modification, this.functionArgsReviver)
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
*/
