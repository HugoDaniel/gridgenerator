export enum ProjectLicense {
  CC0 = "CC0",
  BY = "BY",
  BYSA = "BY_SA",
  BYNC = "BY_NC",
  BYND = "BY_ND",
  BYNCSA = "BY_NC_SA",
  BYNCND = "BY_NC_ND"
}
export function canRemix(l: ProjectLicense) {
  return l !== ProjectLicense.BYND && l !== ProjectLicense.BYNCND;
}
export function canDownload(l: ProjectLicense) {
  return l !== ProjectLicense.BYNCND;
}
export function canChangeLicense(l: ProjectLicense) {
  return l !== ProjectLicense.BYSA && l !== ProjectLicense.BYNCSA;
}
export enum ProjectAction {
  Original = "ORIGINAL",
  Fork = "FORK",
  Update = "UPDATE"
}

/**
 * StoredProject is a project just like it is in the DB
 * It differs from a Project in the fact that it holds the
 * states as a string (JSON in need to be parsed)
 */
export interface StoredProject {
  id: number;
  title: string;
  localId: number;
  description: string | null;
  legal: ProjectLicense;
  initialState: string;
  finalState: string;
  state: string;
  isPublished: boolean;
  action: ProjectAction;
  svg: string;
  svgViewBox: [number, number];
  publishedAt: string;
  updatedAt: string | null;
  createdAt: string;
  parentId: number | null;
  parentPath: string;
}
export interface ProjectReviver {
  id: number | null;
  title: string | null;
  localId: number;
  description: string | null;
  legal: ProjectLicense;
  initialState: string;
  finalState: string | null;
  state: string;
  isPublished: boolean;
  action: ProjectAction;
  svg: string | null;
  svgViewBox: number[] | null;
  publishedAt: string | null;
  updatedAt: string | null;
  createdAt: string | null;
  parentId: number | null;
  parentPath: string | null;
}
export interface IProjectExport {
  id: number | null;
  initialState: string; // StateReviver JSON
  fatState: string; // FatStateReviver JSON
  svg: string | null;
  svgViewBox: number[] | null;
  hash: string;
}
interface ProjectState<S> {
  createSVG: () => { svg: string; viewbox: [number, number, number, number] };
  copy: () => S;
  serialize: () => string;
}
interface ProjectActions<A> {
  copy: () => A;
  createSVG: () => { svg: string; viewbox: [number, number, number, number] };
  getHash: () => Promise<string>;
  serialize: () => string;
}
export class Project<S extends ProjectState<S>, A extends ProjectActions<A>> {
  public id: number | null;
  public localId: number; // used to save project in localStorage
  public title: string | null;
  public description: string | null;
  public legal: ProjectLicense;
  public initialState: S;
  public state: A;
  public finalState: S | null;
  public isPublished: boolean;
  public action: ProjectAction;
  public svg: string | null;
  public svgViewBox: number[] | null;
  public publishedAt: string | null;
  public createdAt: string | null;
  public updatedAt: string | null;
  public parentId: number | null;
  public parentPath: string | null;
  public readonly canChangeLicense: boolean;
  constructor(
    initialState: S,
    stateActions: A,
    action: ProjectAction = ProjectAction.Original,
    license: ProjectLicense = ProjectLicense.CC0
  ) {
    this.legal = license;
    this.action = action;
    // deep copy the initial state
    this.initialState = initialState;
    this.state = stateActions;
    this.isPublished = false;
    this.canChangeLicense = canChangeLicense(this.legal);
    // create the localId
    let localId = 0;
    let hasItem: string | null = null;
    do {
      localId = Math.floor(Math.random() * Math.pow(2, 24));
      hasItem = localStorage.getItem(`${localId}`);
    } while (hasItem !== null);
    this.localId = localId;
  }
  public toStored(): StoredProject | null {
    if (
      !this.id ||
      !this.title ||
      !this.legal ||
      !this.action ||
      !this.svg ||
      !this.svgViewBox ||
      !this.publishedAt ||
      !this.createdAt ||
      !this.parentPath
    ) {
      return null;
    }
    return {
      id: this.id,
      title: this.title,
      localId: this.localId,
      description: this.description,
      legal: this.legal,
      initialState: "",
      finalState: "",
      state: "",
      isPublished: this.isPublished,
      action: this.action,
      svg: this.svg,
      svgViewBox: [this.svgViewBox[0], this.svgViewBox[1]],
      publishedAt: this.publishedAt,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt,
      parentId: this.parentId,
      parentPath: this.parentPath
    };
  }
  set license(s: string) {
    switch (s) {
      case "CC0":
        this.legal = ProjectLicense.CC0;
        break;
      case "BY":
        this.legal = ProjectLicense.BY;
        break;
      case "BY_SA":
        this.legal = ProjectLicense.BYSA;
        break;
      case "BY_NC":
        this.legal = ProjectLicense.BYNC;
        break;
      case "BY_ND":
        this.legal = ProjectLicense.BYND;
        break;
      case "BY_NC_SA":
        this.legal = ProjectLicense.BYNCSA;
        break;
      case "BY_NC_ND":
        this.legal = ProjectLicense.BYNCND;
        break;
      default:
        this.legal = ProjectLicense.CC0;
    }
  }
  public createSVG() {
    if (!this.finalState) {
      return;
    }
    const { svg, viewbox } = this.finalState.createSVG();
    this.svgViewBox = viewbox;
    this.svg = svg;
  }
  public toJSON(
    serializeState: (state: S) => string,
    serializeActions: (actions: A) => string
  ) {
    return {
      id: this.id,
      title: this.title,
      localId: this.localId,
      description: this.description,
      legal: this.legal,
      initialState: serializeState(this.initialState),
      finalState: this.finalState ? serializeState(this.finalState) : null,
      state: serializeActions(this.state),
      isPublished: this.isPublished,
      action: this.action,
      svg: this.svg,
      svgViewBox: this.svgViewBox,
      publishedAt: this.publishedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      parentId: this.parentId,
      parentPath: this.parentPath
    };
  }
  public static netRevive<
    S extends ProjectState<S>,
    A extends ProjectActions<A>
  >(
    o: StoredProject,
    actions: A,
    parseState: (s: string) => S,
    parseActions: (s: string) => A
  ) {
    const result: ProjectReviver = {
      ...o,
      finalState: JSON.parse(o.finalState),
      initialState: JSON.parse(o.initialState)
    };
    return this.revive(result, actions, parseState, parseActions);
  }
  public static revive<S extends ProjectState<S>, A extends ProjectActions<A>>(
    o: ProjectReviver,
    actions: A,
    parseState: (s: string) => S,
    parseActions: (s: string) => A
  ) {
    const result = new Project(
      parseState(o.initialState),
      actions,
      o.action,
      o.legal
    );
    result.id = o.id;
    result.title = o.title;
    result.localId = o.localId;
    result.description = o.description;
    result.finalState = o.finalState ? parseState(o.finalState) : null;
    result.state = parseActions(o.state);
    result.isPublished = o.isPublished;
    result.svg = o.svg;
    result.svgViewBox = o.svgViewBox;
    result.publishedAt = o.publishedAt;
    result.createdAt = o.createdAt;
    result.updatedAt = o.updatedAt;
    result.parentId = o.parentId;
    result.parentPath = o.parentPath;
    return result;
  }
}
export class ProjectMap<
  S extends ProjectState<S>,
  A extends ProjectActions<A>
> {
  public projects: Map<number, StoredProject>;
  public current: Project<S, A>;
  constructor(initialState: S, stateActions: A) {
    this.projects = new Map();
    this.current = new Project(initialState, stateActions);
  }
  public get(id: number): StoredProject | undefined {
    return this.projects.get(id);
  }
  public refreshProjects(projs: StoredProject[]): ProjectMap<S, A> {
    for (let i = 0; i < projs.length; i++) {
      const p = projs[i];
      if (p.id) {
        this.projects.set(p.id, p);
      }
    }
    return this;
  }
  /**
   * Sets the current project as a variation of itself (an update with its previous self as parent)
   * Assumes the current project is already published and present on the map of stored projects
   * (it destructively changes it)
   */
  public finishProject() {
    const parentId = this.current.id;
    this.current.publishedAt = null;
    this.current.action = ProjectAction.Update;
    this.current.id = null;
    this.current.title = this.current.title += " Update";
    this.current.isPublished = false;
  }
  public prepareToPlay(
    state: Readonly<S>,
    stateActions: A
  ): Promise<Project<S, A>> {
    return new Promise((resolve, reject) => {
      if (!this.current) {
        reject("No current project");
      }
      const dup = new Project(this.current.initialState.copy(), stateActions);
      dup.finalState = state.copy();
      dup.state = stateActions.copy();
      dup.createSVG();
      resolve(dup);
    });
  }
  public prepareToPublish(
    state: S,
    actions: A,
    title: string,
    desc: string | null,
    license: string
  ) {
    return new Promise(resolve => {
      // Updates current project with:
      const proj = this.current;
      // set the final state
      proj.finalState = state; // full copy
      // set the fat state
      proj.state = actions.copy();
      // set the title
      proj.title = title;
      // set the description
      proj.description = desc;
      // license it
      proj.license = license;
      // set the svg and the svg viewbox
      proj.createSVG();
      // return it;
      resolve(proj);
    });
  }
  public exportCurrent(): Promise<IProjectExport> {
    return new Promise((resolve, reject) => {
      const c = this.current;
      const { svg, viewbox } = c.state.createSVG();
      c.state.getHash().then(hash => {
        const exported: IProjectExport = {
          id: c.id,
          initialState: c.initialState.serialize(),
          fatState: c.state.serialize(),
          svg,
          svgViewBox: viewbox,
          hash
        };
        resolve(exported);
      });
    });
  }
  public publishCurrent(p: StoredProject) {
    // this.projects.set(p.id, p);
    this.current.id = p.id;
    this.current.publishedAt = p.publishedAt;
    return this;
  }
  get size() {
    return this.projects.size;
  }
  public list(): StoredProject[] {
    return [...this.projects.values()].reverse();
  }
}
