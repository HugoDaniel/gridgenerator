export enum PublishState { Success = 1, Loading, Error, Normal }
export enum PublishAt { Metadata = 1, License }
export class UIPublishEditor {
	public at: PublishAt;
	public primaryActionTitle: string;
	private _svg: string;
	public state: PublishState;
	public license: string;
	public title: string | null;
	public desc: string | null;
	public errorMsg: string;
	constructor() {
		this.license = 'CC0';
		this.at = PublishAt.Metadata;
		this.primaryActionTitle = 'Publish';
		this.title = null;
		this.desc = null;
		this.errorMsg = '';
		this.state = PublishState.Normal;
	}
	/*
	set svg(s: string) {
  	this._svg = `data:image/svg+xml;charset=utf-8,${s}`;
	}
	get svg() {
		return this._svg;
	}
	*/
}
