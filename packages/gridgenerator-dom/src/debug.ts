import { FatState } from "gridgenerator-data";
import { Events } from "./events";
import { Runtime } from "gridgenerator-engine";

export class Debug {
  public enabled: boolean;
  public updateNumber: number;
  public runtime: Runtime;
  public events: Events;
  public fat: FatState;
  public render: () => void;
  public showTextures: () => void;
  constructor(enabled: boolean, rt: Runtime, events: Events, state: FatState) {
    this.updateNumber = 0;
    this.enabled = enabled;
    this.runtime = rt;
    this.events = events;
    this.fat = state;
    const nop = () => {
      return;
    };
    if (!enabled) {
      this.render = nop;
      this.showTextures = nop;
      return;
    }
    this.showTextures = () => {
      // tslint:disable-next-line:no-console
      console.log(
        `%c TEXTURES`,
        "background: blue; color: white; display: block;"
      );
      const scene = this.events.sceneEvents._scene;
      if (!scene) {
        // tslint:disable-next-line:no-console
        console.log("No textures available");
        return;
      }
      const shader = scene.shader;
      // tslint:disable-next-line:no-console
      console.log({});
    };
    this.render = () => {
      if (this.enabled) {
        this.updateNumber++;
        // tslint:disable-next-line:no-console
        console.log(
          `%c RENDER ${this.updateNumber}`,
          "background: green; color: white; display: block;"
        );
        return this.updateNumber;
      }
    };
    this.initKeys();
  }
  private initKeys() {
    /*
		document.onkeyup = (e) => {
			const tkeynum = 84;
			const nkeynum = 78;
			// console.log('WHICH', e.which);
			const curkeynum = e.which;
			if (curkeynum === tkeynum) {
				// t pressed, show textures
				this.showTextures();
			} else if (curkeynum === nkeynum) {
				// n pressed: create a new project
				this.events.meanderEvents.onProjectNew();
			}
		};
		*/
  }
}
