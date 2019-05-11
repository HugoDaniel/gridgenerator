import { render } from "inferno";
import {
  Cart,
  FatState,
  Meander,
  Onboarding,
  PlayerState,
  Project,
  ProjectMap,
  State
} from "gridgenerator-data";
import { Debug, Events, Refresher, UpdateAction } from "gridgenerator-dom";
import { Net, Runtime } from "gridgenerator-engine";
import { GridGeneratorDOM } from "./dom";
import "./fills.css";
import "./main.css";

let resizeFunc;
(function() {
  const throttle = function(type, name, timeout = 333, obj = window) {
    let timeoutId;
    if (resizeFunc) {
      obj.removeEventListener(type, resizeFunc);
    }
    resizeFunc = function() {
      if (!timeoutId) {
        timeoutId = setTimeout(function() {
          obj.dispatchEvent(new CustomEvent(name));
          timeoutId = null;
        }, timeout);
      }
    };
    obj.addEventListener(type, resizeFunc);
  };
  throttle("resize", "optimizedResize");
})();

class Main {
  private debug: Debug;
  private projects: ProjectMap;
  private state: FatState;
  private runtime: Runtime;
  private meander: Meander;
  private cart: Cart;
  private net: Net;
  private player: PlayerState | null;
  private onboarding: Onboarding;
  // private framer: Framer;
  private events: Events;
  private container: HTMLElement;
  constructor() {
    // initializes the shopping cart
    this.cart = new Cart();
    this.onboarding = new Onboarding();
    // starts a new project
    this.projects = new ProjectMap();
    this.state = this.projects.current.fatState;
    // console.log("EMPTY", emptyState.isEmpty);
    /*
		let s = new State();
		let o = JSON.parse(JSON.stringify(this.state.current));
		console.log('STATE JSON', s.revive(o));
		*/
    this.net = new Net();
    this.meander = new Meander();
    this.player = null;
    this.init();
    const _element = document.getElementById("app");
    if (_element) {
      this.container = _element;
    } else {
      throw new Error("Container #app not found");
    }
    window.addEventListener("optimizedResize", this.resizeDOM.bind(this));
  }
  private init() {
    this.runtime = new Runtime(this.state.current);
    this.runtime.setInitialState(this.projects.current.initialState);
    const refresher = new Refresher(
      this.setRuntime.bind(this),
      this.setState.bind(this),
      this.setStateAndDOM.bind(this),
      this.updateDOM.bind(this),
      this.setMeander.bind(this),
      this.setCart.bind(this),
      this.setProjects.bind(this),
      this.setOnboarding.bind(this),
      this.setPlayer.bind(this),
      this.setPlayerAndDOM.bind(this),
      this.setInitialPlayerState.bind(this),
      this.newProject.bind(this)
    );
    this.events = new Events(
      this.runtime,
      this.state,
      this.meander,
      this.cart,
      this.net,
      this.projects,
      this.onboarding,
      this.player,
      refresher
    );
    // @ts-ignore
    this.debug = new Debug(
      process.env.NODE_ENV === "development",
      this.runtime,
      this.events,
      this.state
    );
    // ^ false when building for production
  }
  public setMeander(m: Meander): void {
    this.meander = m;
    this.events.updateMeander(this.meander);
  }
  public setCart(c: Cart): void {
    this.cart = c;
    this.events.updateCart(this.cart);
  }
  public setOnboarding(o: Onboarding): void {
    this.onboarding = o;
    this.events.updateOnboarding(this.onboarding);
  }
  public setRuntime(rt: Runtime): void {
    this.runtime = rt;
    if (this.events) {
      this.events.updateRuntime(this.runtime);
    }
    if (this.debug) {
      this.debug.runtime = rt;
      this.debug.events = this.events;
    }
  }
  public setState(s: FatState): void {
    this.state = s;
    this.events.updateState(this.state);
    if (this.debug) {
      this.debug.fat = s;
      this.debug.events = this.events;
    }
  }
  public setStateAndDOM(s: FatState, action?: UpdateAction): void {
    this.setState(s);
    if (this.debug) {
      this.debug.fat = s;
      this.debug.events = this.events;
    }
    this.updateDOM(action || UpdateAction.All);
  }
  public setProjects(p: ProjectMap): void {
    this.events.updateProjects(p);
    this.projects = p;
  }
  public setPlayer(p: PlayerState): void {
    this.events.updatePlayer(p);
    this.player = p;
  }
  public setPlayerAndDOM(p: PlayerState, action?: UpdateAction): void {
    this.setPlayer(p);
    this.updateDOM(action || UpdateAction.All);
  }
  public setInitialPlayerState(p: PlayerState, initialState: State) {
    this.setPlayer(p);
    this.events.initialPlayerState(initialState);
  }
  public newProject(p: Project) {
    this.events.meanderEvents.startLoading();
    this.projects.current = p;
    this.state = p.fatState;
    Runtime.newProject(this.runtime, this.state.current).then(rt => {
      this.setProjects(this.projects);
      this.setRuntime(rt);
      this.runtime.setInitialState(p.initialState);
      // update scene
      this.events.sceneEvents.reset();
      this.setStateAndDOM(this.state);
      setTimeout(this.events.meanderEvents.stopLoading, 600);
      // ^ ahah i hope 600ms is enough to load all the textures onto the GPU :P
    });
  }
  public resizeDOM() {
    // detect if browser window resize or if zoom:
    const curDPR = Math.round(window.devicePixelRatio * 100);
    if (curDPR !== this.runtime.device.dpr) {
      // console.log('ZOOM');
      return;
    }
    // clear the DOM:
    render(
      <p
        className={
          "tc w-100 h-100 center flex flex-column items-center justify-center bg-white sans-serif fixed ttu f5 transition-o o-90"
        }
      >
        Resizing
      </p>,
      this.container
    );
    // clear the runtime with the current state
    this.init();
    // render the new DOM:
    this.updateDOM(UpdateAction.All);
  }
  public updateDOM(action?: UpdateAction) {
    if (this.debug) this.debug.render();
    render(
      <GridGeneratorDOM
        state={this.state.current}
        cart={this.cart}
        onboarding={this.onboarding}
        projects={this.projects}
        runtime={this.runtime}
        events={this.events}
        meander={this.meander}
        player={this.player}
        action={action}
      />,
      this.container
    );
  }
}
// @ts-ignore
go(() => {
  const main = new Main();
  main.updateDOM(UpdateAction.All);
});
