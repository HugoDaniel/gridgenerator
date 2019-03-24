import { ColorDefaults } from '../color/defaults';
import { RGBColor, RGBColorReviver } from '../color/rgb';
import { FillId } from '../fill_map';
import { VectorMap } from '../math/set';
import { Vector2D } from '../math/vector';
import { ShapeFillSetId } from '../shape/shape';
import { ShapeId } from '../shape_map';
import { Viewport } from '../viewport';
import { GridElement, GridElementReviver } from './grid_element';
import { TilePattern, TilePatternReviver } from './tile_pattern';
export interface IGridDimension {
	width: number;
	height: number;
	maxX: number;
	maxY: number;
	minX: number;
	minY: number;
}
export interface GridReviver {
	ce: GridElementReviver;
	t: number;
	s: Array<[number, number]>;
	ss: number;
	c: Array<[number, number, GridElementReviver]>;
	r: number[];
	bg: number | undefined;
	gc: RGBColorReviver;
	cc: number;
	ca: [number, number];
	p: TilePatternReviver | null;
}
export enum GridType { Square = 1, TriangleH, TriangleV }
export type GridCanvas = VectorMap<GridElement>;
type RotationIndex = number;
export type Rotation = number;
export class Grid {
	private _curElement: GridElement; // used to paint
	private _type: GridType;
	private _shapes: Map<ShapeId, RotationIndex>;
	private _selectedShape: ShapeId;
	private _canvas: GridCanvas;
	private _possibleShapeRotations: Rotation[];
	public background: FillId | undefined;
	private _gridColor: RGBColor;
	public cursorColor: FillId;
	private cursorAt: [number, number];
	public pattern: TilePattern | null;
	public oldPattern: TilePattern | null;
	// ^ previous pattern settings (useful to return to its state after)
	constructor(type: GridType, shapes: ShapeId[], selectedShape: ShapeId, selectedShapeFillId: ShapeFillSetId, canvas: GridCanvas = new VectorMap()) {
		this._curElement = new GridElement(selectedShape, selectedShapeFillId, 0);
		this._type = type;
		this._shapes = this._buildShapes(shapes);
		this._selectedShape = selectedShape;
		this._canvas = canvas;
		// TODO: switch(type) here:
		this._possibleShapeRotations = [0, 1 / 4, 2 / 4, 3 / 4];
		this._gridColor = RGBColor.fromHex('#bebece');
		this.cursorAt = [0, 0];
		this.cursorColor = ColorDefaults.CURSOR;
		this.pattern = null;
		this.oldPattern = null;
	}
	public toJSON(): GridReviver {
		return {
			ce: this._curElement.toJSON(),
			t: this._type,
			s: [...this._shapes.entries()],
			ss: this._selectedShape,
			c: this._canvas.toJSON((e) => e.toJSON()),
			r: this._possibleShapeRotations.slice(0),
			bg: this.background,
			gc: this._gridColor.toJSON(),
			cc: this.cursorColor,
			ca: this.cursorAt.slice(0) as [number, number],
			p: this.pattern ? this.pattern.toJSON() : null
		};
	}
	public static revive(o: GridReviver) {
		const shapes = o.s.map((s) => s[0]);
		const canvas = VectorMap.revive(o.c, GridElement.revive);
		const result = new Grid(o.t, shapes, o.ss, o.ce.fsi, canvas);
		result._shapes = new Map(o.s);
		result._possibleShapeRotations = o.r;
		result._gridColor = RGBColor.revive(o.gc);
		result.cursorAt = o.ca;
		result.cursorColor = o.cc;
		result.background = o.bg;
		result.pattern = o.p ? TilePattern.revive(o.p) : null;
		return result;
	}
	/** returns the xy offset in the viewport for a given grid element */
	public gridXYView(elem: Vector2D, view: Viewport) {
		const u = view.unitSize;
		const x = elem.x;
		const y = elem.y;
		const initX = view.squareLayerX();
		const initY = view.squareLayerY();
		const offX = initX + (x * view.unitSize) + (u - view.x % u);
		const offY = initY + (y * view.unitSize) + (u - view.y % u);
		return new Vector2D(offX, offY);
	}
	private gridX(screenX: number, view: Viewport) {
		const initX = view.squareLayerX();
		return initX + view.squareX(screenX);
	}
	private gridY(screenY: number, view: Viewport) {
		const initY = view.squareLayerY();
		return initY + view.squareY(screenY);
	}
	public renderSVGUse(dims: IGridDimension, res: number, useRes: boolean = true): string[] {
		const result = [] as string[];
		const dx = Math.abs(dims.minX);
		const dy = Math.abs(dims.minY);
		for (const [gridElem, [x, y]] of this._canvas.entries()) {
			let posx = res * (x - dx);
			let posy = res * (y - dy);
			if (dims.minX < 0) {
				posx = res * (x + dx);
			}
			if (dims.minY < 0) {
				posy = res * (y + dy);
			}
			result.push(`
			<use xlink:href="#${gridElem.shapeId}-${gridElem.fillSetId}" x="${posx}" y="${posy}" ${useRes ? `width="${res + 2}" height="${res + 2}"` : ''} transform="scale(${1}) rotate(${gridElem.rotation * 360}, ${posx + res / 2}, ${posy + res / 2})" />
			`);
		}
		return result;
	}
	public dimensions(usePattern: boolean = false): IGridDimension {
		const result = {
			width: undefined,
			height: undefined,
			maxX: undefined,
			maxY: undefined,
			minX: undefined,
			minY: undefined
		} as { width: undefined | number, height: undefined | number, maxX: undefined | number, maxY: undefined | number, minX: undefined | number, minY: undefined | number };
		if (usePattern && this.pattern) {
			return ({
				minX: this.pattern.startX,
				maxX: this.pattern.endX,
				minY: this.pattern.startY,
				maxY: this.pattern.endY,
				width: this.pattern.width,
				height: this.pattern.height
			});
		} else {
			for (const [_, [x, y]] of this._canvas.entries()) {
				if (x === undefined || y === undefined) {
					continue;
				}
				if (result.maxX === undefined || x > result.maxX) {
					result.maxX = x;
				}
				if (result.maxY === undefined || y > result.maxY) {
					result.maxY = y;
				}
				if (result.minX === undefined || x < result.minX) {
					result.minX = x;
				}
				if (result.minY === undefined || y < result.minY) {
					result.minY = y;
				}
			}
			if (result.maxX === undefined || result.maxY === undefined || result.minY === undefined || result.minX === undefined) {
				return { width: 0, height: 0, maxX: 0, maxY: 0, minX: 0, minY: 0 };
			} else {
				let w = 1;
				if (result.maxX !== result.minX) {
					w = Math.abs(result.maxX - result.minX) + 1;
				}
				let h = 1;
				if (result.maxY !== result.minY) {
					h = Math.abs(result.maxY - result.minY) + 1;
				}
				result.width = w;
				result.height = h;
				return({
					maxX: result.maxX,
					minX: result.minX,
					maxY: result.maxY,
					minY: result.minY,
					width: w,
					height: h
				});
			}
		}
	}
	/** returns the layer xy coordinates for the grid element under (absX,absY) */
	public coordsElemAt(absX: number, absY: number, view: Viewport): Vector2D {
		return new Vector2D(this.gridX(absX, view), this.gridY(absY, view));
	}
	public isCursorUpdateNeeded(screenX: number, screenY: number, view: Viewport): boolean {
		const x = this.gridX(screenX, view);
		const y = this.gridY(screenY, view);
		if (this.cursor[0] !== x || this.cursor[1] !== y) {
			view.screenY(y);
		}
		return (this.cursor[0] !== x || this.cursor[1] !== y);
	}
	public updateCursor(absX: number, absY: number, view: Viewport) {
		// TODO: switch(type) here
		const unitSize = view.unitSize;
		this.cursor[0] = this.gridX(absX, view);
		this.cursor[1] = this.gridY(absY, view);
	}
	get cursor(): [number, number] {
		return this.cursorAt;
	}
	private _buildShapes(shapes: ShapeId[]): Map<ShapeId, RotationIndex> {
		const result: Map<ShapeId, RotationIndex> = new Map();
		for (let i = 0; i < shapes.length; i++) {
			result.set(shapes[i], 0);
		}
		return result;
	}
	get gridLineColor(): number[] {
		return this._gridColor.toGL();
	}
	get type() {
		return this._type;
	}
	get shapes() {
		return this._shapes;
	}
	get selectedShape(): number {
		return this._selectedShape;
	}
	get selectedRot(): number {
		return this.getShapeRotation(this._selectedShape);
	}
	public paintElementAt(x: number, y: number) {
		this._canvas.addXY(x, y, this._curElement);
	}
	public deleteElementAt(x: number, y: number) {
		this._canvas.deleteXY(x, y);
	}
	public getElementAt(x: number, y: number): GridElement | undefined {
		return this._canvas.getXY(x, y);
	}
	public getShapeRotation(shapeId: ShapeId): number {
		return this._possibleShapeRotations[this._shapes.get(shapeId) || 0];
	}
	public rotateSelected(): Rotation {
		let rotIndex = this._shapes.get(this._selectedShape);
		if (rotIndex === undefined) {
			throw new Error(`Cannot rotate the shape: selected shape not found ${this._selectedShape}`);
		}
		// find the next rotation index, and get the rotation from the rotations array
		rotIndex = (rotIndex + 1) % this._possibleShapeRotations.length;
		this._shapes.set(this._selectedShape, rotIndex);
		const rot = this._possibleShapeRotations[rotIndex];
		// update the current grid element
		const newElem = new GridElement(this._curElement.shapeId, this._curElement.fillSetId, rot);
		this._curElement = newElem;
		return rot;
	}
	public addNewShape(sid: ShapeId, shapeFillId: ShapeFillSetId): Grid {
		this._shapes.set(sid, 0);
		this.selectShape(sid, shapeFillId);
		return this;
	}
	public selectShape(sid: ShapeId, shapeFillId: ShapeFillSetId): Grid {
		this._selectedShape = sid;
		const rot = this._possibleShapeRotations[this._shapes.get(sid) || 0];
		this._curElement = new GridElement(sid, shapeFillId, rot);
		return this;
	}
	public selectFill(fid: ShapeFillSetId): Grid {
		const newElem = new GridElement(this._curElement.shapeId, fid, this._curElement.rotation);
		this._curElement = newElem;
		return this;
	}
	/** Clears this layer, removes all GridElements from the canvas */
	public clear(): Grid {
		this._canvas.clear();
		return this;
	}
}
