import { State } from '../../../data';

export class PlayerCanvasPainter {
	public static PAINT(ctx: CanvasRenderingContext2D, _state: Readonly<State>, img: HTMLImageElement, viewbox: number[]) {
		const _w = ctx.canvas.width;
		const _h = ctx.canvas.height;
		ctx.clearRect(0, 0, _w, _h);
		const { w, h, vbw, vbh } = this.getWH(_w, _h, viewbox);
		const cvbw = Math.round(( Math.max(_w, w) - Math.min(_w, w)) / 2);
		const cvbh = Math.round(( Math.max(_h, h) - Math.min(_h, h)) / 2);
		// console.log('CENTER AT', cvbw, cvbh, 'changed wh', w, h, 'canvas wh', _w, _h, 'viewbox', viewbox);
		ctx.drawImage(img, cvbw, cvbh);
	}
	private static getWH(_w: number, _h: number, viewbox: number[]) {
		const vbw = viewbox[0];
		const vbh = viewbox[1];
		let w = _w;
		let h = _h;
		if (w > h) {
			w = (vbw / vbh) * _h;
		} else {
			h = (vbh / vbw) * _w;
		}
		return { w, h, vbw, vbh };
	}
	public static SVGHEAD(svg: string, _w: number, _h: number, viewbox: number[]): string {
		const { w, h, vbw, vbh } = this.getWH(_w, _h, viewbox);
		// center viewbox:
		// console.log('SVG WH', w, h, vbw, vbh)
		// console.log('CENTER VIEWBOX', `viewBox="${-cvbw} ${-cvbw} ${vbw + cvbw} ${vbh + cvbh}"`);
		const fullsvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMin meet" viewBox="0 0 ${vbw} ${vbh}">${svg}</svg>`;
		return `data:image/svg+xml,${encodeURIComponent(fullsvg)}`;
	}
	public static SVG(_state: Readonly<State>, w: number, h: number, viewbox: number[]): string {
		return (
			``
		);
	}
}
