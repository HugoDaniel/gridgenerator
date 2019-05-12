export interface MenuEntryReviver {
  l: string;
  t: string | null;
  sp: string[];
  s: string;
  r: number;
}
export class MenuEntry {
  public readonly label: string;
  public readonly svgPaths: string[];
  public readonly tooltip: string | null;
  public svg: string;
  public rotation: number;
  constructor(
    label: string,
    tooltip: string | null = null,
    svgPaths: string[] = [],
    svg: string = "",
    rotation: number = 0
  ) {
    this.label = label;
    this.tooltip = tooltip;
    this.svgPaths = svgPaths;
    this.svg = svg;
    this.rotation = rotation;
  }
  public toJSON(): MenuEntryReviver {
    return {
      l: this.label,
      t: this.tooltip,
      sp: this.svgPaths.slice(0),
      s: this.svg,
      r: this.rotation
    };
  }
  public static revive(o: MenuEntryReviver) {
    return new MenuEntry(o.l, o.t, o.sp, o.s, o.r);
  }
}
export interface MenuReviver {
  e: Array<[any, MenuEntryReviver]>;
  s: any;
  t: any[];
}
export class Menu<T> {
  public readonly entries: Map<T, MenuEntry>;
  public selected: T;
  public toggled: T[];
  constructor(entries: Map<T, MenuEntry>) {
    this.entries = entries;
    this.toggled = [];
  }
  public toJSON(): MenuReviver {
    return {
      e: [...this.entries.entries()].map(
        e => [e[0], e[1].toJSON()] as [any, MenuEntryReviver]
      ),
      s: this.selected,
      t: this.toggled
    };
  }
  public static revive(o: MenuReviver) {
    const result = new Menu(
      new Map(o.e.map(e => [e[0], MenuEntry.revive(e[1])] as [any, MenuEntry]))
    );
    result.selected = o.s;
    result.toggled = o.t;
    return result;
  }
  public iter() {
    return this.entries.entries();
  }
  public map(
    f: (
      key: T,
      entry: MenuEntry,
      isSelected: boolean,
      isToggled?: boolean
    ) => any,
    filter?: (key: T, entry: MenuEntry, isSelected: boolean) => boolean
  ): any[] {
    const result: any[] = [];
    if (filter) {
      for (const [k, e] of this.entries.entries()) {
        if (filter(k, e, k === this.selected)) {
          result.push(f(k, e, k === this.selected));
        }
      }
    } else {
      for (const [k, e] of this.entries.entries()) {
        result.push(f(k, e, k === this.selected, this.toggled.indexOf(k) > -1));
      }
    }
    return result;
  }
}
