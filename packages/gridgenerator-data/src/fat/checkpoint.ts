import { State } from "../state";
import { Modification } from "./modification";
export class Checkpoint {
  constructor(
    readonly state: State,
    readonly mods: Modification[],
    readonly version: number
  ) {}
}
