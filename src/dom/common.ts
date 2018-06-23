export function getEventX(e: MouseEvent | TouchEvent): number {
	if ((e as TouchEvent).touches) {
		const i = (e as TouchEvent).touches.item(0);
		if (i) {
			return i.clientX;
		} else {
			return -1;
		}
	}
	return ((e as MouseEvent).clientX || (e as MouseEvent).layerX);
}
export function getEventY(e: MouseEvent | TouchEvent): number {
	if ((e as TouchEvent).touches) {
		const i = (e as TouchEvent).touches.item(0);
		if (i) {
			return i.clientY;
		} else {
			return -1;
		}
	}
	return ((e as MouseEvent).clientY || (e as MouseEvent).layerY);
}
export function downloadFile(fileContents: string, filename: string) {
	const filetype = 'text/plain';
	const a = document.createElement('a');
	const dataURI = 'data:' + filetype +
			';base64,' + btoa(fileContents);
	a.href = dataURI;
	a.download = filename;
	const e = document.createEvent('MouseEvents');
	// Use of deprecated function to satisfy TypeScript.
	e.initMouseEvent('click', true, false,
			document.defaultView, 0, 0, 0, 0, 0,
			false, false, false, false, 0, null);
	a.dispatchEvent(e);
}
export interface IEventHandler {
	onMouseDown: (e: MouseEvent) => void;
	onMouseMove: (e: MouseEvent) => void;
	onMouseUp: (e: MouseEvent) => void;
	onTouchStart: (e: TouchEvent) => void;
	onTouchMove: (e: TouchEvent) => void;
	onTouchEnd: (e: TouchEvent) => void;
	onTouchCancel: (e: TouchEvent) => void;
}
export function svgInit(className: string, size: number, zoom: number, margin: number = 10) {
	const m = margin;
	const dimension = zoom !== 0 ? `${size * zoom}px` : `${size}px`;
	return (
		{
			baseProfile: 'basic'
			, className
			, height: dimension
			, version: '1.1'
			, viewBox: `${-m / 2} ${-m / 2} ${size + m} ${size + m}`
			, width: dimension
			, xmlns: 'http://www.w3.org/2000/svg'
		}
	);
}
export function loadScript(src, id?: string): Promise<{}> {
	const tag = document.createElement('script');
	if (id) {
		const elem = document.getElementById(id);
		if (elem) {
			return Promise.resolve({});
		}
		tag.id = id;
	}
	tag.async = false;
	tag.src = src;
	const p = new Promise((resolve, reject) => {
		tag.onload = resolve;
		tag.onerror = reject;
	});
	document.getElementsByTagName('body')[0].appendChild(tag);
	return p;
}
export const doNothing = (e: Event) => e.stopPropagation();

export interface JustClickI {
	onmousemove: (e: Event) => void;
	onmousedown: (e: Event) => void;
	onmouseup: (e: Event) => void;
	ontouchstart: (e: Event) => void;
	ontouchmove: (e: Event) => void;
	ontouchend: (e: Event) => void;
	ontouchcancel: (e: Event) => void;
}
export const justClick: JustClickI = {
	onmousemove: doNothing,
	onmousedown: doNothing,
	onmouseup: doNothing,
	ontouchstart: doNothing,
	ontouchmove: doNothing,
	ontouchend: doNothing,
	ontouchcancel: doNothing
};
export interface MouseEventI {
	onMouseMove: (e: MouseEvent) => void;
	onMouseDown: (e: MouseEvent) => void;
	onMouseUp: (e: MouseEvent) => void;
}
export function addMouse(elem: Element, obj: MouseEventI, addDown: boolean = true) {
	elem.addEventListener('mousemove', obj.onMouseMove);
	elem.addEventListener('mouseup', obj.onMouseUp);
	if (addDown) {
		elem.addEventListener('mousedown', obj.onMouseDown);
	}
}
export function removeMouse(elem: Element, obj: MouseEventI, removeDown: boolean = true) {
	elem.removeEventListener('mousemove', obj.onMouseMove);
	elem.removeEventListener('mouseup', obj.onMouseUp);
	if (removeDown) {
		elem.removeEventListener('mousedown', obj.onMouseDown);
	}
}

export interface TouchEventI {
	onTouchMove: (e: TouchEvent) => void;
	onTouchStart: (e: TouchEvent) => void;
	onTouchEnd: (e: TouchEvent) => void;
	onTouchCancel: (e: TouchEvent) => void;
}
export function addTouch(elem: Element, obj: TouchEventI, addStart: boolean = true) {
	if (addStart) {
		elem.addEventListener('touchstart', obj.onTouchStart);
	}
	elem.addEventListener('touchmove', obj.onTouchMove);
	elem.addEventListener('touchend', obj.onTouchEnd);
	elem.addEventListener('touchcancel', obj.onTouchCancel);
}
export function removeTouch(elem: Element, obj: TouchEventI, removeStart: boolean = true) {
	if (removeStart) {
		elem.removeEventListener('touchstart', obj.onTouchStart);
	}
	elem.removeEventListener('touchmove', obj.onTouchMove);
	elem.removeEventListener('touchend', obj.onTouchEnd);
	elem.removeEventListener('touchcancel', obj.onTouchCancel);
}

export enum UpdateAction { All = 'All', Pan = 'Pan' }
