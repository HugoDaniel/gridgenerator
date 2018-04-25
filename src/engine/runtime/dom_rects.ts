export class DOMRects {
	public shapeEditor: DOMRect | ClientRect | null;
	public colorPicker: DOMRect | ClientRect | null;
	public player: DOMRect | ClientRect | null;
	public shapeEditorRect(): DOMRect | ClientRect {
		const possibleElems = document.getElementsByClassName('ShapeGrid');
		if (possibleElems.length < 1) {
			throw new Error('Cannot get bounding rect: .ShapeGrid element not found');
		}
		const shapeElem = possibleElems[0];
		this.shapeEditor = shapeElem.getBoundingClientRect();
		return this.shapeEditor;
	}
	public playerRect(): DOMRect | ClientRect {
		const possibleElems = document.getElementsByClassName('PlayerCanvas');
		if (possibleElems.length < 1) {
			throw new Error('Cannot get bounding rect: .PlayerCanvas element not found');
		}
		const playerElem = possibleElems[0];
		this.player = playerElem.getBoundingClientRect();
		return this.player;
	}
	public colorPickerRect(): DOMRect | ClientRect {
		const possibleElems = document.getElementsByClassName('ColorCanvas');
		if (possibleElems.length < 1) {
			throw new Error('Cannot get bounding rect: .ColorCanvas element not found');
		}
		const colorPickerElem = possibleElems[0];
		this.colorPicker = colorPickerElem.getBoundingClientRect();
		return this.colorPicker;
	}
	public isInside(x: number, y: number, r: DOMRect | ClientRect) {
		const xInside = x >= r.left && x <= (r.left + r.width);
		const yInside = y >= r.top && y <= (r.top + r.height);
		return xInside && yInside;
	}
}
