import { FatState, FatStateReviver } from './fat';
import { IStateSVGParts, State, StateReviver } from './state';
/*
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL CHECK (char_length(title) < 80),
  description   TEXT CHECK (char_length(description) < 1024),
  legal         gg.license,
  initial_state json,
  final_state   json,
  fat_state     json,
  state_version INTEGER,
  updated_at    TIMESTAMPTZ,
  is_published  BOOLEAN,
  published_at  TIMESTAMPTZ,
  views         SERIAL,
  plays         SERIAL,
  action        gg.child_action,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  parent_id     INTEGER REFERENCES gg.work,
  parent_path   LTREE

*/
export enum ProjectLicense {
	CC0 = 'CC0',
	BY = 'BY',
	BYSA = 'BY_SA',
	BYNC = 'BY_NC',
	BYND = 'BY_ND',
	BYNCSA = 'BY_NC_SA',
	BYNCND = 'BY_NC_ND'
}
export function canRemix(l: ProjectLicense) {
	return (
		l !== ProjectLicense.BYND &&
		l !== ProjectLicense.BYNCND);
}
export function canDownload(l: ProjectLicense) {
	return (
		l !== ProjectLicense.BYNC &&
		l !== ProjectLicense.BYNCND &&
		l !== ProjectLicense.BYNCSA);
}
export function canChangeLicense(l: ProjectLicense) {
	return (
		l !== ProjectLicense.BYSA &&
		l !== ProjectLicense.BYNCSA);
}
export enum ProjectAction {
	Original = 'ORIGINAL',
	Fork = 'FORK',
	Update = 'UPDATE'
}

/**
 * StoredProject is a project just like it is in the DB
 * It differs from a Project in the fact that it holds the
 * states as a string (JSON in need to be parsed)
 */
export interface StoredProject {
	id: number;
	title: string;
	description: string | null;
	legal: ProjectLicense;
	initialState: string; // StateReviver JSON
	finalState: string;   // ^
	fatState: string;     // ^
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
	description: string | null;
	legal: ProjectLicense;
	initialState: StateReviver;
	finalState: StateReviver | null;
	fatState: FatStateReviver;
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
export class Project {
	public id: number | null;
	public title: string | null;
	public description: string | null;
	public legal: ProjectLicense;
	public initialState: State;
	public finalState: State | null;
	public fatState: FatState;
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
	constructor(initialState: State, action?: ProjectAction, license?: ProjectLicense, fat?: FatState) {
		this.legal = license || ProjectLicense.CC0;
		this.action = action || ProjectAction.Original;
		// deep copy the initial state
		this.initialState = initialState;
		this.fatState = fat || new FatState(this.initialStateCopy);
		this.isPublished = false;
		this.canChangeLicense = canChangeLicense(this.legal);
	}
	public toStored(): StoredProject | null {
		if (!this.id || !this.title || !this.legal || !this.action || !this.svg || !this.svgViewBox
		|| !this.publishedAt || !this.createdAt || !this.parentPath
		) {
			return null;
		}
		return ({
			id: this.id,
			title: this.title,
			description: this.description,
			legal: this.legal,
			initialState: '',
			finalState: '',
			fatState: '',
			isPublished: this.isPublished,
			action: this.action,
			svg: this.svg,
			svgViewBox: [this.svgViewBox[0], this.svgViewBox[1]],
			publishedAt: this.publishedAt,
			updatedAt: this.updatedAt,
			createdAt: this.createdAt,
			parentId: this.parentId,
			parentPath: this.parentPath
		});
	}
	get initialStateCopy() {
		return State.revive(this.initialState.toJSON());
	}
	get fatStateCopy() {
		if (this.fatState) {
			return FatState.revive(this.fatState.toJSON(), this.initialStateCopy);
		}
		return new FatState(this.initialStateCopy);
	}
	set license(s: string) {
		switch (s) {
			case 'CC0': this.legal = ProjectLicense.CC0; break;
			case 'BY': this.legal = ProjectLicense.BY; break;
			case 'BY_SA': this.legal = ProjectLicense.BYSA; break;
			case 'BY_NC': this.legal = ProjectLicense.BYNC; break;
			case 'BY_ND': this.legal = ProjectLicense.BYND; break;
			case 'BY_NC_SA': this.legal = ProjectLicense.BYNCSA; break;
			case 'BY_NC_ND': this.legal = ProjectLicense.BYNCND; break;
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
	public toJSON() {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			legal: this.legal,
			initialState: this.initialState.toJSON(),
			finalState: (this.finalState ? this.finalState.toJSON() : null),
			fatState: (this.fatState ? this.fatState.toJSON() : null),
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
	public static netRevive(o) {
		o.finalState = JSON.parse(o.finalState);
		o.initialState = JSON.parse(o.initialState);
		o.fatState = JSON.parse(o.fatState);
		return this.revive(o);
	}
	public static revive(o: ProjectReviver) {
		const result = new Project(State.revive(o.initialState), o.action, o.legal);
		result.id = o.id;
		result.title = o.title;
		result.description = o.description;
		result.finalState = (o.finalState ? State.revive(o.finalState) : null);
		result.fatState = FatState.revive(o.fatState, result.finalState || result.initialState);
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
export class ProjectMap {
	public projects: Map<number, StoredProject>;
	public current: Project;
	constructor() {
		this.projects = new Map();
		this.current = new Project(new State());
	}
	public get(id: number): StoredProject | undefined {
		return this.projects.get(id);
	}
	public refreshProjects(projs: StoredProject[]): ProjectMap {
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
	 * Assumes the current project is already published and present on the map (it destructively changes it)
	 */
	public closeCurrent() {
		const parentId = this.current.id;
		this.current.publishedAt = null;
		this.current.action = ProjectAction.Update;
		this.current.id = null;
		this.current.title = this.current.title += ' Update';
		this.current.isPublished = false;
	}
	public prepareToPublish(state: State, fat: FatState, title: string, desc: string | null, license: string) {
		return new Promise((resolve, reject) => {
			// Updates current project with:
			const proj = this.current;
			// set the final state
			proj.finalState = state; // full copy
			// set the fat state
			proj.fatState = FatState.revive(fat.toJSON(), proj.finalState);
			// set the title
			proj.title = title;
			// set the description
			proj.description = desc;
			// license it
			proj.license = license;
			// set the svg and the svg viewbox
			proj.createSVG();
			// return it;
			return proj;
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
