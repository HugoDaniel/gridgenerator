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
import { Runtime } from "gridgenerator-engine";
import { UpdateAction } from "../common";

export class Refresher {
  public refreshNewProject: (p: Project) => void;
  public refreshStateOnly: (s: FatState) => void;
  public refreshRuntimeOnly: (r: Runtime) => void;
  public refreshDOMOnly: (action?: UpdateAction) => void;
  public refreshMeanderOnly: (m: Meander) => void;
  public refreshCartOnly: (c: Cart) => void;
  public refreshOnboardingOnly: (o: Onboarding) => void;
  public refreshPlayerInitialState: (p: PlayerState, s: State) => void;
  public refreshPlayerOnly: (p: PlayerState) => void;
  public refreshProjectsOnly: (p: ProjectMap) => void;
  public refreshStateAndDOM: (s: FatState, action?: UpdateAction) => void;
  public refreshPlayerAndDOM: (p: PlayerState, action?: UpdateAction) => void;
  public refreshAll: (r: Runtime, s: FatState, m?: Meander) => void;
  constructor(
    rro: (r: Runtime) => void,
    rso: (s: FatState) => void,
    rsdom: (s: FatState, action?: UpdateAction) => void,
    rdom: (action?: UpdateAction) => void,
    rmean: (m: Meander) => void,
    rcart: (c: Cart) => void,
    rproj: (p: ProjectMap) => void,
    ronboard: (o: Onboarding) => void,
    rplay: (p: PlayerState) => void,
    rplaydom: (p: PlayerState, action?: UpdateAction) => void,
    rplayis: (p: PlayerState, s: State) => void,
    newp: (p: Project) => void
  ) {
    this.refreshNewProject = newp;
    this.refreshStateOnly = rso;
    this.refreshRuntimeOnly = rro;
    this.refreshDOMOnly = rdom;
    this.refreshMeanderOnly = rmean;
    this.refreshCartOnly = rcart;
    this.refreshStateAndDOM = rsdom;
    this.refreshProjectsOnly = rproj;
    this.refreshOnboardingOnly = ronboard;
    this.refreshPlayerOnly = rplay;
    this.refreshPlayerInitialState = rplayis;
    this.refreshPlayerAndDOM = rplaydom;
    this.refreshAll = (r: Runtime, s: FatState, m?: Meander) => {
      this.refreshRuntimeOnly(r);
      this.refreshStateOnly(s);
      this.refreshDOMOnly();
      if (m) {
        this.refreshMeanderOnly(m);
      }
    };
  }
}
