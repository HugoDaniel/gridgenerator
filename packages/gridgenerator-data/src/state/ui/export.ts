import { IGridDimension } from "../layer/grid";
import { resolution } from "../math/aspect";
export enum ExportAt {
  Image = 1,
  Video,
  Preparing,
  Done,
  Error
}
export enum ExportEditorFormat {
  SVG = 1,
  PNG,
  GIF,
  MP4
}
export enum ExportEditorMode {
  All = 1,
  Shapes
}
export enum ExportSize {
  FullHD = 1080,
  HDReady = 720,
  UHD = 3840
}
export class UIExportEditor {
  public at: ExportAt;
  public primaryActionTitle: string;
  // work exporter:
  public dim: IGridDimension | null;
  public format: ExportEditorFormat;
  public mode: ExportEditorMode;
  public size: ExportSize;
  public needsPayment: boolean;
  public isLoading: boolean;
  public patternSize: number;
  public imgPreview: string | null;
  public imgViewbox: [number, number, number, number] | null;
  public fname: string | null;
  public error: string | null;
  // shape exporter:
  public shapes: string[];
  public shapeFills: string[];
  public selected: string[];
  constructor(dim: IGridDimension | null) {
    this.at = ExportAt.Image;
    this.primaryActionTitle = "Export";
    this.size = ExportSize.FullHD;
    this.format = ExportEditorFormat.SVG;
    this.mode = ExportEditorMode.All;
    this.dim = dim;
    this.needsPayment = true;
    this.isLoading = true;
    this.patternSize = 1;
    this.fname = null;
  }
  public setPreview(art: {
    svg: string;
    viewbox: [number, number, number, number];
  }) {
    this.imgPreview = art.svg;
    this.imgViewbox = art.viewbox;
  }
  public calcres(): {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  } {
    let idealW;
    let idealH;
    switch (this.size) {
      case ExportSize.FullHD:
        idealW = 1920;
        idealH = 1080;
        break;
      case ExportSize.HDReady:
        idealW = 1280;
        idealH = 720;
        break;
      case ExportSize.UHD:
        idealW = 3840;
        idealH = 2160;
        break;
    }
    if (!this.dim) {
      return { width: idealW, height: idealH, offsetX: 0, offsetY: 0 };
    } else {
      /*
			let w;
			let h;
			if (this.dim.width > this.dim.height) {
				w = idealW;
				h = (this.dim.width / this.dim.height) * idealH;
			} else {
				w = (this.dim.height / this.dim.width) * idealH;
				h = idealH;
			}
			return resolution(w, h, idealW, idealH);
			*/
      const w = idealW;
      const h = (this.dim.height * w) / this.dim.width;
      return { width: w, height: h, offsetX: 0, offsetY: 0 };
    }
  }
}
