import { State, Wheel, WheelMode } from '../../../data';
import { Movement } from '../../runtime/movement';
import { IColorCanvasMovementDetail } from '../../runtime/movement/color_canvas';
import { ColorPickerCanvasCtx } from '../context';

export class ColorCanvasPainter {
	public static INIT(ctx: ColorPickerCanvasCtx, _state: Readonly<State>) {
		const state = _state.fills.colors.editor;
		const sliceSize = ctx.width / 2;
		const r1 = sliceSize * state.sliceCircleRatio1;
		const r2 = sliceSize * state.sliceCircleRatio2;
		const cx = ctx.width / 2;
		const cy = cx;
		// const strokes = state.colors;
		// initialize the canvas cache
		ctx.canvasCache = {};
		ctx.canvasCache[state.mode] = null;
		// clear all and draw a white circle as background
		ColorCanvasPainter._renderBackground(ctx, state, cx, cy);
		// what wheel to draw
		if (state.mode === WheelMode.WHEEL_HERING_MODE) {
			// Paint the hering wheel
			ColorCanvasPainter._heringCircle(ctx, ctx.width, state.heringColors, state.hering, state.ringRatio1, state.ringRatio2);
		} else if (state.mode === WheelMode.WHEEL_BRIGHTNESS_MODE) {
			// const color = state.colors[state.selectedSlice];
			ColorCanvasPainter._unitCircle(ctx, ctx.width, state.selectedSlice, state.slices, state.ringRatio1, state.ringRatio2, state.brightnessColors, state.brightnessOffset, state.mode);
		} else if (state.mode === WheelMode.WHEEL_SATURATION_MODE) {
			// const color = state.colors[state.selectedSlice];
			ColorCanvasPainter._unitCircle(ctx, ctx.width, state.selectedSlice, state.slices, state.ringRatio1, state.ringRatio2, state.saturationColors, state.saturationOffset, state.mode);
		}
		// Paint the circle slices
		ColorCanvasPainter._circleSliceN(ctx.ctx, cx, cy, state.slices, r1, r2, 180 / state.slices, state.colors, state.colors);
		// Paint the selected color
		ColorCanvasPainter._renderSelectedColor(ctx, state);
		ColorCanvasPainter._renderSliceLines(ctx, state, cx, cy);
		ColorCanvasPainter._renderDragInfo(ctx, state, cx, cy);
	}

	private static _renderDragInfo(context: ColorPickerCanvasCtx, wheel: Wheel, cx: number, cy: number) {
		const selected = wheel.selectedSlice;
		const size = context.width;
		const sliceAngle = 2 * Math.PI / wheel.slices;
		const r = 3;
		const distOut = wheel.ringRatio1 * size - ((wheel.ringRatio1 - wheel.ringRatio2) * size / 2);
		const a = selected * sliceAngle;
		const halfSlice = sliceAngle / 2;
		const xd = cx + Math.cos(a + halfSlice) * distOut;
		const yd = cy + Math.sin(a + halfSlice) * distOut;
		const ctx = context.ctx;
		ctx.beginPath();
		ctx.moveTo(xd, yd);
		ctx.arc(cx, cy, distOut, a + halfSlice, a + sliceAngle, false); // line down
		const downX = cx + Math.cos(a + sliceAngle) * distOut;
		const downY = cy + Math.sin(a + sliceAngle) * distOut;
		const arrowLen = 1.25;
		const downXarrow1 = cx + Math.cos(a + sliceAngle / arrowLen) * (distOut + r);
		const downYarrow1 = cy + Math.sin(a + sliceAngle / arrowLen) * (distOut + r);
		const downXarrow2 = cx + Math.cos(a + sliceAngle / arrowLen) * (distOut - r);
		const downYarrow2 = cy + Math.sin(a + sliceAngle / arrowLen) * (distOut - r);
		ctx.moveTo(downX, downY);
		ctx.lineTo(downXarrow1, downYarrow1);
		ctx.lineTo(downXarrow2, downYarrow2);
		ctx.lineTo(downX, downY);

		const xu = cx + Math.cos(a - halfSlice) * distOut;
		const yu = cy + Math.sin(a - halfSlice) * distOut;
		ctx.moveTo(xu, yu);
		ctx.arc(cx, cy, distOut, a - halfSlice, a - sliceAngle, true); // line up
		const upX = cx + Math.cos(a - sliceAngle) * distOut;
		const upY = cy + Math.sin(a - sliceAngle) * distOut;
		const upXarrow1 = cx + Math.cos(a - sliceAngle / arrowLen) * (distOut - r);
		const upYarrow1 = cy + Math.sin(a - sliceAngle / arrowLen) * (distOut - r);
		const upXarrow2 = cx + Math.cos(a - sliceAngle / arrowLen) * (distOut + r);
		const upYarrow2 = cy + Math.sin(a - sliceAngle / arrowLen) * (distOut + r);
		ctx.moveTo(upX, upY);
		ctx.lineTo(upXarrow1, upYarrow1);
		ctx.lineTo(upXarrow2, upYarrow2);
		ctx.lineTo(upX, upY);
		ctx.fillStyle = '#FFFFFF';
		ctx.strokeStyle = '#FFFFFF';
		ctx.fill();
		ctx.stroke();
	}

	private static _renderSliceLines(context, wheel, cx, cy) {
		const selected = wheel.selectedSlice;
		const size = context.width;
		const sliceAngle = 2 * Math.PI / wheel.slices;
		// render the triangle
		const a1 = selected * sliceAngle
			+ sliceAngle / 2;
		const a2 = selected * sliceAngle
			- sliceAngle / 2;
		// distance along the radius outwards the circle
		// in relation to the center
		const distIn = wheel.sliceCircleRatio1 * (size / 2);
		const distOut = wheel.ringRatio1 * size;
		const x1in = cx + Math.cos(a1) * distIn;
		const y1in = cy + Math.sin(a1) * distIn;
		const x1out = cx + Math.cos(a1) * distOut;
		const y1out = cy + Math.sin(a1) * distOut;
		const x2in = cx + Math.cos(a2) * distIn;
		const y2in = cy + Math.sin(a2) * distIn;
		const x2out = cx + Math.cos(a2) * distOut;
		const y2out = cy + Math.sin(a2) * distOut;
		// const r = 2;
		const ctx = context.ctx;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x1in, y1in);
		ctx.lineTo(x1out, y1out);
		ctx.moveTo(x2in, y2in);
		ctx.lineTo(x2out, y2out);
		ctx.strokeStyle = '#FFFFFF';
		ctx.stroke();
		return a2;
	}

	private static _renderPrecision(context: ColorPickerCanvasCtx, wheel, cx, cy, curAngle) {
		// const selected = wheel.selectedSlice;
		const size = context.width;
		const sliceAngle = 2 * Math.PI / wheel.slices;
		// render the triangle
		const a2 = ColorCanvasPainter._renderSliceLines(context, wheel, cx, cy);
		// render the triangle
		// const triR = wheel.sliceCircleRatio1 * (size / 2);
		// ColorCanvasPainter._renderTris(ctx, wheel.slices, triR, cx, cy, selected, "#FFFFFF"); // wheel.colors[selected]);
		// render the precision lines
		// let angle = wheel.hering;
		const rulerLen = 8;
		const ctx = context.ctx;
		ctx.beginPath();
		const rulerDistIn = wheel.ringRatio2 * size;
		const totalRulerLines = 6;
		for (let i = 0; i <= totalRulerLines; i++) {
			const offset = curAngle % sliceAngle;
			const lineSpacingAngle = sliceAngle / (totalRulerLines + 1);
			const apos = a2 + i * lineSpacingAngle;
			let a = offset;
			if ((a + apos) > (a2 + sliceAngle)) {
				a = a2 + offset - ((totalRulerLines - i + 1) * lineSpacingAngle);
			} else if ((a - apos) < a2) {
				a = sliceAngle + a2 + offset - ((totalRulerLines - i + 1) * lineSpacingAngle);
			} else {
				a += apos;
			}
			const extraLong = i % 4 === 0 ? 5 : 0;
			const rulerX1 = cx + Math.cos(a) * rulerDistIn;
			const rulerY1 = cy + Math.sin(a) * rulerDistIn;
			const rulerX2 = cx + Math.cos(a) * (rulerDistIn + rulerLen + extraLong);
			const rulerY2 = cy + Math.sin(a) * (rulerDistIn + rulerLen + extraLong);
			ctx.moveTo(rulerX1, rulerY1);
			ctx.lineTo(rulerX2, rulerY2);
		}
		ctx.strokeStyle = '#FFFFFF';
		ctx.stroke();
	}

	private static _renderBackground(canvas: ColorPickerCanvasCtx, wheel: Wheel, cx: number, cy: number): void {
		canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
		canvas.ctx.beginPath();
		canvas.ctx.arc(cx, cy, canvas.width * (wheel.ringRatio1), 0, 2 * Math.PI, false);
		canvas.ctx.closePath();
		canvas.ctx.fillStyle = '#FFFFFF';
		canvas.ctx.fill();
		canvas.ctx.strokeStyle = '#555555';
		canvas.ctx.stroke();
	}

	// list of actions that trigger a full refresh of the canvas:
	public static selectColor = ColorCanvasPainter.INIT;
	public static pickerMode = ColorCanvasPainter.INIT;
	public static pickColor = ColorCanvasPainter.INIT;
	public static editorSelectShape = ColorCanvasPainter.INIT;
	public static editRandomColors = ColorCanvasPainter.INIT;
	public static stopMovement = ColorCanvasPainter.INIT;
	public static enterColorSwitch = ColorCanvasPainter.INIT;

	public static startMovement(_state: Readonly<State>, mov: Movement, rect: DOMRect | ClientRect): IColorCanvasMovementDetail | number | null {
		const wheel = _state.fills.colors.editor;
		const size = rect.width;
		const cx = size / 2;
		const cy = cx;
		const sliceR1 = cx * wheel.sliceCircleRatio1;
		const sliceR2 = cx * wheel.sliceCircleRatio2;
		const heringR1 = size * wheel.ringRatio1;
		const heringR2 = size * wheel.ringRatio2;
		const x = mov.startX - rect.left;
		const y = mov.startY - rect.top;
		const angle = Math.atan2(cy - y, cx - x) + Math.PI;
		const circleTouch = Math.pow(x - cx, 2) + Math.pow(y - cy, 2);
		const sliceAngle = 2 * Math.PI / wheel.slices;
		if (circleTouch <= sliceR2 * sliceR2 && circleTouch >= sliceR1 * sliceR1) {
			// touched a color slice
			let slice = (0.5 + (angle / sliceAngle));
			// error adjustments
			if (slice > 15.3) {
				slice -= 0.1;
			}
			slice = Math.floor(slice % 16);
			return slice;
		} else if (circleTouch <= heringR1 * heringR1
			&& circleTouch >= heringR2 * heringR2) {
			if (wheel.mode === WheelMode.WHEEL_HERING_MODE) {
				const hRot = wheel.hering;
				const heringDetail = {
					in: WheelMode.WHEEL_HERING_MODE,
					angle: angle - hRot
				};
				return (heringDetail);
			} else if (wheel.mode === WheelMode.WHEEL_BRIGHTNESS_MODE) {
				const brightnessDetail = {
					in: WheelMode.WHEEL_BRIGHTNESS_MODE,
					initValue: wheel.brightness,
					startAngle: angle
				};
				return (brightnessDetail);
			} else if (wheel.mode === WheelMode.WHEEL_SATURATION_MODE) {
				const saturationDetail = {
					in: WheelMode.WHEEL_SATURATION_MODE,
					initValue: wheel.saturation,
					startAngle: angle
				};
				return (saturationDetail);
			}
		}
		return null;
	}
	private static _renderTris(ctx, slices, posR, cx, cy, selected, color) {
		const r = 8;
		const w = 4;
		const sliceAngle = 2 * Math.PI / slices;
		const a = selected * sliceAngle;
		const x = cx + Math.cos(a) * posR;
		const y = cy + Math.sin(a) * posR;
		ctx.beginPath();
		// ctx.arc(x, y, r, a - Math.PI/2, a + Math.PI/2, true);
		// ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
		ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
		ctx.lineTo(cx + Math.cos(a + sliceAngle / w) * posR, cy + Math.sin(a + sliceAngle / w) * posR);
		ctx.lineTo(cx + Math.cos(a - sliceAngle / w) * posR, cy + Math.sin(a - sliceAngle / w) * posR);
		ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
		ctx.closePath();
		ctx.fillStyle = color;
		// ctx.strokeStyle = "#555555";
		ctx.fill();
		// ctx.stroke();
	}
	private static _renderSelectedColor(canvas: ColorPickerCanvasCtx, wheel: Wheel) {
		const size = canvas.width;
		const r = 0.1 * size;
		const cx = size / 2;
		const cy = cx;
		canvas.ctx.beginPath();
		canvas.ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
		canvas.ctx.closePath();
		canvas.ctx.fillStyle = wheel.getSelectedColor();
		canvas.ctx.fill();

		ColorCanvasPainter._renderTris(
			canvas.ctx, wheel.slices, r * 1.21, cx, cy, wheel.selectedSlice, '#ffffff'
		);
	}

	public static wheelMoving(ctx: ColorPickerCanvasCtx, state: Readonly<State>) {
		/*
		if (!state.movement.isMoving) {
			return false;
		}
		*/
		if (state.fills.colors.editor.mode === WheelMode.WHEEL_HERING_MODE) {
			ColorCanvasPainter.heringMove(ctx, state);
		} else if (state.fills.colors.editor.mode === WheelMode.WHEEL_BRIGHTNESS_MODE) {
			const c = state.fills.colors.editor.brightnessColors;
			ColorCanvasPainter.unitMove(ctx, state, c, state.fills.colors.editor.brightnessOffset);
		} else if (state.fills.colors.editor.mode === WheelMode.WHEEL_SATURATION_MODE) {
			const c = state.fills.colors.editor.saturationColors;
			// const s = Array("#f1f1f1").fill(state.wheel.slices);
			ColorCanvasPainter.unitMove(ctx, state, c, state.fills.colors.editor.saturationOffset);
		}
	}

	public static unitMove(canvas: ColorPickerCanvasCtx, state: Readonly<State>, wheelColors, offset) {
		const wheel = state.fills.colors.editor;
		const sliceSize = canvas.width / 2;
		const r1 = sliceSize * wheel.sliceCircleRatio1;
		const r2 = sliceSize * wheel.sliceCircleRatio2;
		const cx = canvas.width / 2;
		const cy = cx;
		const ctx = canvas.ctx;
		ColorCanvasPainter._renderBackground(canvas, wheel, cx, cy);
		// Paint the wheel
		ColorCanvasPainter._unitCircle(canvas, canvas.width, wheel.selectedSlice, wheel.slices, wheel.ringRatio1, wheel.ringRatio2, wheelColors, offset, wheel.mode);
		// Paint the circle slices
		ColorCanvasPainter._circleSliceN(ctx, cx, cy, wheel.slices, r1, r2, 180 / wheel.slices, wheel.colors, wheel.colors);
		// Paint the selected slice circle
		ColorCanvasPainter._renderSelectedColor(canvas, state.fills.colors.editor);
		ColorCanvasPainter._renderPrecision(canvas, state.fills.colors.editor, cx, cy, 2 * Math.PI - offset * Math.PI / 180);
	}

	public static heringMove(ctx: ColorPickerCanvasCtx, state: Readonly<State>) {
		const wheel = state.fills.colors.editor;
		const sliceSize = ctx.width / 2;
		const r1 = sliceSize * wheel.sliceCircleRatio1;
		const r2 = sliceSize * wheel.sliceCircleRatio2;
		const cx = ctx.width / 2;
		const cy = cx;
		ColorCanvasPainter._renderBackground(ctx, wheel, cx, cy);
		// Paint the circle slices
		ColorCanvasPainter._circleSliceN(ctx.ctx, cx, cy, wheel.slices, r1, r2, 180 / wheel.slices, wheel.colors, wheel.colors);
		// Paint the hering wheel
		ColorCanvasPainter._heringCircle(ctx, ctx.width, wheel.heringColors, wheel.hering, wheel.ringRatio1, wheel.ringRatio2);
		// Paint the selected color
		ColorCanvasPainter._renderSelectedColor(ctx, wheel);
		ColorCanvasPainter._renderPrecision(ctx, wheel, cx, cy, wheel.hering);
	}

	private static _createCacheCtx(size: number, canvas: ColorPickerCanvasCtx, mode: WheelMode, value): CanvasRenderingContext2D {
		const canvasElem = document.createElement('canvas');
		canvasElem.width = size;
		canvasElem.height = size;
		const cacheCtx = canvasElem.getContext('2d');
		if (!cacheCtx) {
			throw new Error('Unable to create color picker cache 2d context');
		}
		canvas.canvasCache[mode] = { ctx: cacheCtx, elem: canvasElem, init: value };
		return cacheCtx;
	}

	// renders the circle wheel for a unit value
	// size is the width and height of the canvas
	// brightness is the current brightness value (the angle of the wheel)
	// color is the color value
	// pos is the current selected slice
	// offset is the angle (deg) of the cur. unit value (brightness or sat.)
	private static _unitCircle(realCtx: ColorPickerCanvasCtx, size, pos, slices, ratio1, ratio2, colors, offset, mode) {
		// check if cache is present, and use it
		// cache usage is important because this function renders a lot of gradients
		// which is a heavy operation
		if (realCtx.canvasCache[mode]) {
			const cached = realCtx.canvasCache[mode];
			const diff = 0.0174533 * (cached.init - offset);
			// ^ calcs the current angle traveled and converts it
			// from deg to radians
			const center = size / 2;
			realCtx.ctx.translate(center, center);
			realCtx.ctx.rotate(diff);
			realCtx.ctx.drawImage(cached.elem, -center, -center, size, size);
			realCtx.ctx.rotate(-diff);
			realCtx.ctx.translate(-center, -center);
			return;
		}
		// cache not present: draw the whole circle and add it to the cache
		const ctx = ColorCanvasPainter._createCacheCtx(size, realCtx, mode, offset);
		if (!ctx) {
			return;
		}
		// find the starting angle
		const r1 = size * ratio1;
		const r2 = size * ratio2;
		const lineW = r1 - r2;
		const rmid = r1 + (r2 - r1) / 2;
		const cx = size / 2;
		const cy = cx;
		const total = colors.length;
		const oneDeg = 2 * Math.PI / total;
		const curSliceAngle = (2 * Math.PI / slices) * pos;
		const sAngle = curSliceAngle;
		let x0 = cx + rmid * Math.cos(sAngle);
		let y0 = cy + rmid * Math.sin(sAngle);
		ctx.moveTo(x0, y0);
		for (let prev = total - 1, i = 0; i < total; prev = i, i++) {
			const deg = oneDeg * (i + 1);
			const x1 = cx + rmid * Math.cos(sAngle + deg);
			const y1 = cy + rmid * Math.sin(sAngle + deg);
			ctx.beginPath();
			const g = ctx.createLinearGradient(x0, y0, x1, y1);
			g.addColorStop(0, colors[(prev + offset) % total]);
			g.addColorStop(1, colors[(i + offset) % total]);
			const angle1 = sAngle + (oneDeg * i);
			const angle2 = angle1 + (2 * oneDeg);
			ctx.arc(cx, cy, rmid, angle1, angle2, false);
			// ctx.lineTo(x1, y1);
			ctx.lineWidth = lineW;
			// ctx.strokeStyle = "#555555";
			ctx.strokeStyle = g;
			ctx.stroke();
			x0 = x1;
			y0 = y1;
		}
		ctx.lineWidth = 1;
		realCtx.ctx.drawImage(realCtx.canvasCache[mode].elem, 0, 0);
	}

	private static _heringCircle(canvas: ColorPickerCanvasCtx, size: number, colors: string[], rot: number, ratio1: number, ratio2: number) {
		const mode = WheelMode.WHEEL_HERING_MODE;
		// check if cache is present, and use it
		if (canvas.canvasCache[mode]) {
			const cached = canvas.canvasCache[mode];
			const diff = rot - cached.init;
			// ^ calcs the current angle traveled
			const center = size / 2;
			canvas.ctx.translate(center, center);
			canvas.ctx.rotate(diff);
			canvas.ctx.drawImage(cached.elem, -center, -center, size, size);
			canvas.ctx.rotate(-diff);
			canvas.ctx.translate(-center, -center);
			return;
		}
		// cache not available, create it and draw the circle
		const ctx = ColorCanvasPainter._createCacheCtx(size, canvas, mode, rot);
		if (!ctx) {
			return;
		}
		const sin = Math.sin(rot);
		const cos = Math.cos(rot);
		const cx = size / 2;
		const cy = cx;
		const r1 = size * ratio1;
		const r2 = size * ratio2;
		const stroke = '#555555';
		const strokeWidth = 1;
		// right:
		ctx.beginPath();
		ctx.moveTo(cx - r1 * sin, cy + r1 * cos);
		ctx.arc(cx, cy, r2, Math.PI / 2 + rot, 3 * Math.PI / 2 + rot, true);
		ctx.arc(cx, cy, r1, 3 * Math.PI / 2 + rot, Math.PI / 2 + rot, false);
		ctx.fillStyle = colors[0];
		ctx.fill();
		ctx.strokeStyle = stroke;
		ctx.lineWidth = strokeWidth;
		// left:
		ctx.beginPath();
		ctx.moveTo(cx + r2 * sin, cy - r2 * cos);
		ctx.arc(cx, cy, r1, 3 * Math.PI / 2 + rot, Math.PI / 2 + rot, true);
		ctx.arc(cx, cy, r2, Math.PI / 2 + rot, 3 * Math.PI / 2 + rot, false);
		ctx.fillStyle = colors[2];
		ctx.fill();
		ctx.strokeStyle = stroke;
		ctx.lineWidth = strokeWidth;
		// bottom:
		ctx.beginPath();
		ctx.moveTo(cx + r2 * cos, cy + r2 * sin);
		ctx.ellipse(cx, cy, r2, r1, rot, 0, Math.PI);
		ctx.arc(cx, cy, r2, Math.PI + rot, rot, true);
		ctx.fillStyle = colors[1];
		ctx.fill();
		ctx.strokeStyle = stroke;
		ctx.lineWidth = strokeWidth;
		// top:
		ctx.beginPath();
		ctx.moveTo(cx - r2 * cos, cy - r2 * sin);
		ctx.ellipse(cx, cy, r2, r1, rot, Math.PI, 0);
		ctx.arc(cx, cy, r2, rot, Math.PI + rot, true);
		// ctx.fillStyle = "blue";
		ctx.fillStyle = colors[3];
		ctx.fill();
		ctx.strokeStyle = stroke;
		ctx.lineWidth = strokeWidth;
		// ctx.stroke();
		canvas.ctx.drawImage(canvas.canvasCache[mode].elem, 0, 0);
	}

	// splits the circle in 'n' slices (pizza slices,
	// from a inner circle to the edges), 'r1' is the inner circle radius
	// where the slice stars, and 'r2' is the outter circle where the slice ends
	// 'rot' is the final rotation to apply to the set (in degrees)
	private static _circleSliceN(ctx: CanvasRenderingContext2D, cx, cy, n, r1, r2, rot, fills, strokes) {
		const inner = ColorCanvasPainter._splitCircle(cx, cy, r1, n, rot);
		const outter = ColorCanvasPainter._splitCircle(cx, cy, r2, n, rot);
		const _rot = - rot * Math.PI / 180;
		const splitAngle = 2 * Math.PI / n;
		let xOutPrev = outter[n * 2 - 2];
		let yOutPrev = outter[n * 2 - 1];
		let xInPrev = inner[n * 2 - 2];
		let yInPrev = inner[n * 2 - 1];
		let prevAngle = _rot + (n - 1) * splitAngle;
		// build a list of slices (each slice is a SVG path):
		for (let i = 0; i <= inner.length; i += 2) {
			const j = i / 2;
			const xIn = inner[i];
			const yIn = inner[i + 1];
			const xOut = outter[i];
			const yOut = outter[i + 1];
			if (i > 0) {
				const index = j - 1;
				ctx.beginPath();
				ctx.strokeStyle = strokes[index];
				const color = fills[index];
				ctx.fillStyle = color;
				ctx.moveTo(xInPrev, yInPrev);
				ctx.lineTo(xOutPrev, yOutPrev);
				ctx.arc(cx, cy, r2, prevAngle, _rot + j * splitAngle, false);
				ctx.lineTo(xIn, yIn);
				ctx.arc(cx, cy, r1, _rot + j * splitAngle, prevAngle, true);
				ctx.stroke();
				ctx.fill();
			}
			// update the state for the next path:
			xOutPrev = xOut;
			yOutPrev = yOut;
			xInPrev = xIn;
			yInPrev = yIn;
			prevAngle = _rot + j * splitAngle;
		}
	}

	// split an arc in n parts, rotated in degrees: d
	// x,y -> arc center
	// r -> arc radius
	// n -> number of splits
	// deg -> degrees for rotation
	private static _splitCircle(x: number, y: number, r: number, n: number, deg: number): number[] {
		const result: number[] = [];
		const rot = -deg * Math.PI / 180;
		const splitAngle = 2 * Math.PI / n;
		for (let i = 0; i < n; i++) {
			result.push(x + Math.cos(rot + i * splitAngle) * r);
			result.push(y + Math.sin(rot + i * splitAngle) * r);
		}
		return result;
	}
}
