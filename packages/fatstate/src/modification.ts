import { FunctionPropertyNames } from "./types";

interface IModificationReviver<T> {
  v: number;
  d: number;
  n: FunctionPropertyNames<T>;
  a: IArguments;
}
export class Modification<T> {
  public readonly version: number;
  public readonly deltaT: number;
  public readonly actionName: FunctionPropertyNames<T>;
  public readonly args: IArguments;
  constructor(
    version: number,
    deltaT: number,
    actionName: FunctionPropertyNames<T>,
    args: IArguments
  ) {
    this.version = version;
    this.deltaT = deltaT;
    this.actionName = actionName;
    this.args = args;
  }
  public toString(): string {
    return JSON.stringify({
      v: this.version,
      d: this.deltaT,
      n: this.actionName,
      a: this.args
    });
  }
  public static fromString<T>(
    str: string,
    argsReviver: (n: FunctionPropertyNames<T>, a: IArguments) => IArguments = (
      _,
      a
    ) => a
  ): Modification<T> {
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
    return new Modification(revived.v, revived.d, revived.n, args);
  }
}
