import { RuntimeDOM } from "./runtime/dom";
import { RandomArray } from "./runtime/random";
import { Token } from "./runtime/token";

/** A default runtime with a set of basic features to quick start a project */
export class DefaultRuntime extends RuntimeDOM {
  /** An array of pre-processed random numbers */
  public readonly random: RandomArray;
  /** A simple JWT token data structure */
  public token: Token | undefined;
  constructor() {
    super();
    this.random = new RandomArray();
    this.token = undefined;
  }
}
