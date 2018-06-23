export function resolution(w: number, h: number, idealW: number, idealH: number): { offsetX: number, offsetY: number, width: number, height: number } {
	const aspect = w / h;
	const idealAspect = idealW / idealH;
	if (aspect > idealAspect) {
		const newWidth = idealAspect * h;
		const offset = (w - newWidth) / 2;
		return ({
			offsetX: offset,
			offsetY: 0,
			width: w - offset,
			height: h
		});
	} else {
		const newHeight = w / idealAspect;
		const offset = (h - newHeight) / 2;
		return ({
			offsetX: 0,
			offsetY: offset,
			width: w,
			height: h - offset
		});
	}
}
