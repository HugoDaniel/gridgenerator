import { FatState } from './fat';
import { Project } from './project';

export class PlayerState {
	public state: FatState;
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
	public readonly proj: Project;
	constructor(proj: Project) {
		if (!proj.svg || !proj.svgViewBox) {
			console.log('NO PLAYER STATE')
			throw new Error('Cannot create player state');
		}
		console.log('PLAYER STATE')
		this.state = proj.fatState;
		this.thumbnailSvg = proj.svg;
		this.isPlaying = false;
		this.isAtStart = false;
		this.isAtEnd = true;
		this.thumbnailSvgViewBox = proj.svgViewBox;
		this.finalVersion = this.state.maxVersion;
		this.currentViewBox = proj.svgViewBox;
		this.title = proj.title || 'Untitled';
		this.proj = proj;
	}
}
