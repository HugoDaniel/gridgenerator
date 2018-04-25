export enum RuntimeMediaSize { Normal = 1, NotSmall = 30, Large = 60 }

export class Device {
	public readonly mediaSize: RuntimeMediaSize;
	public readonly isShort: boolean; // is there not enough vertical space for all inteded design elements ?
	public width: number;
	public height: number;
	public readonly isInPortrait: boolean; // is height bigger than the width ?
	public readonly hasSystemColorPicker: boolean; // is there support for <input type=color ?
	// touch/mouse events handling
	public isUsingMouse: boolean;
	public dpr: number;
	constructor() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.isUsingMouse = true;
		this.dpr = Math.round(window.devicePixelRatio * 100);
		const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize || '16px');
		if (this.width > fontSize * RuntimeMediaSize.NotSmall) {
			this.mediaSize = RuntimeMediaSize.NotSmall;
			if (this.width > fontSize * RuntimeMediaSize.Large) {
				this.mediaSize = RuntimeMediaSize.Large;
			}
		} else {
			this.mediaSize = RuntimeMediaSize.Normal;
		}
		this.hasSystemColorPicker = Device.hasSystemColorPicker();
		this.isInPortrait = this.width < this.height;
		this.isShort = (this.height < 560 && this.isInPortrait)
								|| (this.width < 560 && !this.isInPortrait);
	}
	public static hasSystemColorPicker(): boolean {
		const i = document.createElement('input');
		i.setAttribute('type', 'color');
		return i.type !== 'text';
	}
}
