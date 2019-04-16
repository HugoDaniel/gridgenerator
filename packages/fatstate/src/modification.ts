export { Data, create, serialize, deserialize };
import { FunctionPropertyNames } from "./types";

interface Data<T> {
  version: number;
  deltaT: number;
  actionName: FunctionPropertyNames<T>;
  args: IArguments;
}

/** Creates a new modification */
function create<T>(
  version: number,
  deltaT: number,
  actionName: FunctionPropertyNames<T>,
  args: IArguments
): Data<T> {
  return { version, deltaT, actionName, args };
}
function serialize<T>(modification: Data<T>): string {
  return JSON.stringify({
    v: modification.version,
    d: modification.deltaT,
    n: modification.actionName,
    a: modification.args
  });
}
function deserialize<T>(
  str: string,
  argsReviver: (n: FunctionPropertyNames<T>, a: IArguments) => IArguments = (
    _,
    a
  ) => a
): Data<T> {
  const revived: IModificationReviver<T> = JSON.parse(str);
  // Check if all the fields are present
  if (revived.v === undefined || revived.v === null) {
    throw new Error(
      "Unable to parse Modification string; version attribute not present"
    );
  } else if (revived.d === undefined || revived.d === null) {
    throw new Error(
      "Unable to parse Modification string; deltaT attribute not present"
    );
  } else if (revived.n === undefined || revived.n === null) {
    throw new Error(
      "Unable to parse Modification string; actionName attribute not present"
    );
  } else if (revived.a === undefined || revived.a === null) {
    throw new Error(
      "Unable to parse Modification string; args attribute not present"
    );
  }
  const args = argsReviver(revived.n, revived.a);
  return create(revived.v, revived.d, revived.n, args);
}

interface IModificationReviver<T> {
  v: number;
  d: number;
  n: FunctionPropertyNames<T>;
  a: IArguments;
}
