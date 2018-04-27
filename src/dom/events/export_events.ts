import { FatState, UIExportEditor } from '../../data';
import { Runtime } from '../../engine';
import { Movement } from '../../engine/runtime/movement';
import { downloadFile, IEventHandler } from '../common';
import { Refresher } from './refresher';

export class ExportEvents implements IEventHandler {
	public runtime: Runtime;
	public state: FatState;
	public refresher: Refresher;
	public onFormatChange: (fmt: number, e: Event) => void;
	public onSizeChange: (size: number, e: Event) => void;
	public onExport: (data: UIExportEditor, e?: Event) => void;
	// event handler:
	public onMouseDown: (e: MouseEvent) => void;
	public onMouseMove: (e: MouseEvent) => void;
	public onMouseUp: (e: MouseEvent) => void;
	public onTouchStart: (e: TouchEvent) => void;
	public onTouchMove: (e: TouchEvent) => void;
	public onTouchEnd: (e: TouchEvent) => void;
	public onTouchCancel: (e: TouchEvent) => void;
	constructor(rt: Runtime, s: FatState, refresher: Refresher) {
		this.runtime = rt;
		this.state = s;
		this.refresher = refresher;
		this.onFormatChange = (fmt, e) => {
			e.preventDefault();
			this.state = this.state.exportFormatChange(fmt);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onSizeChange = (size, e) => {
			e.preventDefault();
			this.state = this.state.exportSizeChange(size);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onExport = (data, e) => {
			if (e) {
				e.preventDefault();
			}
			if (data.dim) {
				const svg = this.state.current.renderSVG(data.dim, data.dim.width * data.sqSize, data.dim.height * data.sqSize);
				const fname = 'GridGenerator.svg';
				downloadFile(svg, fname);
			}
		};
		this.onMouseDown = (e) => {
			return;
		};
		this.onMouseUp = (e) => {
			return;
		};
		this.onMouseMove = (e) => {
			return;
		};
		this.onTouchStart = (e) => {
			return;
		};
		this.onTouchMove = (e) => {
			return;
		};
		this.onTouchEnd = (e) => {
			return;
		};
		this.onTouchCancel = (e) => {
			return;
		};
	}
}
