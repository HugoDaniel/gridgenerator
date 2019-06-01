import { Menu, MenuEntry } from "./node_modules/gridgenerator-data/src/state/ui/menu";
export const enum AboutMenuId {
  GridGenerator = "gridgenerator",
  Contact = "contact"
}
const DefaultAboutMenu: Map<AboutMenuId, MenuEntry> = new Map([
  [AboutMenuId.GridGenerator, new MenuEntry("Grid Generator", "lightest-blue")],
  [AboutMenuId.Contact, new MenuEntry("Contact", "light-green")]
]);
export class MeanderAbout {
  public menu: Menu<AboutMenuId>;
  constructor() {
    this.menu = new Menu(DefaultAboutMenu);
    this.menu.selected = AboutMenuId.GridGenerator;
  }
}
