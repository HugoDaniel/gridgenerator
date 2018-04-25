import { IGridDimension } from '../layer/grid';
export enum ExportEditorFormat { SVG = 1, PNG }
export enum ExportEditorMode { All = 1, Shapes }
export class UIExportEditor {
	public primaryActionTitle: string;
	// work exporter:
	public sqSize: number;
	public dim: IGridDimension | null;
	public format: ExportEditorFormat;
	public mode: ExportEditorMode;
	// shape exporter:
	public shapes: string[];
	public shapeFills: string[];
	public selected: string[];
	constructor(dim: IGridDimension | null, shapeOutline: string, shapeRes: number) {
		this.primaryActionTitle = 'Export';
		this.sqSize = 128;
		this.format = ExportEditorFormat.SVG;
		this.mode = ExportEditorMode.All;
		this.dim = dim;
	}
}
