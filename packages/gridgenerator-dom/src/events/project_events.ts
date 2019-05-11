import {
  FatState,
  Project,
  ProjectMap,
  StoredProject
} from "gridgenerator-data";
import { Net, Runtime } from "gridgenerator-engine";
import { Refresher } from "./refresher";

export class ProjectEvents {
  public runtime: Runtime;
  public state: FatState;
  public refresher: Refresher;
  public net: Net;
  public projects: ProjectMap;
  public beforeLogin: () => void;
  public afterLogin: (id: number) => Promise<void>;
  public refreshProjects: (
    projs: StoredProject[],
    closeCurrent: boolean
  ) => void;
  public getProject: (id: number) => StoredProject | undefined;
  public reviveProject: (id: number) => Promise<Project>;
  public reviveNetProject: (proj: any) => Promise<Project>;
  public saveLocally: () => void;
  private resetScene: () => void;
  private reviverWorker: Worker;
  constructor(
    rt: Runtime,
    s: FatState,
    net: Net,
    p: ProjectMap,
    refresher: Refresher,
    resetScene: () => void
  ) {
    this.runtime = rt;
    this.state = s;
    this.refresher = refresher;
    this.net = net;
    this.projects = p;
    this.resetScene = resetScene;
    this.refreshProjects = (projs, closeCurrent = false) => {
      this.projects.refreshProjects(projs);
      if (closeCurrent) {
        this.projects.closeCurrent();
      }
      this.refresher.refreshProjectsOnly(this.projects);
    };
    this.getProject = id => {
      return this.projects.get(id);
    };
    this.reviveNetProject = proj => {
      if (proj.initialState && proj.finalState && proj.fatState) {
        return this.parseInWorker(proj);
      }
      return Promise.reject(`Server returned an invalid project`);
    };
    this.saveLocally = () => {
      // create a copy of the current project and save it in local storage
      const cur = this.projects.current;
      const localProjs = localStorage.getItem(cur.localId + "");
      let saved: any = [];
      if (localProjs) {
        saved = JSON.parse(localProjs);
      }
      saved.push(cur.toJSON());
      localStorage.setItem(cur.localId + "", JSON.stringify(saved));
      // update the saved state
    };
    this.reviveProject = id => {
      const storedProj = this.projects.get(id);
      if (storedProj) {
        // console.log('GOT PROJECT FROM STORED', storedProj);
        return this.parseInWorker(storedProj);
      }
      return Promise.reject(`No such project ${id}`);
    };
    this.beforeLogin = () => {
      /*
			console.log('beforeLogin, storing state');
			const _s = this.state;
			localStorage.setItem('beforeLoginFat', JSON.stringify(_s.toJSON()));
			localStorage.setItem('beforeLoginState', JSON.stringify(_s.current.toJSON()));
			localStorage.setItem('beforeLoginProj', JSON.stringify(this.projects.current.toJSON()));
			console.log('beforeLogin, state stored');
			*/
    };
    this.afterLogin = (id: number) => {
      return new Promise((resolve, reject) => {
        /*
				// restore from localStorage
				const storedFat = localStorage.getItem('beforeLoginFat');
				const storedState = localStorage.getItem('beforeLoginState');
				const storedProj = localStorage.getItem('beforeLoginProj');
				// re-create the current project
				if (storedFat && storedState) {
					const state = State.revive(JSON.parse(storedState));
					const fat = FatState.revive(JSON.parse(storedFat), state);
					this.projects.current = new Project(new State());
					this.projects.current.fatState = fat;
				}
				// update the re-recreated current project for every module that is interested
				this.refresher.refreshProjectsOnly(this.projects);
				// Reset the runtime and state:
				const newState = this.projects.current.fatState;
				if (!newState) {
					reject('No State to Restore');
					return;
				}
				Runtime.newProject(this.runtime, newState.current).then( (newRuntime: Runtime) => {
					this.refresher.refreshRuntimeOnly(newRuntime);
					this.resetScene();
					this.refresher.refreshAll(newRuntime, newState);
					resolve();
					return;
				})
				;*/
      });
    };
    const workerCode = new Blob(
      [
        `
		onmessage = function(e) {
			const { initialState, fatState, finalState } = e.data;
			const final = Object.assign({}, e.data, {
				initialState: JSON.parse(initialState),
				fatState: JSON.parse(fatState),
				finalState: JSON.parse(finalState)
			});
			self.postMessage(final);
		}
		`
      ],
      { type: "text/javascript" }
    );
    this.reviverWorker = new Worker(window.URL.createObjectURL(workerCode));
  }
  private parseInWorker(o: any): Promise<Project> {
    const p: Promise<Project> = new Promise((resolve, reject) => {
      this.reviverWorker.onmessage = e => {
        const proj = Project.revive(e.data);
        if (proj.fatState) {
          resolve(proj);
        } else {
          reject("Could not parse Project State");
        }
      };
    });
    this.reviverWorker.postMessage(o);
    return p;
  }
}
