export class Loading {
	private fullElem: HTMLElement | null;
	private _isLoadingFullscreen: boolean;
	private fullAnim: number | null;
	constructor() {
		this.initElems();
		this._isLoadingFullscreen = true;
	}
	get isLoadingFullscreen() {
		return this._isLoadingFullscreen;
	}
	private initElems() {
		this.fullElem = document.getElementById('loading');
	}
	public startFullscreen(): Promise<Loading> {
		const elem = this.fullElem;
		if (elem && !this._isLoadingFullscreen) {
			this._isLoadingFullscreen = true;
			elem.classList.remove('o-0');
			elem.classList.add('o-100');
			elem.classList.add('blur-6');
			elem.classList.remove('dn');
			elem.classList.add('flex');
			return new Promise( (resolve) => {
				this.fullAnim = setTimeout(() => {
					this.fullAnim = null;
					resolve(this);
				}, 250);
			});
		} else {
			this.initElems();
			return Promise.resolve(this);
		}
	}
	public stopFullscreen(): Promise<Loading> {
		const elem = this.fullElem;
		if (elem) {
			elem.classList.remove('o-100');
			elem.classList.remove('o-90');
			elem.classList.add('o-0');
			const mainElem = document.getElementById('app');
			if (mainElem) {
				mainElem.classList.remove('blur-6');
			}
			return new Promise( (resolve) => {
				this.fullAnim = setTimeout(() => {
					elem.classList.remove('flex');
					elem.classList.add('dn');
					this.fullAnim = null;
					this._isLoadingFullscreen = false;
					resolve(this);
				}, 250);
			});
		} else {
			this.initElems();
			return Promise.resolve(this);
		}
	}
}
