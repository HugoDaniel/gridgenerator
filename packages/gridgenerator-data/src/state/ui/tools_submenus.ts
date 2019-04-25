export interface ToolsSubmenusReviver {
  p: boolean;
  v: boolean;
}
export class ToolsSubmenus {
  public isGridPatternOn: boolean;
  public isGridVisible: boolean;
  constructor() {
    this.isGridPatternOn = false;
    this.isGridVisible = true;
  }
  public toJSON(): ToolsSubmenusReviver {
    return {
      p: this.isGridPatternOn,
      v: this.isGridVisible
    };
  }
  public static revive(o: ToolsSubmenusReviver) {
    const result = new ToolsSubmenus();
    result.isGridPatternOn = o.p;
    result.isGridVisible = o.v;
    return result;
  }
}
