export {
  Data,
  create,
  current,
  mostRecentVersion,
  restoreTo,
  prev,
  next,
  serialize,
  deserialize
};
import * as Modification from "./modification";
import { IWithState, FunctionPropertyNames, FunctionProperties } from "./types";

//#region Private Attributes
/** Current history version */
const _version = Symbol("version");
/** Modifications get tracked here */
const _mods = Symbol("mods");
/** The time when the last modification occured  */
const _prevTime = Symbol("prevTime");
/** If two modifications with the same name occur before minTime as elapsed
 * they are not stored as separate */
const _minTime = Symbol("minTime");
/** The object that contains the "state" attribute and all state manipulation functions */
const _actions = Symbol("actions");
/** A string that is used to restore the state to its initial representation */
const _initialState = Symbol("initialState");
/** Set of all the functions available on the "action" object */
const _actionNames = Symbol("actionNames");
/** A function that can convert the "actions" state into a string */
const _serializer = Symbol("serializer");
/** A function that can convert a string into the "actions" state */
const _deserializer = Symbol("deserializer");
/** A function that can convert the modifications function arguments to a string */
const _argsReviver = Symbol("argsReviver");
//#endregion

/** The object that keeps track of each state manipulation function */
interface Data<S, A extends IWithState<S>> {
  [_version]: number;
  [_mods]: Array<Modification.Data<A>>;
  [_prevTime]: number;
  [_minTime]: number;
  [_actions]: A;
  [_initialState]: string;
  [_actionNames]: Set<FunctionPropertyNames<A>>;
  [_serializer]: (state: S) => string;
  [_deserializer]: (serialized: string) => S;
  [_argsReviver]: (n: FunctionPropertyNames<A>, a: IArguments) => IArguments;
}

function init<S, A extends IWithState<S>>(
  actions: A,
  initialState?: string,
  argsReviver: (n: FunctionPropertyNames<A>, a: IArguments) => IArguments = (
    _,
    a
  ) => a,
  serializer: (state: S) => string = JSON.stringify,
  deserializer: (serialized: string) => S = JSON.parse,
  version: number = 0,
  mods: Array<Modification.Data<A>> = [],
  prevTime: number = 0,
  minTime: number = 0
): Data<S, A> {
  const functionNames = Object.keys(actions).filter(
    name => typeof actions[name] === "function"
  ) as Array<FunctionPropertyNames<A>>;

  return {
    [_actionNames]: new Set(functionNames),
    [_version]: version,
    [_mods]: mods,
    [_prevTime]: prevTime,
    [_minTime]: minTime,
    [_actions]: actions,
    [_initialState]: initialState || serializer(actions.state),
    [_serializer]: serializer,
    [_deserializer]: deserializer,
    [_argsReviver]: argsReviver
  };
}
/** Creates a new object that keeps track of each state manipulation function
 * @param actions The object that contains the "state" and all its manipulation functions
 * @param serializer A function that can convert the "state" on the actions param to a string
 * @param deserializer A function that can convert a sring to the "state" on the actions param
 * @param functionArgsReviver A function that can convert the modifications function arguments to a string
 * @returns An object that has all the functions of the "actions" object provided, but can keep track of their calls and do simple time-travel.
 */
function create<U extends IWithState<U["state"]>>(
  actions: U,
  serializer: (state: U["state"]) => string = JSON.stringify,
  deserializer: (serialized: string) => U["state"] = JSON.parse,
  functionArgsReviver?: (
    n: FunctionPropertyNames<U>,
    a: IArguments
  ) => IArguments
): Data<U["state"], U> & FunctionProperties<U> {
  const result = init<U["state"], U>(
    actions,
    serializer(actions.state),
    functionArgsReviver,
    serializer,
    deserializer
  );
  // Recreate each function in U so they create a Modification when called;
  for (const id in actions) {
    if (!result.hasOwnProperty(id) && typeof actions[id] === "function") {
      const funcName: FunctionPropertyNames<U> = id as any;
      // tslint:disable-next-line:only-arrow-functions
      (result as any)[id] = function() {
        mod(result, funcName, arguments);
        return result[_actions][id].apply(result[_actions], arguments);
      };
    }
  }
  return result as Data<U["state"], U> & FunctionProperties<U>;
}
/** The current state */
function current<S, A extends IWithState<S>>(
  fatstate: Data<S, A>
): Readonly<S> {
  return fatstate[_actions].state;
}
/** The number of the most recent version */
function mostRecentVersion<S, A extends IWithState<S>>(
  fatstate: Data<S, A>
): number {
  return fatstate[_mods].length;
}
/** Tracks a modification on the state
 * @param fatstate The object that can keep track of the state modifications
 * @param name A string that must be a name belonging to a function on the "actions" object
 * @param args An array of the arguments passed to the function call being tracked
 */
async function mod<S, A extends IWithState<S>>(
  fatstate: Data<S, A>,
  name: FunctionPropertyNames<A>,
  args: IArguments
) {
  const modsArray = fatstate[_mods];
  // check the deltaT
  const now = Date.now();
  const deltaT = now - fatstate[_prevTime];
  fatstate[_prevTime] = now;
  // to avoid filling the mods array
  // if deltaT is bellow min update the previous action if its the same
  if (deltaT < fatstate[_minTime]) {
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
  fatstate[_version]++;
  modsArray.push(Modification.create(fatstate[_version], deltaT, name, args));
}
/** Changes the state to be at the version specified in the arg
 * @remarks It replays all the actions from the initial state up until the desired version is reached
 * @param fatstate The object that can keep track of the state modifications
 * @param version Where to stop the state at
 * @param startingState If provided, it considers this string as the initial state
 */
function restoreTo<S, A extends IWithState<S>>(
  fatstate: Data<S, A>,
  version: number,
  startingState?: string
) {
  const modsArray = fatstate[_mods];
  const maxVersion = mostRecentVersion(fatstate);
  if (version > maxVersion) {
    // tslint:disable-next-line:no-console
    console.warn(
      `Unable to restore to version ${version}; maximum available is ${maxVersion}.`
    );
    return;
  }
  // Set the initial state:
  const stateActions = fatstate[_actions];
  stateActions.state = fatstate[_deserializer](
    startingState || fatstate[_initialState]
  );
  if (version === 0) {
    // Just restore to the initial state, apply no mods
    return;
  }
  // Apply the mods
  for (let i = 1; i <= version; i++) {
    const mod = modsArray[i - 1];
    if (!mod.args) {
      stateActions[mod.actionName]();
    } else {
      stateActions[mod.actionName](...mod.args);
    }
  }
}
/** Changes the state to the immediate previous version
 * @param fatstate The object that can keep track of the state modifications
 * @param actionsToReplay If provided it jumps to the immediate previous state modified by one of these actions
 * @param startingState If provided, it considers this string as the initial state
 */
function prev<S, A extends IWithState<S>>(
  fatstate: Data<S, A>,
  actionsToReplay?: Set<FunctionPropertyNames<A>>,
  startingState?: string
) {
  const modsArray = fatstate[_mods];
  const stateVersion = fatstate[_version];
  const replaySet = actionsToReplay || fatstate[_actionNames];
  // find previous version:
  let prev = 0;
  for (let v = 0; v < stateVersion; v++) {
    if (replaySet.has(modsArray[v].actionName)) {
      prev = v;
    }
  }
  restoreTo(fatstate, prev, startingState);
}
/** Changes the state to the immediate next version
 * @param fatstate The object that can keep track of the state modifications
 * @param actionsToReplay If provided it jumps to the immediate next state modified by one of these actions
 * @param startingState If provided, it considers this string as the initial state
 */
function next<S, A extends IWithState<S>>(
  fatstate: Data<S, A>,
  actionsToReplay?: Set<FunctionPropertyNames<A>>,
  startingState?: string
) {
  const modsArray = fatstate[_mods];
  const stateVersion = fatstate[_version];
  const replaySet = actionsToReplay || fatstate[_actionNames];
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
/**
 * Converts the state tracking object into a string
 * @param fatstate The object that can keep track of the state modifications
 * @returns The string of the serialized object
 */
function serialize<S, A extends IWithState<S>>(fatstate: Data<S, A>): string {
  const reviver: IDataReviver = {
    v: fatstate[_version],
    m: fatstate[_mods].map(Modification.serialize),
    pT: fatstate[_prevTime],
    mT: fatstate[_minTime],
    s: fatstate[_serializer](fatstate[_actions].state),
    i: fatstate[_initialState]
  };
  return JSON.stringify(reviver);
}
/**
 * Converts a string into the state tracking object
 * @param serialized The string of the serialized object
 * @param actions An object with all the state modifying functions
 * @param serializer A function that can serialize the actions object "state" attribute
 * @param deserializer A function that can deserialize a string into the actions object "state" attribute
 * @param functionArgsReviver A function that can convert the modifications function arguments to a string
 * @returns The state tracking object
 */
function deserialize<S, A extends IWithState<S>>(
  serialized: string,
  actions: A,
  serializer: (state: S) => string = JSON.stringify,
  deserializer: (serialized: string) => S = JSON.parse,
  functionArgsReviver?: (
    n: FunctionPropertyNames<A>,
    a: IArguments
  ) => IArguments
): Data<S, A> {
  const revived: IDataReviver = JSON.parse(serialized);
  // Duplicate the actions object:
  let dupActions: A;
  if (actions.hasOwnProperty) {
    dupActions = Object.assign({}, actions);
  } else {
    dupActions = Object.assign(Object.create(null), actions);
  }
  dupActions.state = deserializer(revived.s);
  // Parse the mods array
  const mods = revived.m.map(modification =>
    Modification.deserialize(modification, functionArgsReviver)
  );
  // Our final Fat state:
  const finalFat = init(
    actions,
    revived.i,
    functionArgsReviver,
    serializer,
    deserializer,
    revived.v,
    mods,
    revived.pT,
    revived.mT
  );
  return finalFat;
}
