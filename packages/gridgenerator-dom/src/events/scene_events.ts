import {
  FatState,
  ToolsMenuId,
  Vector2D,
  Viewport,
  UICursor
} from "gridgenerator-data";
import {} from "../../";
import {
  ClipSpace,
  Runtime,
  ScenePainter,
  WebGLContext
} from "gridgenerator-engine";
import { IEventHandler, UpdateAction } from "../common";
import { Refresher } from "./refresher";

const enum SceneAction {
  Paint = 100,
  Delete,
  DeleteFill,
  Move,
  Zoom
}
// the args for each sceneEvents function are the ones passed from the vdom
export class SceneEvents implements IEventHandler {
  private curAction: SceneAction | null;
  private startMove: Vector2D | null;
  private startZoom: Vector2D | null;
  private pointZoom: Vector2D | null;
  private viewportZoom: Vector2D | null;
  private startZoomSize: number | null;
  private t1Start: Touch | null;
  private t2Start: Touch | null;
  private scene: ScenePainter | null;
  public runtime: Runtime;
  private _state: FatState;
  public refresher: Refresher;
  private stopAction: () => void;
  private redraw: () => void;
  public onWebGLInit: (ctx: WebGLContext) => Promise<void>;
  public onCursorMove: (x: number, y: number) => void;
  public onGridAction: (x: number, y: number) => void; // x and y are screen space coordinates
  public onMouseUp: (e: MouseEvent) => void;
  public onMouseMove: (e: MouseEvent) => void;
  public onMouseDown: (e: MouseEvent) => void;
  public onTouchStart: (e: TouchEvent) => void;
  public onTouchMove: (e: TouchEvent) => void;
  public onTouchEnd: (e: TouchEvent) => void;
  public onTouchCancel: (e: TouchEvent) => void;
  public onZoomIn: (e: Event) => void;
  public onZoomOut: (e: Event) => void;
  public openCols: (onDone: () => void) => void;
  public closeCols: (onDone: () => void) => void;
  public onRedraw: (onDone: () => void) => void;
  public onGridToggle: (e: Event) => void;
  public reset: () => void;
  private _sqrsPerLine: number;
  constructor(rt: Runtime, s: FatState, refresher: Refresher) {
    this.curAction = null;
    this.runtime = rt;
    this._state = s;
    this.refresher = refresher;
    this.scene = null;
    this._sqrsPerLine = Math.ceil(
      this.runtime.width / s.current.viewport.unitSize
    );
    this.onWebGLInit = (ctx: WebGLContext) => {
      Runtime.setWebGLCtx(
        this.runtime,
        ctx,
        this._state.current.viewport.maxSize
      );
      return Runtime.resetClipSpace(this.runtime, s.current).then(
        (_rt: Runtime) => {
          this.refresher.refreshRuntimeOnly(_rt);
          this.paintersInit();
        },
        error =>
          // tslint:disable-next-line:no-console
          console.error(error)
      );
    };
    this.redraw = () => {
      this.refresher.refreshRuntimeOnly(this.runtime);
      if (!this.scene) {
        throw new Error("Cannot paint: no webgl scene present");
      }
      if (!this.runtime.textures) {
        throw new Error("Cannot paint: not runtime textures present");
      }
      this.scene.redraw(
        this.runtime.textures,
        this.runtime.clipSpace,
        this._state.current
      );
    };
    this.openCols = (onDone?: () => void) => {
      if (!this.scene) {
        throw new Error("Trying to open columns without a created scene");
      }
      this.scene.openCols(this._state.current, onDone);
    };
    this.closeCols = (onDone?: () => void) => {
      if (!this.scene) {
        throw new Error("Trying to close columns without a created scene");
      }
      this.scene.closeCols(this._state.current, onDone);
    };
    this.onRedraw = (onDone?: () => void) => {
      if (!this.scene) {
        throw new Error("Trying to redraw scene without a created scene");
      }
      if (!this.runtime.textures) {
        throw new Error("Trying to redraw scene without textures");
      }
      this.scene.redraw(
        this.runtime.textures,
        this.runtime.clipSpace,
        this._state.current
      );
      if (onDone) {
        onDone();
      }
    };
    this.onTouchStart = (e: TouchEvent) => {
      // console.log('START', e);
      this.t1Start = e.touches.item(0);
      // decide what kind of action this is
      if (e.touches.length > 1) {
        this.t2Start = e.touches.item(1);
        // ^ start ZOOM action
      } else if (e.touches.length === 1) {
        // start MOVE
        // OR PAINT/DELETE(if curAction is not changed with a TouchMove)
        if (this._state.current.ui.currentTool === ToolsMenuId.Delete) {
          this.curAction = SceneAction.Delete;
        }
      } else {
        // unknown action, do nothing
        this.t1Start = null;
        this.t2Start = null;
        return;
      }
    };
    this.onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t1 = e.touches.item(0);
      if (!t1 || !this.t1Start) {
        return;
      }
      if (e.touches.length > 1) {
        const t2 = e.touches.item(1);
        if (!t2 || !this.t2Start) {
          return;
        }
        // find the zoom center point (the position to zoom at)
        const vx = t2.clientX - t1.clientX;
        const vy = t2.clientY - t1.clientY;
        const vlen = Math.hypot(vx, vy);
        const svx = this.t2Start.clientX - this.t1Start.clientX;
        const svy = this.t2Start.clientY - this.t1Start.clientY;
        const svlen = Math.hypot(svx, svy);
        const diffLen = vlen - svlen;
        const zoomMidX = t1.clientX + (t2.clientX - t1.clientX) / 2;
        const zoomMidY = t1.clientY + (t2.clientY - t1.clientY) / 2;
        this.curAction = SceneAction.Zoom;
        this.zoom(zoomMidX, t2.clientY, -1);
        // ^ -1 to invert zoom (zooming out should be zooming in insted)
      } else {
        this.curAction = SceneAction.Move;
        this.move(t1.clientX, t1.clientY);
      }
      // console.log('MOVE', e);
    };
    this.onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (
        this.curAction !== SceneAction.Move &&
        this.curAction !== SceneAction.Zoom &&
        this.t1Start
      ) {
        this.onGridAction(this.t1Start.clientX, this.t1Start.clientY);
      }
      this.stopAction();
    };
    this.onTouchCancel = (e: TouchEvent) => {
      this.stopAction();
    };
    this.stopAction = () => {
      if (this.curAction === SceneAction.Zoom) {
        this._state.sceneStopZoom();
        this.refresher.refreshDOMOnly();
      }
      this.curAction = null;
      this.startMove = null;
      this.startZoom = null;
      this.t1Start = null;
      this.t2Start = null;
    };
    this.onMouseUp = (e: MouseEvent) => {
      this.stopAction();
      // update mouse cursor if needed
      this.updateMouseIcon(e.clientX, e.clientY);
    };
    this.onMouseDown = (e: MouseEvent) => {
      // set the state for the grid action
      // painting is not set here (because it can also have a delete action if
      // trying to paint on the same fill)
      if (this._state.current.ui.currentTool === ToolsMenuId.Delete) {
        this.curAction = SceneAction.Delete;
      } else if (this._state.current.ui.currentTool === ToolsMenuId.Move) {
        this.curAction = SceneAction.Move;
        this.move(e.clientX, e.clientY);
      } else if (this._state.current.ui.currentTool === ToolsMenuId.Zoom) {
        this.curAction = SceneAction.Zoom;
        this.zoom(e.clientX, e.clientY);
      }
      this.onGridAction(e.clientX, e.clientY);
    };
    this.onMouseMove = (e: MouseEvent) => {
      if (e.buttons === 1 || (e.buttons === undefined && e.which === 1)) {
        if (this.curAction === SceneAction.Move) {
          this.move(e.clientX, e.clientY);
        } else if (this.curAction === SceneAction.Zoom) {
          this.zoom(e.clientX, e.clientY);
        } else {
          this.onGridAction(e.clientX, e.clientY);
        }
      } else {
        this.onCursorMove(e.clientX, e.clientY);
      }
    };
    this.onGridAction = (screenX: number, screenY: number) => {
      // calculate the layer x, y pos
      const view = this._state.current.viewport;
      this.updateCursor(screenX, screenY, view);
      const cursor = this._state.current.currentLayer.cursor;
      const layerX = cursor[0];
      const layerY = cursor[1];
      // get the selected shape id and shape fill set it
      const grid = this._state.current.currentLayer;
      const shapeId = grid.selectedShape;
      const shapeFillId = this._state.current.selectedShape.selectedFillSet;
      const rot = grid.getShapeRotation(shapeId);
      const layerElem = grid.getElementAt(layerX, layerY);
      // conditions to check the action to perform
      const isElemDiff =
        !layerElem ||
        layerElem.shapeId !== shapeId ||
        layerElem.fillSetId !== shapeFillId ||
        layerElem.rotation !== rot;
      const isElemEq =
        layerElem &&
        layerElem.shapeId === shapeId &&
        layerElem.fillSetId === shapeFillId &&
        layerElem.rotation === rot;
      // console.log(`GRID (${layerX}, ${layerY})`, isElemDiff, isElemEq, this.curAction);
      // Actions are performed bellow:
      if (
        isElemDiff &&
        (this.curAction === null || this.curAction === SceneAction.Paint)
      ) {
        this.paintAt(
          screenX,
          screenY,
          layerX,
          layerY,
          shapeId,
          shapeFillId,
          rot
        );
        // } else if (isElemEq && (this.curAction === null || this.curAction === SceneAction.DeleteFill)) {
      } else if (isElemEq && this.curAction === null) {
        // delete while painting (only the current fill is deleted)
        // this.curAction = SceneAction.DeleteFill;
        // this.deleteAt(screenX, screenY, layerX, layerY, shapeId, shapeFillId);
        this.rotateAt(screenX, screenY, layerX, layerY, shapeId, shapeFillId);
      } else if (this.curAction === SceneAction.Delete) {
        // delete
        this.curAction = SceneAction.Delete;
        this.deleteAt(screenX, screenY, layerX, layerY, shapeId, shapeFillId);
      } else {
        // console.log('NOTHING');
      }
    };
    this.onZoomIn = e => {
      e.preventDefault();
      this.clickZoom(1);
    };
    this.onZoomOut = e => {
      e.preventDefault();
      this.clickZoom(-1);
    };
    this.onCursorMove = (absX: number, absY: number) => {
      if (!this.scene) {
        return;
      }
      const view = this._state.current.viewport;
      const updated = this.updateCursor(absX, absY, view);
      if (updated) {
        const sqIndex = ClipSpace.gridIndex(
          absX,
          absY,
          view,
          this.runtime.width
        );
        this.scene.cursorMove(sqIndex);
        // update mouse cursor if needed
        this.updateMouseIcon(absX, absY);
      }
    };
    this.reset = () => {
      if (this.scene && this.runtime.textures) {
        // this.scene.shader.layers.sqgrid.textureIdsChanged = true;
        // this.scene.shader.layers.sqgrid.shapeTextures = this.runtime.textures;
        this.scene.redraw(
          this.runtime.textures,
          this.runtime.clipSpace,
          this.state.current
        );
      } else {
        this.paintersInit();
      }
    };
    this.onGridToggle = e => {
      e.preventDefault();
      this.state.sceneToggleGrid();
      if (this.scene) {
        this.scene.gridLines(this.state.current.ui.toolsSubmenus.isGridVisible);
      }
      this.refresher.refreshStateAndDOM(this.state);
    };
  }
  get state() {
    return this._state;
  }
  set state(s: FatState) {
    this._state = s;
    if (this.scene) {
      this.scene.state = s.current;
    }
  }
  private updateMouseIcon(absX: number, absY: number) {
    const view = this._state.current.viewport;
    const grid = this._state.current.currentLayer;
    const shapeId = grid.selectedShape;
    const shapeFillId = this._state.current.selectedShape.selectedFillSet;
    const rot = grid.getShapeRotation(shapeId);
    const x = view.squareLayerX() + view.squareX(absX);
    const y = view.squareLayerY() + view.squareY(absY);
    const layerElem = grid.getElementAt(x, y);
    // conditions to check the action to perform
    const isElemDiff =
      !layerElem ||
      layerElem.shapeId !== shapeId ||
      layerElem.fillSetId !== shapeFillId ||
      layerElem.rotation !== rot;
    const isElemEq =
      layerElem &&
      layerElem.shapeId === shapeId &&
      layerElem.fillSetId === shapeFillId &&
      layerElem.rotation === rot;
    // isElemEq can be undefined
    const toolId = this._state.current.ui.currentTool;
    const canRotate =
      toolId !== ToolsMenuId.Move &&
      toolId !== ToolsMenuId.Delete &&
      toolId !== ToolsMenuId.Zoom;
    if (isElemEq && canRotate) {
      // set cursor to rotation
      if (this._state.current.ui.cursorHandler.cursor !== UICursor.Rotate) {
        this._state.hudMouseCursorRotate();
        this.refresher.refreshStateAndDOM(this._state);
      }
    } else {
      const ui = this._state.current.ui;
      if (ui.cursorHandler.cursor !== ui.currentToolMouseIcon()) {
        this._state.hudMouseCursorFromTool();
        this.refresher.refreshStateAndDOM(this._state);
      }
    }
  }
  /** Updates cursor if necessary, returns true if an update was done */
  private updateCursor(
    screenX: number,
    screenY: number,
    view: Viewport
  ): boolean {
    const needsCursorUpdate = this._state.current.currentLayer.isCursorUpdateNeeded(
      screenX,
      screenY,
      view
    );
    if (needsCursorUpdate) {
      this._state.sceneCursor(screenX, screenY);
    }
    return needsCursorUpdate;
  }
  private paintersInit() {
    // check if all the contexts are available
    if (!this.runtime.webglCtx || !this.runtime.textures) {
      return;
    }
    if (this.scene) {
      // TODO: clear the buffers before initializing it again
    }
    this.scene = new ScenePainter(
      this.runtime.webglCtx,
      this._state.current,
      this.runtime.textures,
      this.runtime.clipSpace
    );
    this.scene.init();
  }
  private paintAt(
    x: number,
    y: number,
    layerX: number,
    layerY: number,
    shapeId: number,
    shapeFillId: number,
    rot: number
  ) {
    // console.log('PAINTING AT', layerX, layerY, 'WITH:', shapeId, shapeFillId, rot);
    this.curAction = SceneAction.Paint;
    this._state.scenePaint(layerX, layerY);
    const sqIndex = ClipSpace.gridIndex(
      x,
      y,
      this._state.current.viewport,
      this.runtime.width
    );
    if (!this.runtime.textures) {
      throw new Error("Cannot paint: not runtime textures present");
    }
    // check for pattern (which requires a reset to the clipspace)
    if (this.state.current.currentLayer.pattern) {
      this.runtime.clipSpace.fromGrid(
        this.state.current.viewport,
        this.state.current.currentLayer,
        this.runtime.textures,
        this.state.current.isPatternOn
      );
      this.redraw();
      this.refresher.refreshRuntimeOnly(this.runtime);
    } else {
      this.runtime.clipSpace.paintAt(
        sqIndex,
        shapeId,
        shapeFillId,
        rot,
        this.runtime.textures
      );
      this.redraw();
    }
  }
  private rotateAt(
    x: number,
    y: number,
    layerX: number,
    layerY: number,
    shapeId: number,
    shapeFillId: number
  ) {
    this._state.hudRotateShape();
    this.refresher.refreshStateAndDOM(this.state);
    const grid = this._state.current.currentLayer;
    this.paintAt(
      x,
      y,
      layerX,
      layerY,
      shapeId,
      shapeFillId,
      grid.getShapeRotation(shapeId)
    );
  }
  private deleteAt(
    x: number,
    y: number,
    layerX: number,
    layerY: number,
    shapeId: number,
    shapeFillId: number
  ) {
    this._state.sceneDelete(layerX, layerY);
    const sqIndex = ClipSpace.gridIndex(
      x,
      y,
      this._state.current.viewport,
      this.runtime.width
    );
    if (!this.runtime.textures) {
      throw new Error("Cannot delete: not runtime textures present");
    }
    // check for pattern (which requires a reset to the clipspace)
    if (this.state.current.currentLayer.pattern) {
      this.runtime.clipSpace.fromGrid(
        this.state.current.viewport,
        this.state.current.currentLayer,
        this.runtime.textures,
        this.state.current.isPatternOn
      );
      this.redraw();
      this.refresher.refreshRuntimeOnly(this.runtime);
    } else {
      this.runtime.clipSpace.deleteAt(
        sqIndex,
        shapeId,
        shapeFillId,
        this.runtime.textures
      );
      this.redraw();
    }
  }
  private move(x: number, y: number) {
    if (!this.startMove) {
      this.startMove = new Vector2D(x, y);
      return;
    }
    if (this.scene) {
      this.scene.hideCursor();
    }
    this._state.sceneMove(x - this.startMove.x, y - this.startMove.y);
    // this.refresher.refreshStateOnly(this._state);
    if (this._state.current.isPatternOn) {
      this.refresher.refreshStateAndDOM(this._state, UpdateAction.Pan);
      if (!this.runtime.textures) {
        return;
      }
      this.runtime.clipSpace.fromGrid(
        this.state.current.viewport,
        this.state.current.currentLayer,
        this.runtime.textures,
        this.state.current.isPatternOn
      );
      this.redraw();
    } else {
      this.refresher.refreshStateOnly(this._state);
      Runtime.resetClipSpace(this.runtime, this._state.current, true).then(
        (_rt: Runtime) => {
          this.runtime = _rt;
          this.refresher.refreshRuntimeOnly(_rt);
          this.redraw();
        }
      );
    }
    this.startMove = new Vector2D(x, y);
  }
  private clickZoom(mult: number) {
    // zoom into the middle of the screen
    let midX = this.runtime.device.width / 2;
    let midY = this.runtime.device.height / 2;
    // initialize the zoom metadata
    const v = this._state.current.viewport;
    if (!this.state.current.ui.isZooming) {
      this.startZoom = new Vector2D(midX, midY);
      this.pointZoom = new Vector2D(v.x + midX, v.y + midY);
      this.viewportZoom = new Vector2D(v.x, v.y);
      this.startZoomSize = v.unitSize;
      this.state.sceneStartZoom();
      this.refresher.refreshStateOnly(this.state);
    } else if (this.startZoom) {
      midX = this.startZoom.x;
      midY = this.startZoom.y;
    }
    // the zoom ammount in pixels
    let inc = 8;
    const normalSize = this.startZoomSize || 64;
    if (v.unitSize > normalSize) {
      inc = inc * (v.unitSize / normalSize);
    }
    let zoomAmmount = 0;
    if (mult < 0) {
      // zooming out
      zoomAmmount = -inc * 2;
    } else {
      // zooming in
      zoomAmmount = inc * 2;
    }
    // console.log('FROM ', v.unitSize, 'AMMOUNT,', zoomAmmount);
    this.zoom(midX - zoomAmmount, midY - zoomAmmount);
  }
  private zoom(x: number, y: number, mult: number = 1) {
    const v = this._state.current.viewport;
    const l = this._state.current.currentLayer;
    const w = this.runtime.width;
    const h = this.runtime.height;
    if (!this.startZoom || !this.state.current.ui.isZooming) {
      this.startZoom = new Vector2D(x, y);
      this.pointZoom = new Vector2D(v.x + x, v.y + y);
      this.viewportZoom = new Vector2D(v.x, v.y);
      this.state.sceneStartZoom();
      this.refresher.refreshStateOnly(this.state);
      return;
    }
    if (!this.viewportZoom || !this.startZoom || !this.pointZoom) {
      return;
    }
    const ammount = mult * (y - this.startZoom.y);
    if (ammount > 0 && v.unitSize - ammount < v.minSize) {
      return;
    } else if (ammount < 0 && v.unitSize + Math.abs(ammount) > v.maxSize) {
      return;
    }
    const px = this.pointZoom.x;
    const py = this.pointZoom.y;
    const cx = v.x + w / 2;
    const cy = v.y + h / 2;
    const ovx = this.viewportZoom.x;
    const ovy = this.viewportZoom.y;
    this._state.sceneZoom(px, py, -ammount, cx, cy, ovx, ovy);
    this.refresher.refreshStateOnly(this._state);
    this.startZoom = new Vector2D(x, y);
    // check for pattern (which requires a reset to the clipspace)
    if (this.state.current.currentLayer.pattern && this.runtime.textures) {
      this.runtime.clipSpace.fromGrid(
        this.state.current.viewport,
        this.state.current.currentLayer,
        this.runtime.textures,
        this.state.current.isPatternOn
      );
      this.redraw();
      this.refresher.refreshAll(this.runtime, this._state);
    } else {
      Runtime.resetClipSpace(this.runtime, this._state.current, true).then(
        (_rt: Runtime) => {
          this.refresher.refreshAll(_rt, this._state);
          this.redraw();
        }
      );
    }
  }
  get _scene() {
    return this.scene;
  }
}
