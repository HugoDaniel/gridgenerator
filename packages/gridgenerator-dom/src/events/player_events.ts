import {
  FatActionSets,
  FatState,
  PlayerState,
  Project,
  ProjectAction,
  ProjectLicense,
  State
} from "gridgenerator-data";
import {
  CanvasContext,
  PlayerCanvasPainter,
  Runtime
} from "gridgenerator-engine";
import { downloadFile } from "../common";
import { Refresher } from "./refresher";

export class PlayerEvents {
  public runtime: Runtime;
  public state: PlayerState;
  public refresher: Refresher;
  private playerActions: Set<string>;
  // ^ this worker is used to return a fast full copy of the initial state
  public onClickAction: (e: Event) => void;
  public onPlayerCanvasInit: (ctx: CanvasContext) => void;
  public onPlayerImgLoad: () => void;
  public onPlay: () => void;
  public onPause: () => void;
  public onNext: () => void;
  public onPrev: () => void;
  public onToBegin: () => void;
  public onToEnd: () => void;
  public onDownload: () => void;
  public onRemix: () => void;
  public exit: () => void;
  constructor(
    rt: Runtime,
    p: PlayerState,
    refresher: Refresher,
    exit: () => void
  ) {
    this.runtime = rt;
    this.state = p;
    this.refresher = refresher;
    const fas = new FatActionSets();
    this.playerActions = fas.sitePlayerActions;
    this.exit = exit;
    this.onClickAction = e => {
      e.stopImmediatePropagation();
      e.preventDefault();
      // TODO: set pause/play state
      return;
    };
    this.onPlayerCanvasInit = ctx => {
      if (!this.runtime.playerImg) {
        this.runtime.playerImg = new Image(ctx.width, ctx.height);
        this.runtime.playerImg.addEventListener(
          "load",
          this.onPlayerImgLoad,
          false
        );
        // tslint:disable-next-line:no-console
        this.runtime.playerImg.addEventListener("error", e =>
          console.warn("PLAYER GOT ERROR", e)
        );
        // this.runtime.playerImg.onload = this.onPlayerImgLoad;
      }
      this.runtime.rects.playerRect();
      Runtime.setPlayerCtx(this.runtime, ctx.ctx);
      this.refresher.refreshRuntimeOnly(this.runtime);
      // render the final svg image on the canvas:
      const svg = PlayerCanvasPainter.SVGHEAD(
        this.state.thumbnailSvg,
        ctx.width,
        ctx.height,
        this.state.thumbnailSvgViewBox
      );
      this.state.currentViewBox = this.state.thumbnailSvgViewBox;
      this.runtime.playerImg.src = svg;
    };
    this.onPlayerImgLoad = () => {
      if (this.runtime.playerCtx && this.runtime.playerImg) {
        // document.getElementsByTagName('body').item(0).appendChild(this.runtime.playerImg);
        PlayerCanvasPainter.PAINT(
          this.runtime.playerCtx,
          this.state.state.current,
          this.runtime.playerImg,
          this.state.currentViewBox
        );
      }
    };
    this.onPlay = () => {
      const interval = 60; // in milliseconds
      this.state.isPlaying = true;
      const loop = () => {
        if (
          (this.state.isAtEnd || !this.state.isPlaying) &&
          this.runtime.playerLoop
        ) {
          this.stopLoop();
          this.refresher.refreshPlayerAndDOM(this.state);
          return;
        } else {
          this.state.state.fastRestoreFwd(this.playerActions);
          this.paint(this.state.state.current);
          this.updateVersion();
        }
      };
      if (this.state.isAtEnd) {
        this.getInitialState().then(s => {
          this.state.state.restoreTo(0, s);
          this.paint(this.state.state.current);
          this.updateVersion();
          this.runtime.playerLoop = window.setInterval(loop, interval);
          this.refresher.refreshRuntimeOnly(this.runtime);
        }, this.onTimeTravelError);
      } else {
        this.getInitialState().then(s => {
          this.state.state.restoreTo(this.state.state.version, s);
          this.updateVersion();
          this.paint(this.state.state.current);
          this.refresher.refreshPlayerAndDOM(this.state);
          this.runtime.playerLoop = window.setInterval(loop, interval);
          this.refresher.refreshRuntimeOnly(this.runtime);
        }, this.onTimeTravelError);
      }
    };
    this.onPause = () => {
      this.stopLoop();
      this.state.isPlaying = false;
      this.getInitialState().then(s => {
        this.state.state.next(s, this.playerActions);
        this.updateVersion();
        this.refresher.refreshPlayerAndDOM(this.state);
        this.paint(this.state.state.current);
      }, this.onTimeTravelError);
    };
    this.onNext = () => {
      this.stopLoop();
      this.updateVersion();
      if (this.state.isAtEnd) {
        return;
      }
      // console.log('PREV', this.state.state.version);
      // get initial state:
      this.getInitialState().then(s => {
        this.state.state.next(s, this.playerActions);
        this.updateVersion();
        this.paint(this.state.state.current);
      }, this.onTimeTravelError);
    };
    this.onPrev = () => {
      this.stopLoop();
      if (this.state.isAtStart) {
        return;
      }
      // console.log('PREV', this.state.state.version);
      // get initial state:
      this.getInitialState().then(s => {
        this.state.state.prev(s, this.playerActions);
        this.updateVersion();
        this.paint(this.state.state.current);
      }, this.onTimeTravelError);
    };
    this.onToBegin = () => {
      this.stopLoop();
      // get initial state:
      this.getInitialState().then(s => {
        this.state.state.restoreTo(0, s);
        this.updateVersion();
        this.paint(this.state.state.current);
      }, this.onTimeTravelError);
    };
    this.onToEnd = () => {
      if (this.runtime.playerLoop) {
        clearInterval(this.runtime.playerLoop);
        this.refresher.refreshRuntimeOnly(this.runtime);
      }
      // get initial state:
      this.getInitialState().then(s => {
        this.state.state.restoreTo(this.state.state.maxVersion, s);
        this.updateVersion();
        this.paint(this.state.state.current);
      }, this.onTimeTravelError);
    };
    this.onDownload = () => {
      const s = this.state.state.current;
      const dims = s.currentLayer.dimensions();
      const { viewbox } = s.createSVGParts(dims);
      const svg = s.renderSVG(dims, viewbox[0] / 4, viewbox[0] / 4);
      downloadFile(svg, "GRID_GENERATOR_" + this.state.title + ".svg");
    };
    this.onRemix = () => {
      // Prepare the current state:
      const initial = this.state.state.current as State;
      initial.resetUI();
      const fs = new FatState(initial);
      // Create a new project based on it
      const newProj = new Project(
        State.revive(initial.toJSON()),
        ProjectAction.Fork,
        this.state.proj.license as ProjectLicense,
        fs
      );
      newProj.parentId = this.state.proj.id;
      newProj.id = null;
      newProj.title = this.state.title + " Remix";
      // start clean with refresher
      this.refresher.refreshNewProject(newProj);
      this.exit();
    };
  }
  public setInitialState(s: State) {
    this.runtime.setInitialState(s);
  }
  public getInitialState(): Promise<State> {
    return this.runtime.getInitialState();
  }
  private stopLoop() {
    if (this.runtime.playerLoop) {
      clearInterval(this.runtime.playerLoop);
      this.runtime.playerLoop = null;
      this.state.isPlaying = false;
      this.refresher.refreshRuntimeOnly(this.runtime);
    }
  }
  private updateVersion() {
    const v = this.state.state.version;
    let updateDOM = false;
    if (v === 0) {
      updateDOM = this.state.isAtStart !== true || this.state.isAtEnd;
      this.state.isAtStart = true;
      this.state.isAtEnd = false;
    } else if (v === this.state.state.maxVersion) {
      updateDOM = this.state.isAtEnd !== true || this.state.isAtStart;
      this.state.isAtEnd = true;
      this.state.isAtStart = false;
    } else {
      updateDOM = this.state.isAtEnd || this.state.isAtStart;
      this.state.isAtEnd = false;
      this.state.isAtStart = false;
    }
    this.refresher.refreshPlayerOnly(this.state);
    if (updateDOM) {
      this.refresher.refreshDOMOnly();
    }
  }
  private onTimeTravelError(e) {
    // TODO: handle error
  }
  private paint(s: Readonly<State>) {
    if (!this.runtime.playerImg || !this.runtime.playerCtx) {
      return;
    }
    const { svg, viewbox } = s.createSVG();
    // TODO: properly update the viewbox: const newVB = viewbox.slice(2);
    this.state.currentViewBox = this.state.thumbnailSvgViewBox;
    const finalSVG = PlayerCanvasPainter.SVGHEAD(
      svg,
      this.state.canvasWidth,
      this.state.canvasHeight,
      this.state.currentViewBox
    );
    this.runtime.playerImg.src = finalSVG;
  }
}
