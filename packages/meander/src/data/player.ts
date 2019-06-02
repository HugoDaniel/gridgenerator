import { Project, ProjectActions, ProjectState } from "./project";

export class PlayerState<
  A extends ProjectActions<A>,
  S extends ProjectState<S>
> {
  public state: A;
  public thumbnailSvg: string;
  public thumbnailSvgViewBox: number[];
  public currentViewBox: number[];
  public isPlaying: boolean;
  public isAtEnd: boolean;
  public isAtStart: boolean;
  public canvasWidth: number;
  public canvasHeight: number;
  public finalVersion: number;
  public title: string;
  public readonly proj: Project<S, A>;
  constructor(proj: Project<S, A>) {
    if (!proj.svg || !proj.svgViewBox) {
      console.log("NO PLAYER STATE");
      throw new Error("Cannot create player state");
    }
    this.state = proj.state;
    this.thumbnailSvg = proj.svg;
    this.isPlaying = false;
    this.isAtStart = false;
    this.isAtEnd = true;
    this.thumbnailSvgViewBox = proj.svgViewBox;
    this.finalVersion = this.state.maxVersion;
    this.currentViewBox = proj.svgViewBox;
    this.title = proj.title || "Untitled";
    this.proj = proj;
  }
}
