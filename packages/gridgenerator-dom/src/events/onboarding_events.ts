import { FatState, Onboarding, OnboardingAt } from "../../data";
import { Runtime } from "../../engine";
import { IEventHandler, UpdateAction } from "../common";
import { Refresher } from "./refresher";

export class OnboardingEvents implements IEventHandler {
  public state: FatState;
  public onboarding: Onboarding;
  public refresher: Refresher;
  public runtime: Runtime;
  public onMouseUp: (e: MouseEvent) => void;
  public onMouseMove: (e: MouseEvent) => void;
  public onMouseDown: (e: MouseEvent) => void;
  public onTouchStart: (e: TouchEvent) => void;
  public onTouchMove: (e: TouchEvent) => void;
  public onTouchEnd: (e: TouchEvent) => void;
  public onTouchCancel: (e: TouchEvent) => void;
  constructor(
    rt: Runtime,
    s: FatState,
    refresher: Refresher,
    onboarding: Onboarding
  ) {
    this.runtime = rt;
    this.state = s;
    this.refresher = refresher;
    this.onboarding = onboarding;
  }
}
