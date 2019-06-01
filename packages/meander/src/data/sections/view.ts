import { FatState } from "../fat";
import { Project, StoredProject } from "../project";
import { State } from "../state";
export enum ViewStatus {
  Simple = 100,
  Loading,
  Error
}
export class MeanderView {
  public status: ViewStatus;
  public id: number | null;
  public errorMsg: string | null;
  public project: StoredProject | null;
  public revived: Project | null;
  constructor() {
    this.status = ViewStatus.Simple;
  }
}
